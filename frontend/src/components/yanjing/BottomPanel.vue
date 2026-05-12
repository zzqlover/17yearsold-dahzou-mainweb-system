<template>
  <div class="bottom-panel" @click="emit('expand')">
    <div class="panel-content">
      <div class="station-info">
        <span class="station-count">
          {{ store.currentRoute.stationOrder.length > 0 ? `第 ${store.currentStationIndex + 1} 站 / 共 ${store.currentRoute.stationOrder.length} 站` : '点击景点开始规划' }}
        </span>
        <span class="station-name" v-if="store.selectedDestinationPOI">{{ store.selectedDestinationPOI.name }}</span>
        <span class="station-name" v-else-if="store.currentStation">{{ store.currentStation.name }}</span>
        <span class="station-hint" v-else>请先选择一个目的地</span>
      </div>

      <div class="progress-bars">
        <div class="bar-item">
          <div class="bar-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>剩余时间</span>
          </div>
          <div class="bar-track"><div class="bar-fill time" :style="{ width: timePercent + '%' }"></div></div>
          <span class="bar-value">{{ formatTime(store.remainingTime) }}</span>
        </div>

        <div class="bar-item">
          <div class="bar-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>安全系数</span>
          </div>
          <div class="bar-track"><div class="bar-fill safety" :style="{ width: store.safetyScore + '%' }"></div></div>
          <span class="bar-value">{{ store.safetyScore }}%</span>
        </div>

        <div class="bar-item">
          <div class="bar-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>认知匹配</span>
          </div>
          <div class="bar-track"><div class="bar-fill cognition" :style="{ width: store.cognitiveMatch + '%' }"></div></div>
          <span class="bar-value">{{ store.cognitiveMatch }}%</span>
        </div>
      </div>
    </div>

    <button class="expand-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useYanJingStore } from '../../stores/yanjing'

const store = useYanJingStore()
const emit = defineEmits<{ (e: 'expand'): void }>()

const timePercent = computed(() => (store.remainingTime / store.timeBudget) * 100)

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h${m}m` : `${m}m`
}
</script>

<style scoped>
.bottom-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15,23,42,0.95);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 16px 20px 24px;
  z-index: 300;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.station-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.station-count {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
}

.station-name {
  font-size: 12px;
  color: #60a5fa;
  background: rgba(59,130,246,0.1);
  padding: 4px 10px;
  border-radius: 10px;
}

.station-hint {
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

.progress-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #94a3b8;
  min-width: 70px;
}

.bar-label svg { width: 14px; height: 14px; }

.bar-track {
  flex: 1;
  height: 5px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.bar-fill.time { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.bar-fill.safety { background: linear-gradient(90deg, #22c55e, #4ade80); }
.bar-fill.cognition { background: linear-gradient(90deg, #a855f7, #c084fc); }

.bar-value {
  font-size: 12px;
  font-weight: 600;
  color: #f1f5f9;
  min-width: 35px;
  text-align: right;
}

.expand-btn {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 24px;
  background: rgba(59,130,246,0.8);
  border: none;
  border-radius: 8px 8px 0 0;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-btn svg { width: 16px; height: 16px; }

@media (max-width: 768px) {
  .bottom-panel {
    padding: 14px 16px 20px;
  }
}
</style>
