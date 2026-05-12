<template>
  <div class="ai-tutor" :class="{ visible: isVisible, expanded: isExpanded }">
    <div class="tutor-header" @click="togglePanel">
      <div class="tutor-avatar" :class="{ thinking: isSending }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
          <path d="M22 10V6a2 2 0 00-2-2H4a2 2 0 00-2 2v4"/>
          <path d="M2 14v4a2 2 0 002 2h16a2 2 0 002-2v-4"/>
          <path d="M12 10a4 4 0 100 8 4 4 0 000-8z"/>
          <path d="M6 10V6"/>
          <path d="M18 10V6"/>
        </svg>
        <span class="status-indicator" :class="{ online: !isSending, thinking: isSending }"></span>
      </div>
      <div class="tutor-info">
        <span class="tutor-name">AI研学导师</span>
        <span class="tutor-status">{{ isSending ? '思考中...' : '在线' }}</span>
      </div>
      <button
        v-if="!store.currentJointTask && messages.length > 1"
        class="voice-btn"
        :class="{ active: voiceEnabled, speaking: isSpeaking }"
        @click.stop="toggleVoice"
        title="语音播报"
      >
        <svg v-if="!isSpeaking" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <polygon points="11 5 6 9 2 9 20 9 15 11 11 17"/>
          <path d="M15.54 8.46a5 5 0 010 7.07" v-if="voiceEnabled"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
      </button>
    </div>

    <transition name="expand">
      <div class="tutor-panel" v-if="isExpanded || store.currentJointTask">
        <div v-if="store.currentJointTask" class="resonance-card">
          <div class="resonance-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span>认知共振任务</span>
          </div>
          <div class="resonance-content">
            <p class="task-desc">{{ store.currentJointTask.description }}</p>
            <div class="task-split">
              <div class="task-a">
                <span class="task-label">学生A</span>
                <p>{{ store.currentJointTask.forStudentA }}</p>
              </div>
              <div class="task-b">
                <span class="task-label">学生B</span>
                <p>{{ store.currentJointTask.forStudentB }}</p>
              </div>
            </div>
            <p class="topic-label">讨论话题</p>
            <p class="topic-text">{{ store.currentJointTask.discussionTopic }}</p>
          </div>
          <button class="complete-btn" @click="handleDismissTask">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            完成任务，继续探索
          </button>
        </div>

        <div v-else class="messages-area">
          <div
            v-for="(msg, idx) in visibleMessages"
            :key="idx"
            class="message-item"
            :class="msg.type"
          >
            <div class="message-avatar" v-if="msg.type !== 'user'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
                <path d="M22 10V6a2 2 0 00-2-2H4a2 2 0 00-2 2v4"/>
                <path d="M2 14v4a2 2 0 002 2h16a2 2 0 002-2v-4"/>
                <path d="M12 10a4 4 0 100 8 4 4 0 000-8z"/>
              </svg>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                {{ msg.content }}
                <button
                  v-if="msg.type === 'assistant' && voiceEnabled"
                  class="play-btn"
                  @click="speakMessage(msg.content)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </button>
              </div>
              <span class="time">{{ formatTime(msg.timestamp) }}</span>
            </div>
          </div>

          <div v-if="messages.length <= 1" class="welcome-state">
            <p class="welcome-title">研景AI导师已就绪</p>
            <p class="welcome-sub">专注于达州红色文化研学指导</p>
            <div class="quick-queries">
              <button @click="askAboutLocation">当前位置</button>
              <button @click="askAboutWeather">天气情况</button>
              <button @click="askAboutRoute">推荐路线</button>
            </div>
          </div>
        </div>

        <div class="input-bar" v-if="!store.currentJointTask">
          <input
            v-model="inputText"
            type="text"
            placeholder="输入研学问题..."
            @keyup.enter="sendMessage"
            :disabled="isSending"
          />
          <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim() || isSending">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useYanJingStore } from '../stores/useYanJingStore'
import { callDeepSeek } from '../utils/mockAi'

const store = useYanJingStore()
const isVisible = ref(true)
const isExpanded = ref(false)
const inputText = ref('')
const isSending = ref(false)
const isSpeaking = ref(false)
const voiceEnabled = ref(false)

interface Message {
  type: 'system' | 'assistant' | 'user'
  content: string
  timestamp: number
}

const messages = ref<Message[]>([
  {
    type: 'system',
    content: '欢迎来到研景·达州。我是AI研学导师，可以解答关于达州红色文化的相关问题。',
    timestamp: Date.now() - 60000
  }
])

const visibleMessages = computed(() => {
  return isExpanded.value ? messages.value : messages.value.slice(-3)
})

function togglePanel(): void {
  if (store.currentJointTask) return
  isExpanded.value = !isExpanded.value
}

function toggleVoice(): void {
  voiceEnabled.value = !voiceEnabled.value
}

async function sendMessage(): Promise<void> {
  if (!inputText.value.trim() || isSending.value) return

  const userMessage = inputText.value.trim()
  messages.value.push({
    type: 'user',
    content: userMessage,
    timestamp: Date.now()
  })

  inputText.value = ''
  isSending.value = true

  try {
    const response = await callDeepSeek(
      [{ role: 'user', content: userMessage }],
      '你是研景AI导师，专注于达州红色文化研学指导。回答简洁、有深度、有启发性。'
    )

    messages.value.push({
      type: 'assistant',
      content: response,
      timestamp: Date.now()
    })

    if (voiceEnabled.value) {
      setTimeout(() => speakMessage(response), 300)
    }
  } catch (error) {
    console.error('[AITutor] 发送消息失败:', error)
  } finally {
    isSending.value = false
  }
}

function speakMessage(text: string): void {
  if (!window.speechSynthesis || !text) return
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = 0.9
  utterance.onstart = () => { isSpeaking.value = true }
  utterance.onend = () => { isSpeaking.value = false }
  utterance.onerror = () => { isSpeaking.value = false }

  window.speechSynthesis.speak(utterance)
}

function handleDismissTask(): void {
  store.clearJointTask()
  isExpanded.value = false
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

function askAboutLocation(): void {
  inputText.value = '我现在在哪里？附近有什么景点？'
  sendMessage()
}

function askAboutWeather(): void {
  inputText.value = '今天天气怎么样？'
  sendMessage()
}

function askAboutRoute(): void {
  inputText.value = '请帮我规划研学路线'
  sendMessage()
}
</script>

<style scoped>
.ai-tutor {
  position: fixed;
  bottom: 90px;
  right: 20px;
  z-index: 200;
  width: 320px;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}

.tutor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #1A1A2E;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tutor-header:hover {
  background: #232338;
}

.tutor-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  background: #C41E3A;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #1A1A2E;
}

.status-indicator.online {
  background: #27AE60;
}

.status-indicator.thinking {
  background: #E67E22;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.tutor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tutor-name {
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
}

.tutor-status {
  font-size: 12px;
  color: #7F8C8D;
}

.voice-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #7F8C8D;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.voice-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
}

.voice-btn.active {
  background: rgba(196, 30, 58, 0.15);
  border-color: rgba(196, 30, 58, 0.3);
  color: #C41E3A;
}

.voice-btn.speaking {
  background: #C41E3A;
  border-color: #C41E3A;
  color: #FFFFFF;
}

.tutor-panel {
  margin-top: 8px;
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.resonance-card {
  padding: 16px;
}

.resonance-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #C41E3A;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #F0F0F0;
}

.resonance-content .task-desc {
  font-size: 13px;
  color: #2C3E50;
  line-height: 1.6;
  margin-bottom: 12px;
}

.task-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.task-a, .task-b {
  background: #F8F9FA;
  padding: 10px;
  border-radius: 8px;
}

.task-label {
  font-size: 10px;
  color: #7F8C8D;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 4px;
}

.task-a p, .task-b p {
  font-size: 12px;
  color: #2C3E50;
  margin: 0;
  line-height: 1.5;
}

.topic-label {
  font-size: 10px;
  color: #7F8C8D;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.topic-text {
  font-size: 12px;
  color: #2C3E50;
  font-style: italic;
  margin: 0;
}

.complete-btn {
  width: 100%;
  margin-top: 12px;
  padding: 10px 16px;
  background: #C41E3A;
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.complete-btn:hover {
  background: #A01830;
}

.messages-area {
  padding: 16px;
  max-height: 280px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  background: #F8F9FA;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7F8C8D;
  flex-shrink: 0;
}

.message-content {
  max-width: 75%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-bubble {
  background: #F8F9FA;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: #2C3E50;
  line-height: 1.5;
  position: relative;
  border: 1px solid #E0E0E0;
}

.message-item.user .message-bubble {
  background: #C41E3A;
  border-color: #C41E3A;
  color: #FFFFFF;
}

.message-bubble::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 10px;
  border: 6px solid transparent;
  border-right-color: #E0E0E0;
}

.message-item.user .message-bubble::before {
  left: auto;
  right: -6px;
  border-right-color: transparent;
  border-left-color: #C41E3A;
}

.play-btn {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  color: #7F8C8D;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-bubble:hover .play-btn {
  opacity: 1;
}

.time {
  font-size: 10px;
  color: #7F8C8D;
  padding-left: 4px;
}

.message-item.user .time {
  text-align: right;
  padding-right: 4px;
}

.welcome-state {
  text-align: center;
  padding: 20px 16px;
}

.welcome-title {
  font-size: 14px;
  font-weight: 600;
  color: #2C3E50;
  margin: 0 0 4px 0;
}

.welcome-sub {
  font-size: 12px;
  color: #7F8C8D;
  margin: 0 0 16px 0;
}

.quick-queries {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.quick-queries button {
  padding: 8px 12px;
  background: #F8F9FA;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 12px;
  color: #2C3E50;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-queries button:hover {
  background: #C41E3A;
  border-color: #C41E3A;
  color: #FFFFFF;
}

.input-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #F0F0F0;
  background: #FAFAFA;
}

.input-bar input {
  flex: 1;
  padding: 10px 14px;
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 13px;
  color: #2C3E50;
  outline: none;
  transition: border-color 0.3s;
}

.input-bar input:focus {
  border-color: #C41E3A;
}

.input-bar input::placeholder {
  color: #7F8C8D;
}

.send-btn {
  width: 40px;
  height: 40px;
  background: #C41E3A;
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.send-btn:hover:not(:disabled) {
  background: #A01830;
}

.send-btn:disabled {
  background: #CCCCCC;
  cursor: not-allowed;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  transform: translateY(0);
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
