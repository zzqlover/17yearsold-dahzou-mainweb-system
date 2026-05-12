<template>
  <div class="yanjing-app">
    <!-- 地图核心组件 -->
    <YanJingMap
      ref="mapRef"
      :show-route="showRoute"
      @location-change="handleLocationChange"
      @poi-click="handlePoiClick"
    />

    <!-- AI导师组件 -->
    <AITutor
      ref="tutorRef"
    />

    <!-- 认知诊断弹窗 -->
    <CognitionModal
      :show="showCognitionModal"
      @complete="handleCognitionComplete"
      @close="handleCognitionClose"
    />

    <!-- 规划面板 -->
    <PlannerPanel v-if="showPlanner" />

    <!-- 任务信息弹窗 -->
    <Transition name="slide">
      <div v-if="currentTask" class="task-modal">
        <div class="task-content">
          <div class="task-header">
            <span class="task-badge">{{ currentTask.type }}</span>
            <button class="close-btn" @click="closeTask">&times;</button>
          </div>
          <h3 class="task-title">{{ currentTask.name }}</h3>
          <p class="task-desc">{{ currentTask.description }}</p>
          <div class="task-card">
            <div class="task-card-icon">📋</div>
            <div class="task-card-content">
              <strong>任务</strong>
              <p>{{ currentTask.task }}</p>
            </div>
          </div>
          <button class="start-task-btn" @click="startTask">
            开始任务
          </button>
        </div>
      </div>
    </Transition>

    <!-- AI导师悬浮按钮 (已移至右下角AITutor组件) -->
    <!-- <button class="ai-float-btn" @click="toggleAIPanel" :class="{ active: showAIPanel }">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5A2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5z"/>
      </svg>
      <span>AI导师</span>
    </button> -->

    <!-- 返回官网按钮 -->
    <button class="home-float-btn" @click="goHome">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </button>

    <!-- AI聊天面板 -->
    <div class="ai-chat-panel" v-if="showAIPanel">
      <div class="chat-header">
        <span>AI导师</span>
        <button class="chat-close" @click="showAIPanel = false">&times;</button>
      </div>
      <div class="chat-messages" ref="chatMessages">
        <div v-for="(msg, idx) in chatHistory" :key="idx" class="chat-message" :class="msg.role">
          <span class="msg-content">{{ msg.content }}</span>
        </div>
        <div v-if="chatLoading" class="chat-message tutor">
          <span class="msg-content">思考中...</span>
        </div>
      </div>
      <div class="chat-input-area">
        <div class="chat-input-wrapper">
          <div class="chat-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <input
            v-model="chatInput"
            class="chat-input"
            placeholder="向AI导师提问..."
            @keyup.enter="sendChatMessage"
            :disabled="chatLoading"
          />
        </div>
        <button class="chat-send" @click="sendChatMessage" :disabled="chatLoading || !chatInput.trim()">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Toast提示 -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useYanJingStore, type POI } from '../stores/yanjing'
import { callDeepSeek } from '../utils/mockAi'
import YanJingMap from '../components/yanjing/YanJingMap.vue'
import AITutor from '../components/yanjing/AITutor.vue'
import CognitionModal from '../components/yanjing/CognitionModal.vue'
import PlannerPanel from '../components/yanjing/PlannerPanel.vue'

const router = useRouter()
const store = useYanJingStore()
const mapRef = ref<InstanceType<typeof YanJingMap> | null>(null)
const tutorRef = ref<InstanceType<typeof AITutor> | null>(null)

const showRoute = ref(true)
const showCognitionModal = ref(false)
const showTutorInput = ref(false)
const showPlanner = ref(true)
const showAIPanel = ref(false)
const chatInput = ref('')
const chatHistory = ref<Array<{ role: string; content: string }>>([])
const chatLoading = ref(false)
const chatMessages = ref<HTMLElement | null>(null)
const tutorMessage = ref('')
const currentTask = ref<POI | null>(null)
const toast = ref({ show: false, message: '', type: 'info' })

// 切换AI面板
function toggleAIPanel() {
  showAIPanel.value = !showAIPanel.value
  if (showAIPanel.value) {
    // 请求AI导师的初始问候
    requestAIGreeting()
  }
}

// 请求AI问候
async function requestAIGreeting() {
  const greeting = await callDeepSeek('', 'encourage')
  chatHistory.value = [{ role: 'tutor', content: greeting }]
  chatLoading.value = false
}

// 发送聊天消息
async function sendChatMessage() {
  const text = chatInput.value.trim()
  if (!text || chatLoading.value) return

  chatLoading.value = true
  chatInput.value = ''

  // 添加用户消息
  chatHistory.value.push({ role: 'user', content: text })

  // 滚动到底部
  setTimeout(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  }, 50)

  try {
    // 调用AI
    const response = await callDeepSeek('', 'question')
    chatHistory.value.push({ role: 'tutor', content: response })
  } catch (e) {
    chatHistory.value.push({ role: 'tutor', content: '抱歉，暂时无法回答，请稍后再试。' })
  }

  chatLoading.value = false

  // 滚动到底部
  setTimeout(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  }, 50)
}

// 返回官网
function goHome() {
  router.push('/')
}

onMounted(() => {
  store.fetchWeather()
  store.pushTutorMessage('欢迎来到研景！我是你的AI导师，点击地图上的景点开始你的研学之旅吧。', 'tutor')

  // 初始化定位
  store.updateLocation({ lng: 107.5035, lat: 31.2159 })

  // 立即开始规划路线
  setTimeout(async () => {
    const plan = await store.planRoute()
    if (plan && plan.stationOrder.length > 0) {
      store.pushTutorMessage(`研学路线已规划完成！将依次访问：${plan.stationOrder.map(p => p.name).join(' → ')}`)
      showToast('智能路线规划成功', 'success')
    }
  }, 1000)

  window.addEventListener('start-poi-task', handleStartPoiTask as EventListener)
  window.addEventListener('station-closed', handleStationClosed as EventListener)
  window.addEventListener('toggle-ai-chat', toggleAIPanel as EventListener)
  window.addEventListener('poi-recommend', handlePoiRecommend as EventListener)

  setInterval(() => {
    store.fetchWeather()
  }, 180000)
})

onUnmounted(() => {
  window.removeEventListener('start-poi-task', handleStartPoiTask as EventListener)
  window.removeEventListener('station-closed', handleStationClosed as EventListener)
  window.removeEventListener('poi-recommend', handlePoiRecommend as EventListener)
})

function handleCognitionComplete(profile: any) {
  showCognitionModal.value = false
  showPlanner.value = true

  store.pushTutorMessage(`你好！我已了解你的特质。你的认知等级为"${profile.level}"，今天为你定制了专属研学路线。`)

  setTimeout(async () => {
    const plan = await store.planRoute()
    if (plan && plan.stationOrder.length > 0) {
      store.pushTutorMessage(`已为你规划最优路线！将依次访问：${plan.stationOrder.map(p => p.name).join(' → ')}。让我们开始研学之旅吧！`)
      showToast('路线规划完成', 'success')
    }
  }, 2000)
}

function handleCognitionClose() {}

function handleLocationChange(pos: [number, number]) {
  store.updateLocation({ lng: pos[0], lat: pos[1] })
}

function handlePoiClick(poi: POI) {
  currentTask.value = poi
}

function handlePoiRecommend(e: CustomEvent) {
  const poiId = e.detail
  const poi = store.pois.find(p => p.id === poiId)
  if (poi) {
    currentTask.value = poi
  }
}

function closeTask() {
  currentTask.value = null
}

async function startTask() {
  if (!currentTask.value) {
    console.warn('startTask called but currentTask is null')
    return
  }

  const poi = currentTask.value
  console.log('开始任务，POI:', poi)

  if (!poi.type || !poi.name) {
    console.error('POI数据不完整:', poi)
    store.pushTutorMessage('抱歉，景点信息不完整，请选择其他景点。')
    return
  }

  showTutorInput.value = true

  try {
    const question = await callDeepSeek('', 'question', poi)
    store.pushTutorMessage(question)
  } catch (e) {
    console.error('生成问题失败:', e)
    store.pushTutorMessage('抱歉，生成问题失败了，请重试。')
  }

  currentTask.value = null
}

async function handleAnswerSubmit(answer: string) {
  if (!answer.trim()) return

  showTutorInput.value = false

  const currentPoiId = 'current-poi'
  const updatedProfile = await store.evaluateAnswer(currentPoiId, answer)

  const comment = getEncouragement(updatedProfile)
  store.pushTutorMessage(comment)

  showToast('回答已记录，认知画像已更新', 'success')
}

function getEncouragement(profile: any): string {
  const theta = profile?.theta ?? 0
  if (theta > 0.5) {
    return '太棒了！你的回答展现了出色的思辨能力。继续挑战更高难度的任务吧！'
  } else if (theta > 0) {
    return '很好的思考！你的分析能力不错。尝试从更多角度思考问题会有更大收获。'
  } else if (theta > -0.5) {
    return '不错的尝试！多了解一些历史背景会让你的回答更加丰富。继续加油！'
  } else {
    return '每个人都有自己的学习节奏。建议先阅读更多相关资料，再来挑战任务。'
  }
}

function handleStartPoiTask(e: CustomEvent) {
  const poiId = e.detail
  const poi = store.poiList.find(p => p.id === poiId)
  if (poi) {
    currentTask.value = poi
  }
}

function handleStationClosed(e: CustomEvent) {
  const poiName = e.detail.poiName
  store.pushTutorMessage(`检测到${poiName}临时关闭，已为您重新规划路线。`)

  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(`检测到${poiName}临时关闭，已为您重新规划路线。`)
    utterance.lang = 'zh-CN'
    speechSynthesis.speak(utterance)
  }
}

function handleTutorSpeakStart() {}
function handleTutorSpeakEnd() {}

function showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

watch(() => store.weather, (newWeather) => {
  if (newWeather.condition.includes('雨') || newWeather.condition.includes('雷')) {
    store.pushTutorMessage(`今天有小雨（${newWeather.temp}°C），已为您自动调整路线，避开户外陡坡路段。`)
  } else if (newWeather.condition.includes('雾')) {
    store.pushTutorMessage(`当前有雾，能见度较低，请注意出行安全，我会放慢讲解节奏。`)
  } else if (newWeather.temp > 30) {
    store.pushTutorMessage(`今天气温较高（${newWeather.temp}°C），记得补充水分，我会增加室内讲解环节。`)
  }
}, { deep: true })
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #1A1A2E;
  color: #f1f5f9;
  overflow: hidden;
}

.yanjing-app {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #1A1A2E;
}

.task-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 380px;
  background: rgba(12, 12, 16, 0.98);
  border: 1px solid rgba(201, 165, 90, 0.08);
  border-radius: 12px;
  padding: 28px;
  z-index: 600;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.task-badge {
  background: rgba(201, 165, 90, 0.1);
  color: rgba(201, 165, 90, 0.85);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
}

.close-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.03);
  border: none;
  border-radius: 6px;
  color: rgba(148, 163, 184, 0.4);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(203, 213, 225, 0.7);
}

.task-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(241, 245, 249, 0.95);
  margin-bottom: 10px;
  letter-spacing: 0.02em;
}

.task-desc {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.6);
  line-height: 1.7;
  margin-bottom: 20px;
}

.task-card {
  display: flex;
  gap: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.task-card-icon {
  font-size: 22px;
  opacity: 0.8;
}

.task-card-content strong {
  display: block;
  font-size: 12px;
  color: rgba(201, 165, 90, 0.75);
  margin-bottom: 6px;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.task-card-content p {
  font-size: 13px;
  color: rgba(203, 213, 225, 0.7);
  line-height: 1.6;
}

.start-task-btn {
  width: 100%;
  padding: 13px;
  background: rgba(201, 165, 90, 0.08);
  border: 1px solid rgba(201, 165, 90, 0.15);
  border-radius: 8px;
  color: rgba(201, 165, 90, 0.9);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.35s ease;
  letter-spacing: 0.05em;
}

.start-task-btn:hover {
  background: rgba(201, 165, 90, 0.12);
  border-color: rgba(201, 165, 90, 0.25);
}

/* 返回官网按钮 - 高级简约 */
.home-float-btn {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 38px;
  height: 38px;
  background: rgba(15, 15, 18, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: rgba(148, 163, 184, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: all 0.35s ease;
}

.home-float-btn:hover {
  background: rgba(20, 20, 24, 0.95);
  color: rgba(201, 165, 90, 0.7);
  border-color: rgba(201, 165, 90, 0.1);
}

.home-float-btn svg {
  width: 16px;
  height: 16px;
}

/* AI聊天面板 - 高级设计 */
.ai-chat-panel {
  position: fixed;
  top: 64px;
  right: 16px;
  width: 340px;
  max-width: calc(100vw - 32px);
  height: 440px;
  max-height: calc(100vh - 100px);
  background: rgba(10, 10, 14, 0.98);
  border: 1px solid rgba(201, 165, 90, 0.06);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  z-index: 1050;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  font-size: 13px;
  font-weight: 500;
  color: rgba(201, 165, 90, 0.8);
  letter-spacing: 0.03em;
}

.chat-close {
  background: none;
  border: none;
  color: rgba(148, 163, 184, 0.35);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.3s ease;
}

.chat-close:hover {
  color: rgba(203, 213, 225, 0.6);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  max-width: 88%;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
}

.chat-message.user {
  align-self: flex-end;
  background: rgba(50, 55, 50, 0.6);
  color: rgba(224, 224, 224, 0.9);
  border-bottom-right-radius: 4px;
}

.chat-message.tutor {
  align-self: flex-start;
  background: rgba(30, 30, 34, 0.7);
  color: rgba(208, 208, 208, 0.85);
  border-bottom-left-radius: 4px;
}

.msg-content {
  word-break: break-word;
}

.chat-input-area {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(180deg, rgba(18, 18, 26, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%);
  border-top: 1px solid rgba(212, 175, 122, 0.1);
  position: relative;
}

.chat-input-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 122, 0.3), transparent);
}

.chat-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(10, 10, 15, 0.6);
  border: 1px solid rgba(212, 175, 122, 0.15);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.chat-input-wrapper::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 12px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(212, 175, 122, 0.3), rgba(212, 175, 122, 0.05), rgba(212, 175, 122, 0.2));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.chat-input-wrapper:focus-within::before {
  opacity: 1;
}

.chat-input-wrapper:focus-within {
  border-color: rgba(212, 175, 122, 0.3);
  background: rgba(15, 15, 20, 0.8);
  box-shadow: 0 0 20px rgba(212, 175, 122, 0.1), inset 0 0 20px rgba(212, 175, 122, 0.03);
}

.chat-input {
  flex: 1;
  padding: 14px 18px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: 0.3px;
}

.chat-input:focus {
  outline: none;
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
  letter-spacing: 0.5px;
}

.chat-input-icon {
  padding-left: 14px;
  color: rgba(212, 175, 122, 0.4);
  transition: color 0.3s ease;
}

.chat-input-wrapper:focus-within .chat-input-icon {
  color: rgba(212, 175, 122, 0.7);
}

.chat-send {
  width: 42px;
  height: 42px;
  background: rgba(201, 165, 90, 0.08);
  border: 1px solid rgba(201, 165, 90, 0.12);
  border-radius: 8px;
  color: rgba(201, 165, 90, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.chat-send:hover:not(:disabled) {
  background: rgba(201, 165, 90, 0.12);
  border-color: rgba(201, 165, 90, 0.2);
}

.chat-send:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.chat-send svg {
  width: 18px;
  height: 18px;
}

/* Toast提示 - 高级风格 */
.toast {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 28px;
  background: rgba(15, 15, 18, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  font-size: 13px;
  color: rgba(241, 245, 249, 0.9);
  z-index: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.toast.success {
  border-color: rgba(34, 197, 94, 0.15);
  color: rgba(134, 239, 172, 0.9);
}

.toast.warning {
  border-color: rgba(245, 158, 11, 0.15);
  color: rgba(253, 230, 138, 0.9);
}

.toast.error {
  border-color: rgba(239, 68, 68, 0.15);
  color: rgba(252, 165, 165, 0.9);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.92);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

@media (max-width: 768px) {
  .task-modal {
    width: 95%;
    padding: 20px;
  }

  .task-title {
    font-size: 18px;
  }

  .ai-chat-panel {
    top: 60px;
    right: 10px;
    left: 10px;
    width: auto;
    max-width: none;
  }
}
</style>
