<template>
  <div class="planner-panel" :class="{ collapsed: isCollapsed }">
    <!-- 展开/收起按钮 -->
    <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline v-if="isCollapsed" points="18 15 12 9 6 15"></polyline>
        <polyline v-else points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <!-- 主要内容 -->
    <div class="panel-content" v-show="!isCollapsed">
      <!-- 站点进度 -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="station-count">
            <svg viewBox="0 0 24 24" fill="currentColor" class="icon">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {{ currentPOI ? currentPOI.name : '待规划' }}
          </span>
          <span class="current-station-name" v-if="currentPOI">
            <span class="distance-info" v-if="routeDistance > 0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-icon">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ routeDistanceText }}
            </span>
          </span>
        </div>

        <!-- 站点指示器 -->
        <div class="station-dots">
          <div
            v-for="(poi, idx) in store.currentRoute.stationOrder"
            :key="poi.id"
            class="station-dot"
            :class="{ active: idx <= currentStationIndex, current: idx === currentStationIndex }"
            @click="goToStation(idx)"
          >
            <span v-if="idx <= currentStationIndex" class="dot-inner"></span>
          </div>
        </div>
      </div>

      <!-- 天气信息 -->
      <div class="weather-section" v-if="currentPOI">
        <div class="weather-item">
          <span class="weather-icon" v-html="getWeatherIconSvg(store.weather.icon)"></span>
          <span class="weather-text">{{ store.weather.condition }} {{ store.weather.temp }}°C</span>
        </div>
        <div class="weather-comfort">
          <span class="comfort-label">舒适度</span>
          <div class="comfort-bar-small">
            <div class="comfort-fill-small" :style="{ width: store.weather.comfort + '%' }"></div>
          </div>
          <span class="comfort-value-small">{{ store.weather.comfort }}</span>
        </div>
      </div>

      <!-- 进度条区域 -->
      <div class="bars-section">
        <!-- 剩余时间 -->
        <div class="bar-item">
          <div class="bar-header">
            <span class="bar-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              剩余时间
            </span>
            <span class="bar-value">{{ remainingTime }}分钟</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill time-fill" :style="{ width: timePercent + '%' }"></div>
          </div>
        </div>

        <!-- 安全系数 -->
        <div class="bar-item">
          <div class="bar-header">
            <span class="bar-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              安全系数
            </span>
            <span class="bar-value" :class="safetyClass">{{ safetyPercent }}%</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill safety-fill" :style="{ width: safetyPercent + '%' }"></div>
          </div>
        </div>

        <!-- 认知匹配度 -->
        <div class="bar-item">
          <div class="bar-header">
            <span class="bar-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              认知匹配度
            </span>
            <span class="bar-value" :class="cognitionClass">{{ cognitionPercent }}%</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill cognition-fill" :style="{ width: cognitionPercent + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section">
        <button class="action-btn plan-btn" @click="handleReplan" :disabled="isPlanning">
          <svg v-if="!isPlanning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span v-if="isPlanning" class="loading-spinner"></span>
          <span>{{ isPlanning ? '规划中...' : '智能重规划' }}</span>
        </button>

        <div class="dropdown-container">
          <select v-model="selectedPoiId" class="poi-select">
            <option value="">模拟站点关闭</option>
            <option v-for="poi in store.pois" :key="poi.id" :value="poi.id">
              {{ poi.name }}
            </option>
          </select>
          <button
            class="action-btn close-btn"
            @click="handleCloseStation"
            :disabled="!selectedPoiId"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>标记关闭</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useYanJingStore } from '../../stores/yanjing'

const store = useYanJingStore()

const isCollapsed = ref(false)
const selectedPoiId = ref('')
const isPlanning = computed(() => store.isPlanning)

// 当前站点索引
const currentStationIndex = computed({
  get: () => store.currentStationIndex,
  set: (val) => { store.currentStationIndex = val }
})

// 路线距离（公里）
const routeDistance = computed(() => {
  return store.currentRoute.estimatedDistance > 0
    ? (store.currentRoute.estimatedDistance / 1000).toFixed(1)
    : '0'
})

const routeDistanceText = computed(() => `${routeDistance.value}km`)

// 当前POI
const currentPOI = computed(() => {
  if (store.currentRoute.stationOrder.length > 0) {
    const idx = Math.min(currentStationIndex.value, store.currentRoute.stationOrder.length - 1)
    return store.currentRoute.stationOrder[idx]
  }
  return null
})

// 总站点数
const totalStations = computed(() => {
  return store.currentRoute.stationOrder.length
})

// 剩余时间（分钟）
const remainingTime = computed(() => {
  if (store.currentRoute.totalTime > 0) {
    return Math.max(0, store.currentRoute.totalTime)
  }
  return 0
})

// 时间百分比
const timePercent = computed(() => {
  if (store.timeBudget <= 0) return 100
  return (remainingTime.value / store.timeBudget) * 100
})

// 安全系数百分比
const safetyPercent = computed(() => {
  if (store.isOutOfFence) return 40
  return 95
})

// 安全系数样式
const safetyClass = computed(() => {
  if (safetyPercent.value < 60) return 'danger'
  if (safetyPercent.value < 80) return 'warning'
  return 'safe'
})

// 认知匹配度百分比
const cognitionPercent = computed(() => {
  if (store.currentRoute.totalScore > 0) {
    return Math.min(100, Math.round(store.currentRoute.totalScore * 100))
  }
  return 50
})

// 认知匹配度样式
const cognitionClass = computed(() => {
  if (cognitionPercent.value < 40) return 'danger'
  if (cognitionPercent.value < 60) return 'warning'
  return 'safe'
})

// 处理重新规划
async function handleReplan() {
  const result = await store.planRoute()
  if (result) {
    currentStationIndex.value = 0
  }
}

// 处理站点关闭 - 自动导到下一站
async function handleCloseStation() {
  if (!selectedPoiId.value) return

  const poiName = store.pois.find(p => p.id === selectedPoiId.value)?.name || ''

  // 如果关闭的是当前站点，自动跳到下一个
  const currentPOIId = currentPOI.value?.id
  if (currentPOIId === selectedPoiId.value && totalStations.value > 1) {
    currentStationIndex.value = Math.min(currentStationIndex.value + 1, totalStations.value - 1)
  }

  await store.closeStation(selectedPoiId.value)
  selectedPoiId.value = ''

  // 通知父组件
  window.dispatchEvent(new CustomEvent('station-closed', {
    detail: { poiName }
  }))
}

// 完成当前站点，导到下一站
function completeCurrentStation() {
  if (totalStations.value > 1 && currentStationIndex.value < totalStations.value - 1) {
    currentStationIndex.value++
    store.currentStationIndex = currentStationIndex.value
  }
}

// 跳转到指定站点
function goToStation(idx: number) {
  if (idx >= 0 && idx < totalStations.value) {
    currentStationIndex.value = idx
    store.currentStationIndex = idx
  }
}

// 天气图标SVG
function getWeatherIconSvg(icon: string): string {
  const icons: Record<string, string> = {
    sunny: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    cloudy: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
    rain: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><line x1="8" y1="19" x2="8" y2="23" stroke="currentColor" stroke-width="2"/><line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2"/><line x1="16" y1="19" x2="16" y2="23" stroke="currentColor" stroke-width="2"/></svg>',
    fog: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 10h18M3 14h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
  }
  return icons[icon] || icons.sunny
}
</script>

<style scoped>
.planner-panel {
  position: fixed;
  left: 20px;
  bottom: 20px;
  background: rgba(22, 22, 26, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 18px 22px;
  z-index: 400;
  width: 320px;
  max-width: calc(100vw - 40px);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.planner-panel.collapsed {
  width: auto;
  padding: 14px 16px;
}

.collapse-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 28px;
  height: 20px;
  background: rgba(35, 35, 38, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px 4px 4px 0;
  color: rgba(148, 163, 184, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.35s ease;
}

.collapse-btn:hover {
  background: rgba(45, 45, 48, 0.98);
  color: rgba(203, 213, 225, 0.9);
}

.collapse-btn svg {
  width: 14px;
  height: 14px;
}

/* 站点进度 */
.progress-section {
  margin-bottom: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.station-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(241, 245, 249, 0.9);
}

.station-count .icon {
  width: 14px;
  height: 14px;
  color: rgba(201, 165, 90, 0.7);
}

.current-station-name {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.6);
  background: rgba(255, 255, 255, 0.03);
  padding: 4px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.distance-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(148, 163, 184, 0.5);
}

.mini-icon {
  width: 11px;
  height: 11px;
}

.station-dots {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
}

.station-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.35s ease;
}

.station-dot.active {
  background: rgba(201, 165, 90, 0.12);
  border-color: rgba(201, 165, 90, 0.4);
}

.station-dot.current {
  background: rgba(201, 165, 90, 0.5);
  border-color: rgba(201, 165, 90, 0.7);
  transform: scale(1.15);
}

.dot-inner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
}

/* 天气信息 */
.weather-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  margin-bottom: 12px;
}

.weather-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weather-icon {
  width: 16px;
  height: 16px;
  color: rgba(148, 163, 184, 0.5);
  display: flex;
  align-items: center;
}

.weather-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.weather-text {
  font-size: 12px;
  color: rgba(203, 213, 225, 0.7);
}

.weather-comfort {
  display: flex;
  align-items: center;
  gap: 6px;
}

.comfort-label {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.5);
}

.comfort-bar-small {
  width: 36px;
  height: 2.5px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1px;
  overflow: hidden;
}

.comfort-fill-small {
  height: 100%;
  background: rgba(140, 160, 140, 0.6);
  border-radius: 1px;
}

.comfort-value-small {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.6);
}

/* 进度条区域 */
.bars-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bar-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: rgba(148, 163, 184, 0.6);
}

.bar-label .icon {
  width: 13px;
  height: 13px;
}

.bar-value {
  font-size: 12px;
  font-weight: 500;
  color: rgba(241, 245, 249, 0.9);
}

.bar-value.safe { color: rgba(134, 239, 172, 0.85); }
.bar-value.warning { color: rgba(253, 230, 138, 0.85); }
.bar-value.danger { color: rgba(252, 165, 165, 0.85); }

.bar-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 2px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.time-fill {
  background: rgba(201, 165, 90, 0.5);
}

.safety-fill {
  background: rgba(134, 239, 172, 0.5);
}

.cognition-fill {
  background: rgba(192, 132, 252, 0.4);
}

/* 操作按钮 */
.actions-section {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  color: rgba(203, 213, 225, 0.8);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.35s ease;
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.plan-btn:not(:disabled) {
  background: rgba(201, 165, 90, 0.1);
  border-color: rgba(201, 165, 90, 0.2);
  color: rgba(201, 165, 90, 0.85);
}

.plan-btn:not(:disabled):hover {
  background: rgba(201, 165, 90, 0.15);
  border-color: rgba(201, 165, 90, 0.3);
}

.close-btn:not(:disabled) {
  background: rgba(200, 160, 160, 0.08);
  border-color: rgba(200, 160, 160, 0.15);
  color: rgba(220, 180, 180, 0.85);
}

.close-btn:not(:disabled):hover {
  background: rgba(200, 160, 160, 0.12);
  border-color: rgba(200, 160, 160, 0.25);
}

.dropdown-container {
  flex: 1;
  display: flex;
  gap: 8px;
}

.poi-select {
  flex: 1;
  padding: 9px 12px;
  background: rgba(26, 26, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  color: rgba(203, 213, 225, 0.85);
  font-size: 12px;
  cursor: pointer;
}

.poi-select:focus {
  outline: none;
  border-color: rgba(201, 165, 90, 0.25);
}

.loading-spinner {
  width: 12px;
  height: 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-top-color: rgba(201, 165, 90, 0.7);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .planner-panel {
    bottom: 10px;
    left: 10px;
    right: auto;
    width: calc(100vw - 20px);
    max-width: none;
  }

  .actions-section {
    flex-direction: column;
  }

  .dropdown-container {
    flex-direction: column;
  }
}
</style>
