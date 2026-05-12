<template>
  <div class="yanjing-map-container">
    <div id="map-container" ref="mapContainer"></div>

    <!-- 位置警告弹窗 -->
    <transition name="fade-scale-up">
      <div class="location-warning" v-if="showLocationWarning" @click.self="dismissWarning">
        <div class="warning-card">
          <div class="warning-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3>当前位置不在达州研学范围内</h3>
          <p>检测到您位于 {{ userCity || '其他地区' }}，研景系统将自动切换到达州市中心坐标进行演示。</p>
          <p class="warning-hint">提示：实际使用时请确保GPS已开启并授权位置权限</p>
          <button class="confirm-btn" @click="dismissWarning">我知道了</button>
        </div>
      </div>
    </transition>

    <!-- 模型规划中弹窗 -->
    <transition name="fade-scale-up">
      <div class="planning-modal" v-if="store.isPlanning">
        <div class="planning-content">
          <div class="planning-wave-container">
            <svg viewBox="0 0 200 50" class="wave-svg">
              <path class="wave-path"
                    d="M0,25 Q25,10 50,25 T100,25 T150,25 T200,25"
                    fill="none"
                    stroke="#c9a55a"
                    stroke-width="2"
                    stroke-linecap="round"/>
            </svg>
            <div class="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>

          <h3 class="planning-title">正在规划最优路线</h3>
          <p class="planning-subtitle">AI正在分析 {{ store.pois.length }} 个景点并计算最佳路径</p>

          <div class="planning-steps">
            <div class="step" :class="{ active: planningStep >= 1, done: planningStep > 1 }">
              <span class="step-num">1</span>
              <span>分析景点</span>
            </div>
            <div class="step" :class="{ active: planningStep >= 2, done: planningStep > 2 }">
              <span class="step-num">2</span>
              <span>计算路径</span>
            </div>
            <div class="step" :class="{ active: planningStep >= 3 }">
              <span class="step-num">3</span>
              <span>生成路线</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 地图控制按钮 -->
    <div class="map-controls" v-if="!store.isPlanning && !store.planningResult">
      <button class="plan-btn" @click="handlePlanRoute" :disabled="store.isPlanning">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
        </svg>
        智能规划路线
      </button>
    </div>

    <!-- 规划完成信息 -->
    <transition name="slide-down">
      <div class="route-info-card" v-if="store.planningResult && !store.isPlanning">
        <div class="route-header">
          <span class="route-badge">最优路线</span>
          <span class="route-stats">{{ store.planningResult.selectedPOIs.length }}站 · {{ store.planningResult.totalTime }}分钟 · {{ (store.planningResult.totalDistance/1000).toFixed(1) }}km</span>
        </div>
        <div class="route-score">
          综合评分 <strong>{{ store.planningResult.totalScore }}</strong>
        </div>
      </div>
    </transition>

    <!-- 演示模式指示器 -->
    <div v-if="!map && mapReady" class="demo-indicator">
      <span class="demo-icon">📍</span>
      <span>演示模式</span>
    </div>

    <!-- 加载遮罩 -->
    <div class="loading-overlay" v-if="!mapReady && !store.isPlanning">
      <div class="loading-spinner"></div>
      <span>地图初始化中...</span>
    </div>

    <!-- 记忆粒子 -->
    <MemoryParticles />

    <!-- AI导师 -->
    <AITutor />

    <!-- 位置警告弹窗 -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useYanJingStore } from '../stores/useYanJingStore'
import AMapLoader from '@amap/amap-jsapi-loader'
import MemoryParticles from './MemoryParticles.vue'
import AITutor from './AITutor.vue'

declare global {
  interface Window {
    AMap: any
  }
}

const store = useYanJingStore()
const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
let driving: any = null
let markers: any[] = []
let userMarker: any | null = null
let routeLine: any | null = null
let fenceCircle: any | null = null
let infoWindow: any | null = null
const mapReady = ref(false)
const showLocationWarning = ref(false)
const userCity = ref('')
const planningStep = ref(0)
let planningTimer: number | null = null

const DAZHOU_BOUNDS = {
  minLng: 106.5,
  maxLng: 108.8,
  minLat: 30.2,
  maxLat: 32.5
}
const DAZHOU_CENTER: [number, number] = [107.5035, 31.2159]

onMounted(async () => {
  await initMap()
})

onUnmounted(() => {
  if (planningTimer) clearInterval(planningTimer)
  if (map) {
    map.destroy()
    map = null
  }
})

watch(() => store.isPlanning, (val) => {
  if (val) {
    startPlanningAnimation()
  }
})

watch(() => store.planningResult, (newResult) => {
  if (newResult && newResult.selectedPOIs.length > 0 && map) {
    renderDrivingRoute(newResult)
  }
}, { deep: true })

async function initMap(): Promise<void> {
  const loadWithTimeout = async (): Promise<any> => {
    try {
      const AMap = await AMapLoader.load({
        key: 'f485e10206e13b4eaedbbf85dd692554',
        version: '2.0',
        plugins: ['AMap.Geolocation', 'AMap.Geocoder', 'AMap.Driving', 'AMap.Scale'],
        AMapSecurityConfig: {
          securityJsCode: '2365dcb4a51239110cebc37a1779ba08'
        }
      })
      return AMap
    } catch (e) {
      console.error('[YanJingMap] AMap加载器错误:', e)
      throw e
    }
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('地图加载超时，请检查网络连接')), 15000)
  })

  try {
    const AMap = await Promise.race([loadWithTimeout(), timeoutPromise])

    if (!AMap) {
      throw new Error('AMap为空')
    }

    window.AMap = AMap

    map = new AMap.Map('map-container', {
      zoom: 13,
      center: DAZHOU_CENTER,
      mapStyle: 'amap://styles/dark',
      viewMode: '2D',
      showLabel: true,
      features: ['bg', 'road', 'building', 'point', 'roadarrow'],
      zooms: [10, 18]
    })

    driving = new AMap.Driving({
      policy: AMap.DrivingPolicy.LEAST_TIME,
      ferry: 1,
      isAutoSetView: false
    })

    await locateUser()
    renderPOIMarkers()

    map.on('complete', () => {
      console.log('[YanJingMap] 地图加载完成')
      mapReady.value = true
    })

    map.on('click', () => {
      if (infoWindow) {
        infoWindow.close()
      }
    })

    setTimeout(() => {
      if (!mapReady.value) {
        console.log('[YanJingMap] 强制完成初始化')
        mapReady.value = true
      }
    }, 8000)

  } catch (error) {
    console.error('[YanJingMap] 地图初始化失败:', error)
    mapReady.value = true
  }
}

async function locateUser(): Promise<void> {
  const geolocation = new window.AMap.Geolocation({
    enableHighAccuracy: true,
    timeout: 8000,
    showButton: false,
    showMarker: false,
    zoomToAccuracy: false
  })

  geolocation.getCurrentPosition(async (status: string, result: any) => {
    if (status === 'complete' && result.position) {
      const lng = result.position.lng
      const lat = result.position.lat

      store.updateLocation('A', lng, lat)
      store.profileA.location = [lng, lat]

      const isInRange = checkIfInDazhou(lng, lat)

      if (!isInRange) {
        try {
          const cityResult = await reverseGeocode(lng, lat)
          userCity.value = cityResult.city || cityResult.province || '未知区域'
        } catch (e) {
          userCity.value = '当前位置'
        }
        showLocationWarning.value = true
      }

      addUserMarker([lng, lat], isInRange)

      if (isInRange && map) {
        map.setCenter([lng, lat])
      }
    } else {
      addUserMarker(DAZHOU_CENTER, true)
      showLocationWarning.value = true
      userCity.value = '无法获取'
    }
  }, () => {
    addUserMarker(DAZHOU_CENTER, true)
    showLocationWarning.value = true
    userCity.value = '定位失败'
  })
}

function reverseGeocode(lng: number, lat: number): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!window.AMap) return resolve({})

    const geocoder = new window.AMap.Geocoder()
    geocoder.getAddress([lng, lat], (status: string, result: any) => {
      if (status === 'complete' && result.regeocode) {
        const addressComponent = result.regeocode.addressComponent
        resolve(addressComponent)
      } else {
        reject(new Error('逆地理编码失败'))
      }
    })
  })
}

function checkIfInDazhou(lng: number, lat: number): boolean {
  return (
    lng >= DAZHOU_BOUNDS.minLng &&
    lng <= DAZHOU_BOUNDS.maxLng &&
    lat >= DAZHOU_BOUNDS.minLat &&
    lat <= DAZHOU_BOUNDS.maxLat
  )
}

function dismissWarning(): void {
  showLocationWarning.value = false
  if (map && !userMarker) {
    addUserMarker(DAZHOU_CENTER, true)
  }
}

function addUserMarker(position: [number, number], isDefault: boolean): void {
  if (!map || !window.AMap) return

  if (userMarker) {
    userMarker.setMap(null)
  }

  const markerContent = `
    <div style="
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(74, 144, 217, 0.95), rgba(59, 130, 246, 0.95));
      border: 3px solid rgba(255, 255, 255, 0.95);
      box-shadow:
        0 0 0 4px rgba(74, 144, 217, 0.15),
        0 4px 20px rgba(0, 0, 0, 0.35),
        inset 0 2px 4px rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <div style="
        width: 14px;
        height: 14px;
        background: #fff;
        border-radius: 50%;
        animation: pulse-user 2s ease-in-out infinite;
      "></div>
      <div style="
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-top: 8px solid rgba(255, 255, 255, 0.95);
      "></div>
    </div>
    <style>
      @keyframes pulse-user {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.4); opacity: 0.6; }
      }
    </style>
  `

  userMarker = new window.AMap.Marker({
    position: position,
    content: markerContent,
    offset: new window.AMap.Pixel(-22, -44),
    zIndex: 200,
    title: isDefault ? '默认位置（达州市中心）' : '您的位置'
  })

  userMarker.setMap(map)

  if (isDefault) {
    store.updateLocation('A', position[0], position[1])
    store.profileA.location = position
  }
}

function renderPOIMarkers(): void {
  if (!map || !window.AMap) return

  markers.forEach(m => m.remove())
  markers = []

  const typeConfig: Record<string, { color: string; label: string; icon: string }> = {
    red: {
      color: '#c94a4a',
      label: '红',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
    },
    nature: {
      color: '#4a8c6e',
      label: '景',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95 3.32L17 23l10.34 2.68.95-3.32 1.89-.66C28.1 16.17 26 10 17 8z"/><path d="M17 8c-2.37 0-4.47-.58-6.33-1.51m6.33 1.51c3.93 1.27 6.67 4.42 7.83 8.49M17 8c2.37 0 4.47.58 6.33 1.51"/></svg>`
    },
    culture: {
      color: '#c9a55a',
      label: '文',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>`
    }
  }

  store.pois.forEach(poi => {
    const config = typeConfig[poi.type]

    const markerContent = `
      <div class="poi-marker-wrapper" data-poi-id="${poi.id}" style="
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      ">
        <div style="
          width: 38px;
          height: 38px;
          border-radius: 50% 50% 50% 4px;
          background: linear-gradient(145deg, ${config.color}dd, ${config.color});
          border: 2.5px solid rgba(255, 255, 255, 0.85);
          box-shadow:
            0 4px 16px ${config.color}40,
            inset 0 2px 4px rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          position: relative;
        ">
          ${config.icon}
        </div>
        <div style="
          position: absolute;
          left: 50%;
          top: calc(100% + 6px);
          transform: translateX(-50%);
          padding: 3px 9px;
          background: rgba(18, 18, 22, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          color: #f1f5f9;
          font-size: 10.5px;
          white-space: nowrap;
          opacity: 0;
          transition: all 0.25s ease;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        ">${poi.name}</div>
      </div>
      <style>
        .poi-marker-wrapper:hover .poi-marker-wrapper > div:first-child {
          transform: scale(1.15) translateY(-4px);
          box-shadow: 0 8px 24px ${config.color}60, inset 0 2px 4px rgba(255, 255, 255, 0.25);
        }
        .poi-marker-wrapper:hover div[style*='position: absolute'] {
          opacity: 1;
          transform: translateX(-50%) translateY(4px);
        }
      </style>
    `

    const marker = new window.AMap.Marker({
      position: [poi.lng, poi.lat],
      content: markerContent,
      offset: new window.AMap.Pixel(-19, -38),
      zIndex: 110,
      title: poi.name,
      extData: { poiId: poi.id, poi }
    })

    marker.on('click', () => {
      showPOICard(marker, poi)
    })

    marker.setMap(map)
    markers.push(marker)
  })
}

function showPOICard(marker: any, poi: any): void {
  if (!window.AMap || !map) return

  const config: Record<string, { color: string; typeName: string }> = {
    red: { color: '#c94a4a', typeName: '红色文化' },
    nature: { color: '#4a8c6e', typeName: '自然风光' },
    culture: { color: '#c9a55a', typeName: '人文历史' }
  }

  const cfg = config[poi.type]
  const cardHtml = `
    <div style="
      width: 260px;
      background: #1a1a1f;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    ">
      <div style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #f1f5f9;">${poi.name}</h3>
          <span style="padding: 3px 8px; background: ${cfg.color}18; border-radius: 4px; font-size: 11px; color: ${cfg.color};">${cfg.typeName}</span>
        </div>

        <p style="margin: 0 0 12px 0; font-size: 12.5px; color: rgba(203, 213, 225, 0.65); line-height: 1.6;">${poi.description || '达州重要文化地标'}</p>

        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <span style="padding: 4px 10px; background: rgba(201, 165, 90, 0.08); border-radius: 4px; font-size: 11.5px; color: #c9a55a;">${poi.timeCost}分钟</span>
          <span style="padding: 4px 10px; background: rgba(74, 222, 128, 0.08); border-radius: 4px; font-size: 11.5px; color: #86eeac;">${poi.weatherSensitive ? '室内' : '户外'}</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; padding: 10px; background: rgba(255, 255, 255, 0.02); border-radius: 8px; margin-bottom: 14px;">
          <div style="text-align: center;"><div style="font-size: 13px; font-weight: 600; color: ${cfg.color};">${(poi.eduTags.history * 100).toFixed(0)}</div><div style="font-size: 9.5px; color: rgba(148,163,184,0.45);">历史</div></div>
          <div style="text-align: center;"><div style="font-size: 13px; font-weight: 600; color: #4a90d9;">${(poi.eduTags.logic * 100).toFixed(0)}</div><div style="font-size: 9.5px; color: rgba(148,163,184,0.45);">逻辑</div></div>
          <div style="text-align: center;"><div style="font-size: 13px; font-weight: 600; color: #4ade80;">${(poi.eduTags.empathy * 100).toFixed(0)}</div><div style="font-size: 9.5px; color: rgba(148,163,184,0.45);">共情</div></div>
          <div style="text-align: center;"><div style="font-size: 13px; font-weight: 600; color: #c9a55a;">${(poi.eduTags.attention * 100).toFixed(0)}</div><div style="font-size: 9.5px; color: rgba(148,163,184,0.45);">专注</div></div>
        </div>

        <button onclick="window.dispatchEvent(new CustomEvent('poi-recommend', { detail: '${poi.id}' }))" style="
          width: 100%;
          padding: 10px;
          background: ${cfg.color}15;
          border: 1px solid ${cfg.color}25;
          border-radius: 6px;
          color: ${cfg.color};
          font-size: 12.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        ">加入行程规划</button>
      </div>
    </div>
  `

  if (infoWindow) {
    infoWindow.close()
  }

  infoWindow = new window.AMap.InfoWindow({
    content: cardHtml,
    offset: new window.AMap.Pixel(0, -50),
    closeWhenClickMap: true
  })

  infoWindow.open(map, marker.getPosition())
}

async function handlePlanRoute(): Promise<void> {
  await store.planRoute(360)
}

function startPlanningAnimation(): void {
  planningStep.value = 0
  let step = 0
  const steps = [800, 1800, 2600]

  planningTimer = window.setInterval(() => {
    step++
    if (step <= 3) {
      planningStep.value = step
    }
    if (step > 4) {
      if (planningTimer) clearInterval(planningTimer)
    }
  }, 900)
}

function renderDrivingRoute(result: any): void {
  if (!map || !driving || !window.AMap) return

  if (routeLine) {
    routeLine.setMap(null)
    routeLine = null
  }
  if (fenceCircle) {
    fenceCircle.setMap(null)
    fenceCircle = null
  }

  const waypoints = result.route.slice(1, -1).map((pos: number[]) =>
    new window.AMap.LngLat(pos[0], pos[1])
  )

  const start = result.route[0]
  const end = result.route[result.route.length - 1]

  driving.search(
    new window.AMap.LngLat(start[0], start[1]),
    new window.AMap.LngLat(end[0], end[1]),
    {
      waypoints: waypoints,
      isOutline: true,
      outlineColor: '#4a90d920',
      autoFitView: true
    },
    (status: string, data: any) => {
      if (status === 'complete') {
        const path = data.routes[0]?.steps?.flatMap((step: any) =>
          step.path.map((p: any[]) => [p.getLng(), p.getLat()])
        ) || []

        if (path.length > 0) {
          routeLine = new window.AMap.Polyline({
            path: path,
            strokeColor: '#4a90d9',
            strokeWeight: 5,
            strokeOpacity: 0.88,
            strokeStyle: 'solid',
            lineJoin: 'round',
            lineCap: 'round',
            showDir: true,
            zIndex: 60,
            isOutline: true,
            outlineColor: '#ffffff',
            outlineWidth: 2
          })
          routeLine.setMap(map)

          const firstPOI = result.selectedPOIs[0]
          if (firstPOI) {
            fenceCircle = new window.AMap.Circle([firstPOI.lng, firstPOI.lat], 500, {
              fillColor: 'rgba(201, 165, 90, 0.06)',
              fillOpacity: 0.6,
              strokeColor: 'rgba(201, 165, 90, 0.3)',
              strokeWeight: 2,
              strokeStyle: 'dashed',
              strokeDasharray: [12, 8],
              zIndex: 50
            })
            fenceCircle.setMap(map)
          }

          setTimeout(() => {
            map.setFitView(null, false, [100, 100, 100, 100])
          }, 300)
        }
      }
    }
  )
}

function startDemoMode(): void {
  mapReady.value = true
  addUserMarker(DAZHOU_CENTER, true)
}
</script>

<style scoped>
.yanjing-map-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #1A1A2E;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}

#map-container {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 115;
}

.plan-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: #C41E3A;
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(196, 30, 58, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.plan-btn:hover:not(:disabled) {
  background: #A01830;
  box-shadow: 0 6px 16px rgba(196, 30, 58, 0.4);
}

.plan-btn:disabled {
  background: #7F8C8D;
  cursor: not-allowed;
  box-shadow: none;
}

.route-info-card {
  position: absolute;
  top: 24px;
  left: 24px;
  right: 24px;
  max-width: 400px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 115;
}

.route-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.route-badge {
  padding: 4px 10px;
  background: #C41E3A;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: 0.03em;
}

.route-stats {
  font-size: 12px;
  color: #7F8C8D;
}

.route-score {
  font-size: 12px;
  color: #7F8C8D;
}

.route-score strong {
  color: #2C3E50;
  font-weight: 700;
  font-size: 18px;
  margin-left: 6px;
  font-feature-settings: "tnum";
}

.location-warning {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 300;
}

.warning-card {
  width: 90%;
  max-width: 380px;
  padding: 28px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.warning-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: rgba(196, 30, 58, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C41E3A;
}

.warning-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 10px;
}

.warning-card p {
  font-size: 13px;
  color: #7F8C8D;
  line-height: 1.6;
  margin-bottom: 8px;
}

.warning-hint {
  font-size: 11px !important;
  color: #7F8C8D !important;
  font-style: italic;
}

.confirm-btn {
  width: 100%;
  margin-top: 18px;
  padding: 12px;
  background: #C41E3A;
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.confirm-btn:hover {
  background: #A01830;
}

.planning-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 290;
}

.planning-content {
  width: 90%;
  max-width: 380px;
  padding: 32px 24px;
  background: #FFFFFF;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.planning-wave-container {
  position: relative;
  width: 200px;
  height: 50px;
  margin: 0 auto 20px;
}

.wave-svg {
  width: 100%;
  height: 100%;
}

.wave-path {
  stroke-dasharray: 400;
  stroke-dashoffset: 400;
  animation: wave-draw 2s ease-in-out infinite;
}

@keyframes wave-draw {
  0% { stroke-dashoffset: 400; }
  50% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -400; }
}

.loading-dots {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #3498DB;
  border-radius: 50%;
  animation: dot-bounce 1.2s ease-in-out infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.planning-title {
  font-size: 18px;
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 8px;
}

.planning-subtitle {
  font-size: 12px;
  color: #7F8C8D;
  line-height: 1.5;
  margin-bottom: 24px;
}

.planning-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.step {
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.step.active { opacity: 1; }
.step.done { opacity: 0.7; }

.step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #F0F0F0;
  border: 2px solid #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #7F8C8D;
  transition: all 0.3s;
}

.step.active .step-num {
  background: #C41E3A;
  border-color: #C41E3A;
  color: #FFFFFF;
}

.step.done .step-num {
  background: #27AE60;
  border-color: #27AE60;
  color: #FFFFFF;
}

.step span:last-child {
  font-size: 12px;
  color: #7F8C8D;
  font-weight: 500;
}

.step.active span:last-child {
  color: #2C3E50;
}

.demo-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(26, 26, 46, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  backdrop-filter: blur(8px);
}

.demo-icon {
  font-size: 14px;
}

.demo-indicator span:last-child {
  font-size: 12px;
  color: #FFFFFF;
  font-weight: 500;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #1A1A2E;
  z-index: 130;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #3498DB;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay span {
  font-size: 13px;
  color: #7F8C8D;
}

.fade-scale-up-enter-active,
.fade-scale-up-leave-active {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.fade-scale-up-enter-from,
.fade-scale-up-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
