<template>
  <div class="assistant-page">
    <div class="chat-container">
      <div class="chat-header">
        <div class="assistant-info">
          <div class="avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <div class="info">
            <h3>小莲</h3>
            <span class="status">在线</span>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div class="welcome-message">
          <div class="welcome-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <h2>您好，我是小莲</h2>
          <p>莲花湖景区的专属智能导游，很高兴为您服务！</p>
          <div class="quick-questions">
            <button @click="askQuestion('莲花湖开放时间是几点？')">🕐 开放时间</button>
            <button @click="askQuestion('停车场在哪里？')">🅿️ 停车场</button>
            <button @click="askQuestion('门票多少钱？')">🎫 门票价格</button>
            <button @click="askQuestion('有什么好吃的？')">🍜 美食推荐</button>
          </div>
        </div>

        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.role]"
        >
          <div class="message-avatar" v-if="msg.role === 'assistant'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(msg.content)"></div>
            <div class="message-time">{{ msg.time }}</div>
          </div>
        </div>

        <div v-if="isTyping" class="message assistant">
          <div class="message-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <input
          type="text"
          v-model="inputMessage"
          placeholder="输入您的问题..."
          @keyup.enter="sendMessage"
          :disabled="isTyping"
        />
        <button class="send-btn" @click="sendMessage" :disabled="isTyping || !inputMessage.trim()">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { checkDangerous, searchKnowledge, getUnknownReply } from '../utils/assistant.js'
import axios from 'axios'

defineEmits(['close'])

const messages = ref([])
const inputMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)
const apiBase = 'http://localhost:5000'
const backendData = ref({ spots: [], redCulture: [], foodCulture: [] })

const getCurrentTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatMessage = (text) => {
  return text.replace(/\n/g, '<br>')
}

const fetchBackendData = async () => {
  try {
    const [spotsRes, redRes, foodRes] = await Promise.all([
      axios.get(`${apiBase}/api/v1/spots`).catch(() => ({ data: [] })),
      axios.get(`${apiBase}/api/v1/culture/red`).catch(() => ({ data: [] })),
      axios.get(`${apiBase}/api/v1/culture/food`).catch(() => ({ data: [] }))
    ])
    backendData.value.spots = spotsRes.data || []
    backendData.value.redCulture = redRes.data || []
    backendData.value.foodCulture = foodRes.data || []
  } catch (error) {
    console.error('Failed to fetch backend data:', error)
  }
}

const searchBackendData = (query) => {
  const q = query.toLowerCase().trim()
  const allItems = [
    ...backendData.value.spots.map(item => ({ ...item, category: '景点' })),
    ...backendData.value.redCulture.map(item => ({ ...item, category: '红色文化' })),
    ...backendData.value.foodCulture.map(item => ({ ...item, category: '美食' }))
  ]

  for (const item of allItems) {
    const name = item.title || item.name || ''
    const desc = item.description || ''
    const location = item.location || ''

    if (name.toLowerCase().includes(q) || q.includes(name.toLowerCase())) {
      return {
        found: true,
        answer: `${name}位于${location}。${desc}`
      }
    }

    if (desc && desc.toLowerCase().includes(q)) {
      return {
        found: true,
        answer: `${name}：${desc}`
      }
    }
  }

  return { found: false }
}

fetchBackendData()

const askQuestion = (question) => {
  inputMessage.value = question
  sendMessage()
}

const sendMessage = async () => {
  const content = inputMessage.value.trim()
  if (!content || isTyping.value) return

  if (checkDangerous(content)) {
    messages.value.push({
      role: 'assistant',
      content: getUnknownReply(),
      time: getCurrentTime()
    })
    scrollToBottom()
    return
  }

  messages.value.push({
    role: 'user',
    content,
    time: getCurrentTime()
  })
  inputMessage.value = ''
  scrollToBottom()

  isTyping.value = true

  const result = searchBackendData(content)

  if (result.found) {
    setTimeout(() => {
      messages.value.push({
        role: 'assistant',
        content: result.answer,
        time: getCurrentTime()
      })
      isTyping.value = false
      scrollToBottom()
    }, 500)
  } else {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY

    if (!apiKey) {
      setTimeout(() => {
        messages.value.push({
          role: 'assistant',
          content: getUnknownReply(),
          time: getCurrentTime()
        })
        isTyping.value = false
        scrollToBottom()
      }, 500)
      return
    }

    const systemPrompt = `你是达州莲花湖景区的智能导游小莲。

【核心规则】
1. 只能基于以下知识库回答问题
2. 如果问题不在知识库中，直接回复："抱歉，我是莲花湖景区的智能导游小莲，只能回答与景区相关的问题哦。请问您想了解景区的景点、票价、开放时间或停车信息吗？"
3. 禁止编造答案，禁止说"关于这个问题"、"希望对你有帮助"等废话
4. 只回答景区相关问题

【知识库 - 只能基于这些数据回答】
景点信息：
${backendData.value.spots.map(s => `【景点】${s.title || s.name} - 位置：${s.location || '未知'}\n简介：${s.description || '暂无描述'}`).join('\n\n')}

红色文化：
${backendData.value.redCulture.map(r => `【红色文化】${r.title || r.name} - 位置：${r.location || '未知'}\n简介：${r.description || '暂无描述'}`).join('\n\n')}

美食文化：
${backendData.value.foodCulture.map(f => `【美食】${f.title || f.name}\n描述：${f.description || '暂无描述'}`).join('\n\n')}

【回答要求】
- 直接基于知识库回答，不要添加任何开场白
- 如果知识库没有，直接说不知道
- 保持简短，50字以内`

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: content }
          ],
          max_tokens: 200,
          temperature: 0.3
        })
      })

      const data = await response.json()

      if (data.choices && data.choices[0]) {
        let answer = data.choices[0].message.content.trim()

        const hasOpening = answer.includes('关于这个问题') ||
                         answer.includes('希望') ||
                         answer.includes('根据您的问题')

        if (hasOpening) {
          answer = getUnknownReply()
        }

        messages.value.push({
          role: 'assistant',
          content: answer,
          time: getCurrentTime()
        })
      } else {
        messages.value.push({
          role: 'assistant',
          content: getUnknownReply(),
          time: getCurrentTime()
        })
      }
    } catch (error) {
      console.error('AI response error:', error)
      messages.value.push({
        role: 'assistant',
        content: getUnknownReply(),
        time: getCurrentTime()
      })
    }

    isTyping.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.assistant-page {
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 1000;
  width: 380px;
  height: 550px;
  background: #1a1a2e;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(212, 175, 122, 0.1);
  border-bottom: 1px solid rgba(212, 175, 122, 0.1);
}

.assistant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #d4af7a, #c9a96a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar svg {
  width: 24px;
  height: 24px;
  color: #1a1a2e;
}

.info h3 {
  color: #fff;
  font-size: 16px;
  margin-bottom: 2px;
}

.status {
  color: #2ed573;
  font-size: 12px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.close-btn:hover {
  opacity: 1;
}

.close-btn svg {
  width: 20px;
  height: 20px;
  color: #fff;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 175, 122, 0.3) transparent;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 122, 0.3);
  border-radius: 3px;
}

.welcome-message {
  text-align: center;
  padding: 30px 20px;
  color: #fff;
}

.welcome-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(212, 175, 122, 0.2), rgba(212, 175, 122, 0.05));
  border: 1px solid rgba(212, 175, 122, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.welcome-icon svg {
  width: 32px;
  height: 32px;
  color: #d4af7a;
}

.welcome-message h2 {
  font-size: 18px;
  margin-bottom: 8px;
}

.welcome-message p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-bottom: 20px;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.quick-questions button {
  background: rgba(212, 175, 122, 0.1);
  border: 1px solid rgba(212, 175, 122, 0.2);
  color: rgba(255, 255, 255, 0.8);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-questions button:hover {
  background: rgba(212, 175, 122, 0.2);
  border-color: rgba(212, 175, 122, 0.4);
}

.message {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #d4af7a, #c9a96a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-avatar svg {
  width: 18px;
  height: 18px;
  color: #1a1a2e;
}

.message-content {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
}

.message.assistant .message-content {
  background: rgba(212, 175, 122, 0.1);
  border: 1px solid rgba(212, 175, 122, 0.15);
  color: #fff;
  border-top-left-radius: 4px;
}

.message.user .message-content {
  background: linear-gradient(135deg, #d4af7a, #c9a96a);
  color: #1a1a2e;
  border-top-right-radius: 4px;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message-time {
  font-size: 11px;
  margin-top: 6px;
  opacity: 0.6;
  text-align: right;
}

.message.assistant .message-time {
  color: rgba(255, 255, 255, 0.5);
}

.message.user .message-time {
  color: rgba(26, 26, 46, 0.6);
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #d4af7a;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.chat-input-area {
  display: flex;
  gap: 10px;
  padding: 16px;
  background: rgba(26, 26, 46, 0.8);
  border-top: 1px solid rgba(212, 175, 122, 0.1);
}

.chat-input-area input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(10, 10, 15, 0.6);
  border: 1px solid rgba(212, 175, 122, 0.2);
  border-radius: 24px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.chat-input-area input:focus {
  border-color: rgba(212, 175, 122, 0.5);
  box-shadow: 0 0 20px rgba(212, 175, 122, 0.1);
}

.chat-input-area input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.send-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #d4af7a, #c9a96a);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(212, 175, 122, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn svg {
  width: 20px;
  height: 20px;
  color: #1a1a2e;
}
</style>
