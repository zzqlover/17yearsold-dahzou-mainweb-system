<template>
  <Transition name="alert">
    <div v-if="store.showFenceAlert" class="fence-alert-overlay">
      <div class="alert-card">
        <div class="alert-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h2 class="alert-title">安全警告</h2>
        <p class="alert-message">你已离开研学安全区域！</p>
        <div class="alert-distance">
          <span>距离安全区域</span>
          <strong>{{ Math.round(store.distanceToFence - store.fenceRadius) }}米</strong>
        </div>
        <button class="return-btn" @click="handleReturn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          返回安全区域
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useYanJingStore } from '../../stores/yanjing'

const store = useYanJingStore()

function handleReturn() {
  store.returnToSafety()
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance('已安全返回，继续研学之旅')
    u.lang = 'zh-CN'
    speechSynthesis.speak(u)
  }
}
</script>

<style scoped>
.fence-alert-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.3) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.alert-card {
  max-width: 360px;
  padding: 32px;
  background: rgba(15,23,42,0.98);
  border: 2px solid #dc2626;
  border-radius: 20px;
  text-align: center;
  animation: pulse 0.5s ease infinite;
  box-shadow: 0 0 60px rgba(220,38,38,0.4);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.alert-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 16px;
  color: #dc2626;
  animation: shake 0.5s ease infinite;
}

.alert-icon svg { width: 100%; height: 100%; }

@keyframes shake {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.alert-title {
  font-size: 26px;
  font-weight: 700;
  color: #dc2626;
  margin: 0 0 8px;
}

.alert-message {
  font-size: 16px;
  color: #f1f5f9;
  margin: 0 0 16px;
}

.alert-distance {
  background: rgba(220,38,38,0.1);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #94a3b8;
}

.alert-distance strong {
  display: block;
  font-size: 20px;
  color: #dc2626;
  margin-top: 4px;
}

.return-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.return-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(34,197,94,0.4);
}

.return-btn svg { width: 18px; height: 18px; }

.alert-enter-active { animation: fadeIn 0.3s ease; }
.alert-leave-active { animation: fadeOut 0.3s ease; }

@keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
@keyframes fadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
</style>
