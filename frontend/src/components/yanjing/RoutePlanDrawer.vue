<template>
  <Transition name="slide">
    <div v-if="show" class="drawer-overlay" @click.self="emit('close')">
      <div class="drawer-content">
        <div class="drawer-header">
          <h3>研学路线详情</h3>
          <button class="close-btn" @click="emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="route-summary">
          <div class="summary-item">
            <span class="s-label">总时长</span>
            <span class="s-value">{{ formatDuration(store.currentRoute.totalTime) }}</span>
          </div>
          <div class="summary-item">
            <span class="s-label">站点数</span>
            <span class="s-value">{{ store.currentRoute.stationOrder.length }}个</span>
          </div>
          <div class="summary-item">
            <span class="s-label">教育收益</span>
            <span class="s-value score">{{ (store.currentRoute.totalScore * 100).toFixed(0) }}分</span>
          </div>
        </div>

        <div class="timeline">
          <div v-for="(poi, idx) in store.currentRoute.stationOrder" :key="poi.id" class="timeline-item">
            <div class="timeline-marker">{{ idx + 1 }}</div>
            <div class="timeline-content">
              <div class="poi-name">{{ poi.name }}</div>
              <div class="poi-info">
                <span class="poi-time">{{ poi.timeCost }}分钟</span>
                <span class="poi-tags">
                  <span v-if="poi.eduTags.history > 0.7">历史</span>
                  <span v-if="poi.eduTags.logic > 0.7">逻辑</span>
                  <span v-if="poi.eduTags.empathy > 0.7">共情</span>
                </span>
              </div>
            </div>
            <button class="skip-btn" @click="handleClose(poi.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
              关闭
            </button>
          </div>
        </div>

        <div class="drawer-footer">
          <button class="share-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            分享路线
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useYanJingStore } from '../../stores/yanjing'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const store = useYanJingStore()

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`
}

function handleClose(poiId: string) {
  store.closePoi(poiId)
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 600;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.drawer-content {
  background: linear-gradient(180deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98));
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px 24px 0 0;
  max-height: 80vh;
  overflow-y: auto;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.drawer-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover { background: rgba(255,255,255,0.2); color: #f1f5f9; }
.close-btn svg { width: 18px; height: 18px; }

.route-summary {
  display: flex;
  gap: 16px;
  padding: 16px 24px;
  background: rgba(59,130,246,0.1);
}

.summary-item {
  flex: 1;
  text-align: center;
}

.s-label { display: block; font-size: 11px; color: #94a3b8; margin-bottom: 4px; }
.s-value { font-size: 16px; font-weight: 600; color: #f1f5f9; }
.s-value.score { color: #a855f7; }

.timeline {
  padding: 16px 24px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.timeline-item:last-child { border-bottom: none; }

.timeline-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-content { flex: 1; }

.poi-name { font-size: 15px; font-weight: 600; color: #f1f5f9; margin-bottom: 4px; }
.poi-info { display: flex; gap: 10px; font-size: 12px; }
.poi-time { color: #94a3b8; }
.poi-tags { display: flex; gap: 4px; }
.poi-tags span { background: rgba(59,130,246,0.2); color: #60a5fa; padding: 2px 6px; border-radius: 4px; }

.skip-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 6px;
  color: #f87171;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skip-btn:hover { background: rgba(239,68,68,0.2); }
.skip-btn svg { width: 14px; height: 14px; }

.drawer-footer {
  padding: 16px 24px 32px;
}

.share-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.2));
  border: 1px solid rgba(59,130,246,0.3);
  border-radius: 12px;
  color: #60a5fa;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.share-btn:hover { background: rgba(59,130,246,0.3); }
.share-btn svg { width: 18px; height: 18px; }

.slide-enter-active { animation: slideUp 0.3s ease; }
.slide-leave-active { animation: slideDown 0.3s ease; }

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes slideDown {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}
</style>
