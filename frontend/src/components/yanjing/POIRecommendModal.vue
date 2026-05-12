<template>
  <Transition name="modal">
    <div v-if="show" class="recommend-overlay" @click.self="emit('close')">
      <div class="recommend-card">
        <div class="card-header">
          <div class="poi-info">
            <h2 class="poi-name">{{ poi?.name }}</h2>
            <span class="poi-type" :class="poi?.type">{{ getTypeName(poi?.type) }}</span>
          </div>
          <button class="close-btn" @click="emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <p class="poi-desc">{{ poi?.description }}</p>

        <div class="weather-info">
          <span class="weather-icon">{{ weatherIcon }}</span>
          <span class="weather-temp">{{ store.weather.temp }}°C {{ store.weather.condition }}</span>
          <span class="weather-score">舒适度 {{ store.weather.comfort }}%</span>
        </div>

        <div class="route-info">
          <div class="info-row">
            <span class="info-label">预计时长</span>
            <span class="info-value">{{ poi?.timeCost }} 分钟</span>
          </div>
          <div class="info-row">
            <span class="info-label">教育收益</span>
            <span class="info-value highlight">{{ getEduScore() }} 分</span>
          </div>
          <div class="info-row">
            <span class="info-label">天气敏感</span>
            <span class="info-value" :class="poi?.weatherSensitive ? 'warning' : 'safe'">
              {{ poi?.weatherSensitive ? '⚠️ 敏感' : '✅ 不限' }}
            </span>
          </div>
        </div>

        <div class="ai-analysis">
          <div class="ai-header">
            <span class="ai-tag">智能分析</span>
          </div>
          <p class="ai-text">{{ getAnalysisText() }}</p>
        </div>

        <button class="confirm-btn" @click="handleConfirmPlan">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          确认规划路线
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useYanJingStore, type POI } from '../../stores/yanjing'

const props = defineProps<{
  show: boolean
  poi: POI | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm-plan', poi: POI): void
}>()

const store = useYanJingStore()

const weatherIcon = computed(() => {
  const icons: Record<string, string> = { sunny: '☀️', cloudy: '⛅', rain: '🌧️', fog: '🌫️' }
  return icons[store.weather.icon] || '☀️'
})

function getTypeName(type?: string): string {
  const names: Record<string, string> = { red: '红色历史', nature: '自然风光', culture: '文化场馆', food: '特色美食' }
  return names[type || ''] || '研学点'
}

function getEduScore(): string {
  if (!props.poi) return '0'
  const c = store.cognition
  const edu = props.poi.eduTags
  const score = (edu.history * c.history + edu.logic * c.logic + edu.empathy * c.empathy + edu.attention * c.attention) / 4
  return (score * 100).toFixed(0)
}

function getAnalysisText(): string {
  if (!props.poi) return ''
  const c = store.cognition
  const texts: string[] = []

  if (c.history > 0.6 && props.poi.eduTags.history > 0.7) {
    texts.push('符合你的历史兴趣')
  }
  if (props.poi.weatherSensitive && store.weather.comfort < 60) {
    texts.push('今日天气可能影响体验')
  } else if (!props.poi.weatherSensitive) {
    texts.push('不受天气影响')
  }
  if (props.poi.timeCost <= 60) {
    texts.push('游览时间适中')
  }

  return texts.length > 0 ? texts.join('，') + '。' : '综合评估适合参观。'
}

function handleConfirmPlan() {
  if (!props.poi) return
  emit('confirm-plan', props.poi)
  emit('close')
}
</script>

<style scoped>
.recommend-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 8000;
  backdrop-filter: blur(4px);
}

.recommend-card {
  width: 90%;
  max-width: 380px;
  background: linear-gradient(180deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98));
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.poi-info { flex: 1; }

.poi-name {
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 6px;
}

.poi-type {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.poi-type.red { background: rgba(220,38,38,0.2); color: #fca5a5; }
.poi-type.nature { background: rgba(34,197,94,0.2); color: #86efac; }
.poi-type.culture { background: rgba(59,130,246,0.2); color: #93c5fd; }
.poi-type.food { background: rgba(245,158,11,0.2); color: #fcd34d; }

.close-btn {
  width: 28px;
  height: 28px;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover { background: rgba(255,255,255,0.2); }
.close-btn svg { width: 16px; height: 16px; }

.poi-desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0 0 14px;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(59,130,246,0.1);
  border-radius: 10px;
  margin-bottom: 14px;
  font-size: 13px;
}

.weather-icon { font-size: 18px; }
.weather-temp { color: #f1f5f9; font-weight: 500; }
.weather-score { color: #22c55e; margin-left: auto; }

.route-info {
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 14px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.info-row:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.05); }

.info-label { font-size: 13px; color: #64748b; }
.info-value { font-size: 13px; font-weight: 600; color: #f1f5f9; }
.info-value.highlight { color: #a855f7; }
.info-value.warning { color: #f59e0b; }
.info-value.safe { color: #22c55e; }

.ai-analysis {
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}

.ai-header { margin-bottom: 6px; }

.ai-tag {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(99,102,241,0.3);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #a5b4fc;
}

.ai-text {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0;
}

.confirm-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34,197,94,0.4);
}

.confirm-btn svg { width: 18px; height: 18px; }

.modal-enter-active { animation: fadeIn 0.2s ease; }
.modal-leave-active { animation: fadeOut 0.2s ease; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }

@media (max-width: 768px) {
  .recommend-card { margin: 16px; }
}
</style>
