<template>
  <div class="bottom-panel" :class="{ expanded: isExpanded }">
    <div class="panel-header" @click="toggleExpand">
      <div class="panel-grid">
        <div class="grid-item">
          <div class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <span class="item-label">当前站点</span>
          <span class="item-value">{{ store.currentStationIndex + 1 }}/{{ store.totalStations }}</span>
        </div>

        <div class="grid-item">
          <div class="item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <span class="item-label">剩余时间</span>
          <span class="item-value">{{ remainingTime }}分钟</span>
        </div>

        <div class="grid-item">
          <div class="item-icon" :class="getSafetyClass(store.safetyScore)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span class="item-label">安全指数</span>
          <span class="item-value" :class="getSafetyClass(store.safetyScore)">{{ (store.safetyScore * 100).toFixed(0) }}</span>
        </div>

        <div class="grid-item">
          <div class="item-icon cognition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <span class="item-label">认知匹配</span>
          <span class="item-value cognition">{{ (store.cognitionMatch * 100).toFixed(0) }}%</span>
        </div>
      </div>

      <div class="progress-row">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${store.progressPercent}%` }"></div>
        </div>
        <span class="progress-label">{{ Math.round(store.progressPercent) }}%</span>
      </div>
    </div>

    <transition name="slide">
      <div class="panel-detail" v-if="isExpanded && store.planningResult">
        <div class="detail-header">
          <h4>研学路线</h4>
          <span class="route-info">{{ store.planningResult.totalTime }}分钟 · {{ (store.planningResult.totalDistance / 1000).toFixed(1) }}公里</span>
        </div>

        <div class="stations-timeline">
          <div
            v-for="(poi, idx) in store.planningResult.selectedPOIs"
            :key="poi.id"
            class="timeline-item"
            :class="{ active: idx === store.currentStationIndex, done: idx < store.currentStationIndex }"
          >
            <div class="timeline-marker">
              <span v-if="idx < store.currentStationIndex" class="check-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              <span v-else class="num">{{ idx + 1 }}</span>
            </div>
            <div class="timeline-content">
              <span class="poi-name">{{ poi.name }}</span>
              <span class="poi-time">{{ poi.timeCost }}分钟 · {{ getTypeName(poi.type) }}</span>
            </div>
            <button class="remove-btn" @click.stop="handleCloseStation(poi.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="detail-actions">
          <button class="action-btn" :disabled="store.currentStationIndex === 0" @click="store.prevStation()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            上一站
          </button>
          <button class="action-btn primary" :disabled="store.currentStationIndex >= store.totalStations - 1" @click="store.nextStation()">
            下一站
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <button class="expand-toggle" :class="{ expanded: isExpanded }" @click="toggleExpand">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useYanJingStore } from '../stores/useYanJingStore'

const store = useYanJingStore()
const isExpanded = ref(false)

const remainingTime = computed(() => {
  if (!store.planningResult) return 0
  return Math.max(0, store.planningResult.totalTime - Math.floor(store.progressPercent * store.planningResult.totalTime / 100))
})

function toggleExpand(): void {
  isExpanded.value = !isExpanded.value
}

function handleCloseStation(poiId: string): void {
  store.closeStation(poiId)
}

function getSafetyClass(score: number): string {
  if (score >= 0.85) return 'safe'
  if (score >= 0.7) return 'warning'
  return 'danger'
}

function getTypeName(type: string): string {
  const map: Record<string, string> = {
    red: '红色文化',
    nature: '自然风光',
    culture: '人文历史'
  }
  return map[type] || type
}
</script>

<style scoped>
.bottom-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 150;
  background: rgba(26, 26, 46, 0.92);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}

.panel-header {
  padding: 16px 20px 12px;
  cursor: pointer;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 12px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.item-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7F8C8D;
}

.item-icon.safe { color: #27AE60; background: rgba(39, 174, 96, 0.1); }
.item-icon.warning { color: #E67E22; background: rgba(230, 126, 34, 0.1); }
.item-icon.danger { color: #E74C3C; background: rgba(231, 76, 60, 0.1); }
.item-icon.cognition { color: #3498DB; background: rgba(52, 152, 219, 0.1); }

.item-label {
  font-size: 11px;
  color: #7F8C8D;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.item-value {
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  font-feature-settings: "tnum";
}

.item-value.safe { color: #27AE60; }
.item-value.warning { color: #E67E22; }
.item-value.danger { color: #E74C3C; }
.item-value.cognition { color: #3498DB; }

.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #C41E3A;
  border-radius: 2px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-label {
  font-size: 12px;
  color: #7F8C8D;
  min-width: 36px;
  text-align: right;
  font-feature-settings: "tnum";
}

.panel-detail {
  padding: 16px 20px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
}

.route-info {
  font-size: 12px;
  color: #7F8C8D;
}

.stations-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-item.active {
  background: rgba(196, 30, 58, 0.1);
  border: 1px solid rgba(196, 30, 58, 0.2);
}

.timeline-item.done {
  opacity: 0.5;
}

.timeline-marker {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #7F8C8D;
  flex-shrink: 0;
}

.timeline-item.active .timeline-marker {
  background: #C41E3A;
  color: #FFFFFF;
}

.timeline-item.done .timeline-marker {
  background: #27AE60;
  color: #FFFFFF;
}

.check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.num {
  font-feature-settings: "tnum";
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.poi-name {
  font-size: 13px;
  font-weight: 500;
  color: #FFFFFF;
}

.poi-time {
  font-size: 11px;
  color: #7F8C8D;
}

.remove-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #7F8C8D;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.detail-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn.primary {
  background: #C41E3A;
  border-color: #C41E3A;
}

.action-btn.primary:hover:not(:disabled) {
  background: #A01830;
}

.expand-toggle {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 32px;
  background: rgba(26, 26, 46, 0.92);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  color: #7F8C8D;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-toggle:hover {
  color: #FFFFFF;
}

.expand-toggle.expanded svg {
  transform: rotate(180deg);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 400px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
