<template>
  <div class="ai-tutor" :class="{ expanded: isExpanded, thinking: isThinking }">
    <div class="tutor-avatar" @click="toggleExpand">
      <div class="avatar-face" :class="'mood-' + currentMood">
        <div class="face-circle">
          <svg viewBox="0 0 100 100" class="face-svg">
            <circle cx="30" cy="38" r="6" fill="#1a1a2e" :class="{ 'eye-blink': blinking }"/>
            <circle cx="70" cy="38" r="6" fill="#1a1a2e" :class="{ 'eye-blink': blinking }"/>
            <path
              v-if="currentMood === 'happy'"
              d="M 25 65 Q 50 85 75 65"
              stroke="#1a1a2e"
              stroke-width="4"
              stroke-linecap="round"
              fill="none"
            />
            <path
              v-else-if="currentMood === 'thinking'"
              d="M 35 70 Q 50 62 65 70"
              stroke="#1a1a2e"
              stroke-width="3"
              stroke-linecap="round"
              fill="none"
            />
            <path
              v-else-if="currentMood === 'surprised'"
              d="M 40 68 Q 50 82 60 68"
              stroke="#1a1a2e"
              stroke-width="3.5"
              stroke-linecap="round"
              fill="none"
            />
            <line
              v-else
              x1="28" y1="72" x2="72" y2="72"
              stroke="#1a1a2e"
              stroke-width="4"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="avatar-glow"></div>
      </div>

      <div class="tutor-status">
        <span class="status-dot" :class="{ active: !isThinking }"></span>
        <span class="status-text">{{ statusText }}</span>
      </div>
    </div>

    <transition name="chat-expand">
      <div class="tutor-chat" v-show="isExpanded">
        <div class="chat-header">
          <span class="tutor-name"> 研学导师</span>
          <button class="test-btn" @click.stop="$emit('cognitive-test-start')" v-if="!cognitiveProfile?.theta">
             认知诊断
          </button>
          <button class="test-btn done" v-else @click.stop>
            {{ cognitiveProfile.level }}
          </button>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <transition-group name="message-fade" tag="div">
            <div
              v-for="(msg, i) in messages"
              :key="i"
              class="message-row"
              :class="msg.role"
            >
              <div class="message-bubble">
                <p>{{ msg.text }}</p>
                <span class="msg-time">{{ msg.time }}</span>
              </div>
            </div>
          </transition-group>

          <div v-if="isThinking" class="thinking-indicator">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>

        <div class="chat-input-area">
          <div class="quick-replies" v-if="showQuickReplies && messages.length <= 3">
            <button
              v-for="(reply, i) in quickReplies"
              :key="i"
              class="quick-reply-btn"
              @click="sendQuickReply(reply)"
            >
              {{ reply }}
            </button>
          </div>
          <div class="input-row">
            <input
              ref="inputRef"
              type="text"
              v-model="inputText"
              @keyup.enter="sendMessage"
              placeholder="和导师对话..."
              :disabled="isThinking"
            />
            <button @click="sendMessage" :disabled="isThinking || !inputText.trim()">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'

export default {
  name: 'AITutor',
  props: {
    studentName: { type: String, default: '同学' },
    cognitiveProfile: { type: Object, default: () => ({}) }
  },
  emits: ['message-sent', 'cognitive-test-start'],
  setup(props, { emit }) {
    const isExpanded = ref(false)
    const isThinking = ref(false)
    const currentMood = ref('neutral')
    const inputText = ref('')
    const messagesContainer = ref(null)
    const inputRef = ref(null)
    const showQuickReplies = ref(true)
    const blinking = ref(false)

    const formatTime = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

    const messages = ref([
      {
        role: 'ai',
        text: `你好，${props.studentName}！我是你的研学AI导师。今天我们将一起探索达州的红色文化。准备好了吗？`,
        time: formatTime()
      }
    ])

    const quickReplies = [
      '准备好了！',
      '我想先了解今天的路线',
      '开始认知诊断',
      '今天天气怎么样？'
    ]

    let blinkTimer

    const statusText = computed(() => {
      if (isThinking.value) return '思考中...'
      if (!props.cognitiveProfile?.theta) return '等待诊断'
      return `等级: ${props.cognitiveProfile.level}`
    })

    const toggleExpand = () => {
      isExpanded.value = !isExpanded.value
      if (isExpanded.value) {
        nextTick(() => {
          inputRef.value?.focus()
          scrollToBottom()
        })
      }
    }

    const sendMessage = async () => {
      if (!inputText.value.trim() || isThinking.value) return

      const text = inputText.value.trim()
      inputText.value = ''
      showQuickReplies.value = false

      addMessage('student', text)
      setMood('thinking')

      emit('message-sent', text)

      isThinking.value = true
    }

    const sendQuickReply = (reply) => {
      inputText.value = reply
      sendMessage()
    }

    const receiveResponse = async (replyText) => {
      await new Promise(r => setTimeout(r, 800 + Math.random() * 1200))

      addMessage('ai', replyText)

      const moodMap = {
        '?': 'surprised',
        '！': 'happy',
        '吗？': 'thinking',
        '好': 'happy',
        '注意': 'neutral'
      }

      let detectedMood = 'neutral'
      for (const [key, mood] of Object.entries(moodMap)) {
        if (replyText.includes(key)) {
          detectedMood = mood
          break
        }
      }
      setMood(detectedMood)

      isThinking.value = false
      nextTick(scrollToBottom)
    }

    const addMessage = (role, text) => {
      messages.value.push({ role, text, time: formatTime() })
      nextTick(scrollToBottom)
    }

    const setMood = (mood) => {
      currentMood.value = mood
    }

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    onMounted(() => {
      blinkTimer = setInterval(() => {
        blinking.value = true
        setTimeout(() => { blinking.value = false }, 150)
      }, 3500 + Math.random() * 2000)
    })

    onUnmounted(() => {
      if (blinkTimer) clearInterval(blinkTimer)
    })

    watch(isExpanded, (val) => {
      if (val) setTimeout(scrollToBottom, 300)
    })

    return {
      isExpanded,
      isThinking,
      currentMood,
      inputText,
      messages,
      quickReplies,
      showQuickReplies,
      messagesContainer,
      inputRef,
      blinking,
      statusText,
      toggleExpand,
      sendMessage,
      sendQuickReply,
      receiveResponse
    }
  }
}
</script>

<style scoped>
.ai-tutor {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 200;
}

.tutor-avatar {
  width: 72px;
  height: 72px;
  cursor: pointer;
  position: relative;
  transition: transform 0.3s ease;
}
.tutor-avatar:hover { transform: scale(1.08); }

.avatar-face {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  background: linear-gradient(145deg, #fbbf24, #f59e0b);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 32px rgba(245, 158, 11, 0.35),
    0 0 0 4px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.mood-happy .avatar-face { background: linear-gradient(145deg, #34d399, #10b981); box-shadow: 0 8px 32px rgba(16, 185, 129, 0.35), 0 0 0 4px rgba(52, 211, 153, 0.15); }
.mood-thinking .avatar-face { background: linear-gradient(145deg, #818cf8, #6366f1); box-shadow: 0 8px 32px rgba(99, 102, 241, 0.35), 0 0 0 4px rgba(129, 140, 248, 0.15); }
.mood-surprised .avatar-face { background: linear-gradient(145deg, #f472b6, #ec4899); box-shadow: 0 8px 32px rgba(236, 72, 153, 0.35), 0 0 0 4px rgba(244, 114, 182, 0.15); }
.thinking .avatar-face { animation: thinkPulse 1.5s infinite; }

@keyframes thinkPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.face-circle { width: 48px; height: 48px; }
.face-svg { width: 100%; height: 100%; }

.eye-blink { animation: eyeBlink 0.2s ease; }
@keyframes eyeBlink { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.1); } }

.avatar-glow {
  position: absolute;
  inset: -8px;
  border-radius: 32px;
  background: conic-gradient(from 180deg, transparent, rgba(251, 191, 36, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s;
  filter: blur(12px);
  z-index: -1;
}
.tutor-avatar:hover .avatar-glow { opacity: 1; }

.tutor-status {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
}
.status-dot.active { background: #34d399; box-shadow: 0 0 6px rgba(52, 211, 153, 0.6); animation: dotPulse 2s infinite; }

@keyframes dotPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.status-text { font-size: 10px; color: rgba(255, 255, 255, 0.5); text-shadow: 0 1px 3px rgba(0,0,0,0.8); }

.tutor-chat {
  position: absolute;
  bottom: 84px;
  left: 0;
  width: 340px;
  max-height: 480px;
  background: linear-gradient(165deg, rgba(17, 17, 27, 0.97), rgba(13, 13, 21, 0.98));
  backdrop-filter: blur(24px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.4), 0 0 60px rgba(139, 92, 246, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-expand-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.chat-expand-leave-active { transition: all 0.25s ease-in; }
.chat-expand-enter-from, .chat-expand-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }

.chat-header {
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.tutor-name { font-size: 13px; font-weight: 600; color: rgba(255, 255, 255, 0.9); letter-spacing: 0.02em; }

.test-btn {
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px dashed rgba(139, 92, 246, 0.5);
  background: rgba(139, 92, 246, 0.1);
  color: #a78bfa;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}
.test-btn:hover { background: rgba(139, 92, 246, 0.2); border-style: solid; }
.test-btn.done { border-color: rgba(52, 211, 153, 0.5); background: rgba(52, 211, 153, 0.1); color: #34d399; }

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
  min-height: 200px;
  max-height: 280px;
}

.message-row {
  margin-bottom: 12px;
  display: flex;
}
.message-row.student { justify-content: flex-end; }

.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 13px;
  line-height: 1.55;
}

.message-row.ai .message-bubble {
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.15);
  color: rgba(255, 255, 255, 0.85);
  border-bottom-left-radius: 4px;
}

.message-row.student .message-bubble {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.msg-time {
  display: block;
  font-size: 10px;
  opacity: 0.45;
  margin-top: 4px;
}

.thinking-indicator {
  display: flex;
  gap: 5px;
  padding: 10px 14px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8b5cf6;
  animation: bounce 1.4s ease-in-out infinite;
}
.dot:nth-child(2) { animation-delay: 0.16s; }
.dot:nth-child(3) { animation-delay: 0.32s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-8px); opacity: 1; }
}

.message-fade-enter-active { transition: all 0.3s ease-out; }
.message-fade-enter-from { opacity: 0; transform: translateY(10px); }

.quick-replies {
  display: flex;
  gap: 6px;
  padding: 8px 16px 0;
  flex-wrap: wrap;
}

.quick-reply-btn {
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.25);
  background: transparent;
  color: #a78bfa;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-reply-btn:hover { background: rgba(139, 92, 246, 0.15); border-color: rgba(139, 92, 246, 0.4); }

.input-area { border-top: 1px solid rgba(255, 255, 255, 0.06); padding: 12px 16px; }
.chat-input-area { border-top: 1px solid rgba(255, 255, 255, 0.06); padding: 12px 16px; }

.input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-row input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
}
.input-row input:focus { border-color: rgba(139, 92, 246, 0.5); background: rgba(139, 92, 246, 0.05); }
.input-row input::placeholder { color: rgba(255, 255, 255, 0.25); }
.input-row input:disabled { opacity: 0.5; }

.input-row button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.input-row button svg { width: 18px; height: 18px; }
.input-row button:hover:not(:disabled) { transform: scale(1.08); }
.input-row button:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 400px) {
  .tutor-chat { width: calc(100vw - 40px); }
}
</style>
