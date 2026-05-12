<template>
  <div ref="containerRef" class="memory-particles">
    <div
      v-for="particle in store.memoryParticles"
      :key="particle.id"
      class="particle-marker"
      :style="{
        left: `${getParticlePosition(particle).x}px`,
        top: `${getParticlePosition(particle).y}px`
      }"
      @click="handleParticleClick(particle)"
    >
      <div class="particle-core" :class="{ active: activeParticleId === particle.id }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      </div>

      <transition name="fade">
        <div class="particle-card" v-if="activeParticleId === particle.id">
          <div class="card-header">
            <span class="card-title">前人感悟</span>
            <span class="card-date">{{ formatDate(particle.timestamp) }}</span>
          </div>

          <div class="card-quote">
            {{ particle.content }}
          </div>

          <div class="card-footer">
            <span class="author">——{{ particle.author }}</span>
            <span class="awaken-badge">{{ particle.awakenedCount }}次唤醒</span>
          </div>

          <button class="close-btn" @click.stop="closeInfo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useYanJingStore } from '../stores/useYanJingStore'

const store = useYanJingStore()
const activeParticleId = ref<string | null>(null)
const containerRef = ref<HTMLElement | null>(null)

let containerWidth = window.innerWidth
let containerHeight = window.innerHeight

function updateContainerSize() {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    containerWidth = rect.width
    containerHeight = rect.height
  }
}

function getParticlePosition(particle: any): { x: number; y: number } {
  const centerLng = 107.5035
  const centerLat = 31.2159
  const scale = 8000

  const x = (particle.lng - centerLng) * scale + containerWidth / 2
  const y = (centerLat - particle.lat) * scale + containerHeight / 2

  return {
    x: Math.max(40, Math.min(containerWidth - 40, x)),
    y: Math.max(100, Math.min(containerHeight - 200, y))
  }
}

function handleParticleClick(particle: any): void {
  if (activeParticleId.value === particle.id) {
    closeInfo()
  } else {
    activeParticleId.value = particle.id
    store.awakenMemory(particle.id)
  }
}

function closeInfo(): void {
  activeParticleId.value = null
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}.${month}.${day}`
}

function handleClickOutside(e: MouseEvent): void {
  if (!(e.target as HTMLElement).closest('.particle-marker')) {
    closeInfo()
  }
}

onMounted(() => {
  updateContainerSize()
  window.addEventListener('resize', updateContainerSize)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerSize)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.memory-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 90;
}

.particle-marker {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  z-index: 91;
}

.particle-core {
  width: 36px;
  height: 36px;
  background: #fff;
  border: 2px solid #c41e3a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c41e3a;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.particle-core:hover,
.particle-core.active {
  background: #C41E3A;
  color: #FFFFFF;
  transform: scale(1.1);
}

.particle-card {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 16px);
  transform: translateX(-50%);
  width: 280px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px;
  pointer-events: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #F0F0F0;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #2C3E50;
}

.card-date {
  font-size: 11px;
  color: #7F8C8D;
  font-family: 'SF Mono', Monaco, monospace;
}

.card-quote {
  font-family: "KaiTi", "STKaiti", "FangSong", serif;
  font-size: 14px;
  color: #2C3E50;
  line-height: 1.8;
  padding: 12px;
  background: #FFF5F5;
  border-left: 3px solid #C41E3A;
  border-radius: 0 8px 8px 0;
  margin-bottom: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author {
  font-size: 12px;
  color: #7F8C8D;
  font-style: normal;
}

.awaken-badge {
  font-size: 10px;
  color: #7F8C8D;
  background: #F8F9FA;
  padding: 4px 8px;
  border-radius: 4px;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: #7F8C8D;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-btn:hover {
  background: #F0F0F0;
  color: #2C3E50;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
