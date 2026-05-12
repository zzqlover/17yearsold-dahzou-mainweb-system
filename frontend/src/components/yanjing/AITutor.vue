<template>
  <div class="ai-tutor-btn">
    <button class="tutor-button" @click="toggleChat" title="AI导师">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span class="tutor-dot" v-if="hasNewMessage"></span>
    </button>

    <div class="tutor-bubble" :class="{ visible: displayText }">
      <span class="bubble-text">{{ displayText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useYanJingStore } from '../../stores/yanjing'

const store = useYanJingStore()
const displayText = ref('')
const hasNewMessage = ref(false)

watch(() => store.tutorMessages, (msgs) => {
  if (msgs.length > 0) {
    const last = msgs[msgs.length - 1]
    displayText.value = last.text
    hasNewMessage.value = true
    setTimeout(() => { hasNewMessage.value = false }, 2000)
  }
}, { deep: true })

function toggleChat() {
  window.dispatchEvent(new CustomEvent('toggle-ai-chat'))
}
</script>

<style scoped>
.ai-tutor-btn {
  position: absolute;
  bottom: 156px;
  right: 16px;
  z-index: 100;
}

.tutor-button {
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
  transition: all 0.35s ease;
}

.tutor-button:hover {
  background: rgba(36, 36, 38, 0.95);
  color: rgba(203, 213, 225, 0.9);
  transform: translateY(-1px);
}

.tutor-button svg {
  width: 18px;
  height: 18px;
}

.tutor-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(201, 165, 90, 0.6);
  animation: dotPulse 2s ease infinite;
}

@keyframes dotPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.85);
  }
}

.tutor-bubble {
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  max-width: 260px;
  padding: 12px 16px;
  background: rgba(22, 22, 26, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  opacity: 0;
  transform: translateY(8px) scale(0.95);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  pointer-events: none;
}

.tutor-bubble.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.bubble-text {
  font-size: 12.5px;
  line-height: 1.65;
  color: rgba(241, 245, 249, 0.88);
}
</style>