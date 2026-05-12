<template>
  <div class="yanjing-map" :class="weatherFilterClass">
    <!-- 地图容器 -->
    <div id="yanjing-amap" class="map-container" :class="{ 'demo-mode': !mapReady }"></div>

    <!-- Demo模式：显示达州地图背景 -->
    <div v-if="!map" class="demo-overlay">
      <div class="demo-map-bg">
        <div class="demo-city">达州市</div>
        <div class="demo-hint">地图加载中...</div>
      </div>
    </div>

    <!-- Demo模式：POI标记 -->
    <div v-if="!map" class="demo-pois">
      <div
        v-for="poi in store.pois"
        :key="poi.id"
        class="demo-poi-marker"
        :class="poi.type"
        :style="getPoiPosition(poi)"
        @click="handlePoiClick(poi)"
      >
        <img v-if="poi.image" :src="poi.image" class="poi-image" :alt="poi.name" />
        <div v-else class="poi-icon">{{ getPoiIcon(poi.type) }}</div>
      </div>
    </div>

    <!-- Demo模式：路线 -->
    <svg v-if="!map && store.currentRoute.waypoints.length > 0" class="demo-route-svg">
      <polyline
        :points="routePoints"
        fill="none"
        stroke="#9a6a4a"
        stroke-width="3"
        stroke-dasharray="8,4"
        stroke-linecap="round"
      />
    </svg>

    <!-- 左上角天气卡片 + 返回官网按钮 -->
    <div class="top-left-controls">
      <a href="/" class="home-btn" title="返回官网" @click.prevent="goHome">
        <span class="back-arrow">&lt;</span>
      </a>

      <div class="weather-card" :class="weatherCardClass">
        <div class="weather-icon" :style="{ color: weatherIconColor }" v-html="weatherIconSvg"></div>
        <div class="weather-info">
          <div class="weather-temp">{{ Math.round(store.weather?.temp || 0) }}°C</div>
          <div class="weather-condition">{{ store.weather?.condition || '未知' }}</div>
          <div class="weather-location" v-if="store.weather?.location">{{ store.weather.location }}</div>
          <div class="weather-detail">
            <span class="weather-aqi">AQI {{ store.weather?.aqi || '—' }}</span>
            <span class="weather-pollution" v-if="store.weather?.pm25">PM2.5 {{ store.weather.pm25 }}</span>
          </div>
          <div class="weather-comfort">
            <span class="comfort-label">舒适度</span>
            <div class="comfort-bar">
              <div class="comfort-fill" :style="{ width: (store.weather?.comfort || 0) + '%' }"></div>
            </div>
            <span class="comfort-value">{{ store.weather?.comfort || 0 }}</span>
          </div>
        </div>
      </div>

      <div v-if="store.weather?.warnings?.length > 0" class="weather-warning">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
        <span>{{ store.weather.warnings[0] }}</span>
      </div>
    </div>

    <!-- 规划中动画 -->
    <Transition name="planning-fade">
      <div v-if="store.isPlanning" class="planning-overlay">
        <div class="planning-content">
          <div class="planning-spinner"></div>
          <div class="planning-text">
            <span class="planning-title">模型正在选择优质路线</span>
            <span class="planning-subtitle">正在分析景点特征与认知匹配度...</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 右下角重新规划按钮 -->
    <button class="replan-btn" @click="handleReplan" :disabled="store.isPlanning">
      <svg v-if="!store.isPlanning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
      <span v-else class="spinner"></span>
    </button>

    <!-- 围栏外红色蒙层 -->
    <div v-if="store.isOutOfFence" class="danger-overlay"></div>

    <!-- 用户定位标记 -->
    <div
      v-if="!map"
      class="demo-marker"
      :style="{ left: demoPos.x + 'px', top: demoPos.y + 'px' }"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
      <div class="user-dot"></div>
    </div>

    <!-- 记忆粒子 -->
    <MemoryParticles />

    <!-- AI导师入口 -->
    <AITutor />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AMapLoader from '@amap/amap-jsapi-loader'
import { useYanJingStore, type POI } from '../../stores/yanjing'
import { weatherIcons } from '../../assets/icons'
import AITutor from './AITutor.vue'
import MemoryParticles from '../MemoryParticles.vue'

const props = defineProps<{
  showRoute?: boolean
}>()

const emit = defineEmits<{
  (e: 'location-change', pos: [number, number]): void
  (e: 'poi-click', poi: POI): void
}>()

const router = useRouter()
const store = useYanJingStore()

let map: any = null
let AMap: any = null
let geolocation: any = null
let userMarker: any = null
const mapReady = ref(false)
const demoPos = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

onMounted(() => {
  demoPos.value = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
})

// Demo模式：POI位置计算
const poiColors: Record<string, string> = {
  red: '#8b5a3c',
  culture: '#5a7a8a',
  food: '#9a7b4f',
  nature: '#4a7a5a'
}

function getPoiIcon(type: string): string {
  return poiIcons[type] || '📍'
}

function getPoiPosition(poi: POI): Record<string, string> {
  // 将经纬度转换为屏幕位置
  // 以 fenceCenter [107.5035, 31.2159] 为中心
  const centerLng = 107.5035
  const centerLat = 31.2159
  const scale = 8000 // 缩放因子

  const x = 50 + (poi.lng - centerLng) * scale
  const y = 50 - (poi.lat - centerLat) * scale

  return {
    left: `${Math.max(10, Math.min(85, 50 + (poi.lng - centerLng) * 8000))}%`,
    top: `${Math.max(10, Math.min(80, 50 - (poi.lat - centerLat) * 8000))}%`
  }
}

// Demo模式：路线点
const routePoints = computed(() => {
  if (store.currentRoute.waypoints.length < 2) return ''

  const centerLng = 107.5035
  const centerLat = 31.2159

  return store.currentRoute.waypoints.map((wp, i) => {
    const x = 10 + (wp[0] - centerLng) * 8000
    const y = 10 - (wp[1] - centerLat) * 8000
    return `${Math.max(0, Math.min(100, x))},${Math.max(0, Math.min(100, y))}`
  }).join(' ')
})

// Demo模式：POI点击
function handlePoiClick(poi: POI) {
  window.dispatchEvent(new CustomEvent('poi-recommend', { detail: poi.id }))
  emit('poi-click', poi)
}

// 天气图标SVG
const weatherIconSvg = computed(() => {
  const icons: Record<string, string> = {
    sunny: weatherIcons.sunny,
    cloudy: weatherIcons.cloudy,
    rain: weatherIcons.rain,
    fog: weatherIcons.fog
  }
  return icons[store.weather.icon] || icons.sunny
})

// 天气卡片样式
const weatherCardClass = computed(() => `weather-${store.weather.icon}`)

// 天气图标颜色
const weatherIconColor = computed(() => {
  const colors: Record<string, string> = {
    sunny: '#c9a55a',
    cloudy: '#8a8a8a',
    rain: '#6a7a8a',
    fog: '#9a9a9a'
  }
  return colors[store.weather.icon] || colors.sunny
})

// 地图滤镜
const weatherFilterClass = computed(() => {
  if (store.weather.icon === 'rain') return 'filter-rain'
  if (store.weather.icon === 'fog') return 'filter-fog'
  return ''
})

// POI图标SVG
const poiIcons: Record<string, string> = {
  red: `<svg viewBox="0 0 24 24" fill="#fff"><path d="M4 21V10.08l-1-1-1 1V4h14v5.08l-1-1-1 1V21H4z"/><path d="M12 3L4 10h16L12 3z" fill="#fca5a5"/></svg>`,
  culture: `<svg viewBox="0 0 24 24" fill="#fff"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>`,
  food: `<svg viewBox="0 0 24 24" fill="#fff"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>`,
  nature: `<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 22V8M9 12c-3-3-5-6.5-3-10 3.5 1 5.5 4 6 7 0 0 3-6 6-7 2 3.5 0 7-3 10"/></svg>`
}

// 初始化地图
onMounted(async () => {
  try {
    AMap = await AMapLoader.load({
      key: 'f485e10206e13b4eaedbbf85dd692554',
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.Geolocation', 'AMap.Polyline', 'AMap.InfoWindow', 'AMap.Map3D'],
      AMapSecurityConfig: {
        securityJsCode: '2365dcb4a51239110cebc37a1779ba08'
      }
    })

    map = new AMap.Map('yanjing-amap', {
      zoom: 14,
      center: store.fenceCenter,
      resizeEnable: true,
      zoomEnable: true,
      dragEnable: true,
      keyboardEnable: true,
      scrollWheel: true
    })

    map.on('complete', () => {
      mapReady.value = true
      renderPOIs()
      if (store.currentRoute.waypoints.length > 0) {
        renderRoute()
      }
      initGeolocation()
    })

    map.on('error', () => {
      console.log('地图加载失败')
    })
  } catch (e) {
    console.log('地图初始化失败:', e)
  }
})

onUnmounted(() => {
  if (map) {
    map.destroy()
    map = null
  }
})

// 监听路线变化
watch(() => store.currentRoute.waypoints, () => {
  if (map && mapReady.value) {
    renderRoute()
  }
})

// 绘制POI标记
function renderPOIs() {
  if (!map || typeof map.add !== 'function') return

  store.pois.forEach(poi => {
    const color = poiColors[poi.type] || '#3b82f6'
    const icon = poiIcons[poi.type] || poiIcons.culture

    // 创建自定义标记
    const marker = new AMap.Marker({
      position: [poi.lng, poi.lat],
      content: createMarkerContent(icon, color, poi.name, poi.image, poi.isClosed),
      offset: new AMap.Pixel(-20, -20),
      zIndex: poi.isClosed ? 60 : 100
    })

    // 信息窗
    const infoWindow = new AMap.InfoWindow({
      content: createInfoWindow(poi),
      offset: new AMap.Pixel(0, -40),
      closeWhenClickMap: true
    })

    marker.on('click', () => {
      if (!poi.isClosed) {
        // 地图移动到该位置
        map.setCenter([poi.lng, poi.lat])
        infoWindow.open(map, marker.getPosition())
      }
    })

    map.add(marker)
  })
}

// 创建标记内容
function createMarkerContent(icon: string, color: string, poiName: string, poiImage?: string, isClosed?: boolean): string {
  const opacity = isClosed ? 'opacity: 0.5;' : ''
  
  return `
    <div style="position: relative; ${opacity}">
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="font-size: 14px; line-height: 1;">${icon}</span>
      </div>
      <div style="
        position: absolute;
        bottom: -18px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 11px;
        color: #333;
        white-space: nowrap;
        font-weight: 500;
        text-shadow: 0 1px 2px rgba(255,255,255,0.9);
      ">${poiName}</div>
    </div>
  `
}

// 创建信息窗
function createInfoWindow(poi: POI): string {
  const typeNames: Record<string, string> = {
    red: '红色历史',
    culture: '文化场馆',
    food: '特色美食',
    nature: '自然风光'
  }
  const typeName = typeNames[poi.type] || '研学点'

  return `
    <div class="custom-info-window">
      <div class="info-header">
        <h3 class="info-title">${poi.name}</h3>
        <span class="info-type">${typeName}</span>
      </div>

      <div class="info-meta">
        <span class="meta-item">预计游览 ${poi.timeCost} 分钟</span>
      </div>

      <div class="info-tags">
        ${poi.eduTags.history > 0.7 ? '<span class="tag">历史</span>' : ''}
        ${poi.eduTags.logic > 0.7 ? '<span class="tag">逻辑</span>' : ''}
        ${poi.eduTags.empathy > 0.7 ? '<span class="tag">共情</span>' : ''}
        ${poi.eduTags.attention > 0.7 ? '<span class="tag">观察</span>' : ''}
      </div>

      <button
        onclick="window.dispatchEvent(new CustomEvent('poi-recommend', {detail: '${poi.id}'}))"
        class="info-btn"
      >查看详情</button>

      <style>
        .custom-info-window {
          font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
          background: #fff;
          border-radius: 8px;
          padding: 0;
          width: 220px;
        }

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding: 14px 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .info-title {
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .info-type {
          font-size: 11px;
          color: #c41e3a;
          padding: 2px 8px;
          background: #fef2f2;
          border-radius: 4px;
          font-weight: 500;
        }

        .info-meta {
          margin-bottom: 10px;
          padding: 0 16px;
        }

        .meta-item {
          font-size: 12px;
          color: #6b7280;
        }

        .info-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 12px;
          padding: 0 16px;
        }

        .tag {
          font-size: 10px;
          padding: 3px 8px;
          background: #fef3c7;
          color: #92400e;
          border-radius: 4px;
        }

        .info-btn {
          width: calc(100% - 32px);
          margin: 0 16px 14px;
          padding: 10px 16px;
          background: #c41e3a;
          border: none;
          border-radius: 6px;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .info-btn:hover {
          background: #a01830;
        }
      </style>
    </div>
  `
}

// 绘制路线
function renderRoute() {
  if (!map || typeof map.getAllOverlays !== 'function' || store.currentRoute.waypoints.length < 2) return

  // 清除旧路线
  const oldOverlays = map.getAllOverlays()
  oldOverlays.forEach((o: any) => {
    if (o instanceof AMap.Polyline) map.remove(o)
  })

  // 新路线
  const polyline = new AMap.Polyline({
    path: store.currentRoute.waypoints,
    strokeColor: '#9a6a4a',
    strokeWeight: 4,
    strokeOpacity: 0.7,
    strokeStyle: 'dashed',
    showDir: true,
    dirColor: '#b88a6a',
    zIndex: 80
  })

  map.add(polyline)
}

// 初始化定位
function initGeolocation() {
  if (!map || !AMap) return

  geolocation = new AMap.Geolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    showButton: false
  })

  map.addControl(geolocation)

  geolocation.getCurrentPosition((status: string, result: any) => {
    if (status === 'complete' && result && result.position) {
      const pos = {
        lng: result.position.lng,
        lat: result.position.lat,
        accuracy: result.accuracy
      }
      store.updateLocation(pos)
      addUserMarker(pos)
      emit('location-change', [pos.lng, pos.lat])
    }
  })

  geolocation.watchPosition((result: any) => {
    if (result && result.position) {
      const pos = {
        lng: result.position.lng,
        lat: result.position.lat,
        accuracy: result.accuracy
      }
      store.updateLocation(pos)
      updateUserMarker(pos)
      emit('location-change', [pos.lng, pos.lat])
    }
  })
}

// 添加用户标记
function addUserMarker(pos: { lng: number; lat: number }) {
  if (!map || !AMap) return

  if (userMarker) {
    map.remove(userMarker)
  }

  userMarker = new AMap.Marker({
    position: [pos.lng, pos.lat],
    content: `<div style="
      width: 16px;
      height: 16px;
      background: #2563eb;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(37,99,235,0.4);
    "></div>`,
    offset: new AMap.Pixel(-8, -8),
    zIndex: 200
  })

  map.add(userMarker)
}

// 更新用户标记位置
function updateUserMarker(pos: { lng: number; lat: number }) {
  if (!userMarker) {
    addUserMarker(pos)
    return
  }
  userMarker.setPosition([pos.lng, pos.lat])
}

// 演示模式
function startDemoMode() {
  mapReady.value = true
  map = {} // 标记为已初始化（Demo模式）
  renderPOIs()
  if (store.currentRoute.waypoints.length > 0) {
    renderRoute()
  }

  // 尝试获取真实地理位置
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        store.updateLocation({ lng: longitude, lat: latitude })
        emit('location-change', [longitude, latitude])
        demoPos.value = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      },
      () => {
        // 定位失败，使用模拟
        startLocationSimulation()
      },
      { timeout: 5000 }
    )
  } else {
    startLocationSimulation()
  }
}

function startLocationSimulation() {
  demoPos.value = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  let angle = 0
  setInterval(() => {
    angle += 0.01
    const lng = store.fenceCenter[0] + Math.cos(angle) * 0.003
    const lat = store.fenceCenter[1] + Math.sin(angle * 0.7) * 0.003
    store.updateLocation({ lng, lat })
  }, 2000)
}

// 拖拽
function startDrag(e: MouseEvent | TouchEvent) {
  isDragging.value = true
  const point = 'touches' in e ? e.touches[0] : e
  dragStart.value = { x: point.clientX, y: point.clientY }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  const point = 'touches' in e ? e.touches[0] : e
  demoPos.value = { x: point.clientX, y: point.clientY }

  const container = document.getElementById('yanjing-amap')
  if (container) {
    const rect = container.getBoundingClientRect()
    const relX = (point.clientX - rect.left) / rect.width
    const relY = (point.clientY - rect.top) / rect.height
    const lng = store.fenceCenter[0] + (relX - 0.5) * 0.02
    const lat = store.fenceCenter[1] - (relY - 0.5) * 0.02
    store.updateLocation({ lng, lat })
    emit('location-change', [lng, lat])
  }
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

// 返回官网
function goHome() {
  window.location.href = '/culture'
}

// 重新规划
function handleReplan() {
  store.planRoute()
}

// 暴露方法
defineExpose({
  fitRoute: () => map?.setFitView()
})
</script>

<style scoped>
.yanjing-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
}

.map-container.demo-mode {
  background: #1a1a1a;
}

/* Demo模式覆盖层 */
.demo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(20, 20, 22, 0.97);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.demo-map-bg {
  text-align: center;
}

.demo-city {
  font-size: 28px;
  font-weight: 500;
  color: #c8c8c8;
  margin-bottom: 6px;
  letter-spacing: 4px;
}

.demo-hint {
  font-size: 12px;
  color: #666;
}

/* Demo模式POI */
.demo-pois {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.demo-poi-marker {
  position: absolute;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  pointer-events: all;
  transition: transform 0.2s ease;
}

.demo-poi-marker:hover {
  transform: translate(-50%, -100%) scale(1.05);
}

.demo-poi-marker .poi-icon {
  font-size: 24px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));
}

.demo-poi-marker .poi-image {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  border: 2px solid rgba(255,255,255,0.8);
}

.demo-poi-marker.red .poi-image { border-color: rgba(139,90,60,0.7); }
.demo-poi-marker.culture .poi-image { border-color: rgba(90,122,138,0.7); }
.demo-poi-marker.food .poi-image { border-color: rgba(154,123,79,0.7); }
.demo-poi-marker.nature .poi-image { border-color: rgba(74,122,90,0.7); }

.demo-poi-marker .poi-name {
  margin-top: 3px;
  padding: 2px 6px;
  background: rgba(25, 25, 25, 0.92);
  border-radius: 3px;
  font-size: 10px;
  color: #d5d5d5;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
}

.demo-poi-marker.red .poi-name { border-left: 2px solid #8b5a3c; }
.demo-poi-marker.culture .poi-name { border-left: 2px solid #5a7a8a; }
.demo-poi-marker.food .poi-name { border-left: 2px solid #9a7b4f; }
.demo-poi-marker.nature .poi-name { border-left: 2px solid #4a7a5a; }

/* Demo模式路线 */
.demo-route-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

/* 天气滤镜 */
.filter-rain {
  filter: brightness(0.95) saturate(0.9);
}

.filter-fog {
  filter: brightness(0.92) saturate(0.85);
}

/* 左上角控制区 */
.top-left-controls {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
}

/* 返回官网按钮 */
.home-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: rgba(148, 163, 184, 0.35);
  cursor: pointer;
  transition: all 0.35s ease;
}

.home-btn:hover {
  color: rgba(96, 165, 250, 1);
  transform: scale(1.02);
}

.back-arrow {
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
}

/* 天气卡片 - 高级简约风格 */
.weather-card {
  padding: 10px 14px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(24, 24, 28, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.35s ease;
}

.weather-sunny {
  background: rgba(35, 32, 26, 0.95);
  border-color: rgba(201, 165, 90, 0.12);
}

.weather-cloudy {
  background: rgba(28, 28, 30, 0.95);
  border-color: rgba(138, 138, 138, 0.12);
}

.weather-rain {
  background: rgba(26, 30, 36, 0.95);
  border-color: rgba(100, 140, 180, 0.12);
}

.weather-fog {
  background: rgba(32, 32, 34, 0.95);
  border-color: rgba(154, 154, 154, 0.12);
}

.weather-card .weather-icon {
  width: 36px;
  height: 36px;
}

.weather-card .weather-icon :deep(svg) {
  width: 100%;
  height: 100%;
  color: currentColor;
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.weather-temp {
  font-size: 16px;
  font-weight: 600;
  color: #e5e5e5;
}

.weather-condition {
  font-size: 12px;
  color: #94a3b8;
}

.weather-location {
  font-size: 11px;
  color: #60a5fa;
}

.weather-detail {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #94a3b8;
}

.weather-aqi {
  color: #22c55e;
}

.weather-pollution {
  color: #f59e0b;
}

.weather-comfort {
  display: flex;
  align-items: center;
  gap: 6px;
}

.comfort-label {
  font-size: 10px;
  color: #a0a0a0;
}

.comfort-bar {
  width: 40px;
  height: 3px;
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
  overflow: hidden;
}

.comfort-fill {
  height: 100%;
  background: linear-gradient(90deg, #6a8a6a, #5a7a5a);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.comfort-value {
  font-size: 11px;
  color: #6a8a6a;
  font-weight: 500;
}

/* 天气警告 */
.weather-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  color: #fcd34d;
  font-size: 12px;
  animation: warningPulse 2s ease-in-out infinite;
}

@keyframes warningPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.weather-warning svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 规划中动画 - 克制风格 */
.planning-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.planning-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 32px 44px;
  background: rgba(22, 22, 26, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.planning-spinner {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(201, 165, 90, 0.15);
  border-top-color: rgba(201, 165, 90, 0.6);
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

.planning-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.planning-title {
  font-size: 15px;
  font-weight: 500;
  color: rgba(241, 245, 249, 0.9);
  letter-spacing: 0.02em;
}

.planning-subtitle {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.6);
}

.planning-fade-enter-active,
.planning-fade-leave-active {
  transition: opacity 0.3s ease;
}

.planning-fade-enter-from,
.planning-fade-leave-to {
  opacity: 0;
}

/* 重新规划按钮 - 高级简约风格 */
.replan-btn {
  position: absolute;
  bottom: 100px;
  right: 16px;
  width: 42px;
  height: 42px;
  border-radius: 6px;
  background: rgba(26, 26, 28, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(148, 163, 184, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.35s ease;
}

.replan-btn:hover:not(:disabled) {
  background: rgba(36, 36, 38, 0.95);
  color: rgba(203, 213, 225, 0.9);
  transform: translateY(-1px);
}

.replan-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.replan-btn svg {
  width: 18px;
  height: 18px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 危险蒙层 */
.danger-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 300px, rgba(139,90,60,0.2) 100%);
  pointer-events: none;
  z-index: 90;
  animation: dangerPulse 1.5s infinite;
}

@keyframes dangerPulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.5; }
}

/* 用户定位标记 */
.demo-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: grab;
  z-index: 200;
}

.demo-marker:active {
  cursor: grabbing;
}

.user-dot {
  width: 14px;
  height: 14px;
  background: #888;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0,0,0,0.35);
  animation: userPulse 2s infinite;
}

@keyframes userPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .weather-card {
    top: 12px;
    left: 12px;
    padding: 10px 12px;
  }

  .weather-icon {
    width: 28px;
    height: 28px;
  }

  .weather-temp {
    font-size: 18px;
  }

  .replan-btn {
    bottom: 90px;
    right: 12px;
    width: 44px;
    height: 44px;
  }
}

/* 高德地图信息窗口全局样式覆盖 */
:global(.amap-info-outer) {
  background: transparent !important;
  border: none !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}

:global(.amap-info-content) {
  background: rgba(15, 17, 23, 0.97) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 8px !important;
  padding: 16px !important;
  min-width: 200px !important;
  box-shadow: none !important;
}

:global(.amap-info-close) {
  display: none !important;
}

:global(.amap-info-sharp) {
  display: none !important;
}

/* 确保地图交互正常 */
:global(#yanjing-amap) {
  touch-action: none;
}

:global(#yanjing-amap .amap-container) {
  touch-action: none;
}
</style>
