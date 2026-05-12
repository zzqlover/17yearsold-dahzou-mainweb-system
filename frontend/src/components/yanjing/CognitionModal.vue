<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="() => {}">
      <div class="modal-card">
        <div class="progress-dots">
          <div v-for="i in 5" :key="i" :class="['dot', { active: i <= step, current: i === step }]">
            <span v-if="i < 5">{{ i }}</span>
            <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
        </div>

        <h2 class="modal-title">认知诊断测评</h2>

        <div v-if="step <= 4" class="question-section">
          <div class="question-card">
            <div class="q-num">第 {{ step }} / 4 题</div>
            <p class="q-text">{{ questions[step - 1].text }}</p>
            <p class="q-hint">{{ questions[step - 1].hint }}</p>
          </div>

          <textarea v-model="answers[step - 1]" class="answer-input" :placeholder="questions[step - 1].placeholder" rows="4"></textarea>

          <button class="submit-btn" :disabled="!answers[step - 1]?.trim() || loading" @click="handleSubmit">
            <span v-if="loading" class="spinner"></span>
            <span v-else>{{ step === 4 ? '完成测评' : '提交回答' }}</span>
          </button>
        </div>

        <div v-else class="result-section">
          <h3 class="result-title">诊断完成</h3>
          <canvas ref="canvas" width="240" height="240" class="radar-chart"></canvas>
          <div class="score-grid">
            <div class="score-item"><span>历史</span><strong>{{ Math.round(store.cognition.history * 100) }}</strong></div>
            <div class="score-item"><span>逻辑</span><strong>{{ Math.round(store.cognition.logic * 100) }}</strong></div>
            <div class="score-item"><span>共情</span><strong>{{ Math.round(store.cognition.empathy * 100) }}</strong></div>
            <div class="score-item"><span>注意</span><strong>{{ Math.round(store.cognition.attention * 100) }}</strong></div>
          </div>
          <div class="level-badge">{{ store.cognition.level }}</div>
          <button class="start-btn" @click="handleStart">开启专属研学</button>
        </div>

        <p class="modal-hint">测评将帮助AI导师为你定制专属学习路径</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useYanJingStore, type CognitionScore } from '../../stores/yanjing'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const store = useYanJingStore()
const step = ref(1)
const loading = ref(false)
const answers = ref(['', '', '', ''])
const scores = ref<CognitionScore[]>([])
const canvas = ref<HTMLCanvasElement | null>(null)

const questions = [
  { text: '如果你在1935年负责为红军筹备粮食，你会怎么做？', hint: '思考历史背景、后勤保障', placeholder: '请描述你的思考过程...' },
  { text: '看到战友受伤却缺药，你内心感受如何？你会采取什么行动？', hint: '考察情感理解和问题解决', placeholder: '请描述你的感受和行动...' },
  { text: '请快速说出三个能代表达州的颜色，并解释原因。', hint: '考察知识储备和联想能力', placeholder: '例如：红色 - 革命老区' },
  { text: '假如导航出错导致你们迷路了，你会怎么安抚同伴并找路？', hint: '考察应变能力、情绪管理', placeholder: '请描述你的应对策略...' }
]

async function handleSubmit() {
  if (!answers.value[step.value - 1]?.trim()) return
  loading.value = true

  const result = await store.submitCognitiveAnswer(step.value, answers.value[step.value - 1])
  if (result) scores.value.push(result)

  loading.value = false

  if (step.value < 4) {
    step.value++
  } else {
    store.completeCognition(scores.value)
    step.value = 5
    await nextTick()
    drawRadar()
  }
}

function drawRadar() {
  const c = canvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return

  const cx = 120, cy = 120, r = 90
  const labels = ['历史', '逻辑', '共情', '注意']
  const vals = [store.cognition.history, store.cognition.logic, store.cognition.empathy, store.cognition.attention]

  ctx.clearRect(0, 0, 240, 240)

  // 网格
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath()
    for (let j = 0; j <= 4; j++) {
      const angle = Math.PI * 2 * j / 4 - Math.PI / 2
      const x = cx + (r / 4) * i * Math.cos(angle)
      const y = cy + (r / 4) * i * Math.sin(angle)
      j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }

  // 数据
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  grad.addColorStop(0, 'rgba(59,130,246,0.8)')
  grad.addColorStop(1, 'rgba(99,102,241,0.4)')
  ctx.fillStyle = grad
  ctx.beginPath()
  for (let i = 0; i <= 4; i++) {
    const angle = Math.PI * 2 * i / 4 - Math.PI / 2
    const x = cx + r * vals[i % 4] * Math.cos(angle)
    const y = cy + r * vals[i % 4] * Math.sin(angle)
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()

  // 点
  ctx.fillStyle = '#60a5fa'
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI * 2 * i / 4 - Math.PI / 2
    ctx.beginPath()
    ctx.arc(cx + r * vals[i] * Math.cos(angle), cy + r * vals[i] * Math.sin(angle), 5, 0, Math.PI * 2)
    ctx.fill()
  }

  // 标签
  ctx.fillStyle = '#f1f5f9'
  ctx.font = '12px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI * 2 * i / 4 - Math.PI / 2
    ctx.fillText(labels[i], cx + (r + 20) * Math.cos(angle), cy + (r + 20) * Math.sin(angle))
  }
}

function handleStart() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(8px);
}

.modal-card {
  width: 90%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98));
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 28px;
  text-align: center;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #64748b;
  transition: all 0.3s ease;
}

.dot.active { background: rgba(59,130,246,0.2); border-color: #3b82f6; color: #3b82f6; }
.dot.current { background: #3b82f6; border-color: #3b82f6; color: #fff; transform: scale(1.15); }
.dot svg { width: 16px; height: 16px; }

.modal-title { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0 0 20px; }

.question-card {
  background: rgba(59,130,246,0.1);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 16px;
  text-align: left;
}

.q-num { font-size: 11px; color: #3b82f6; font-weight: 600; margin-bottom: 10px; }
.q-text { font-size: 15px; line-height: 1.6; color: #f1f5f9; margin: 0 0 8px; }
.q-hint { font-size: 12px; color: #94a3b8; margin: 0; font-style: italic; }

.answer-input {
  width: 100%;
  padding: 14px;
  background: rgba(15,23,42,0.8);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  color: #f1f5f9;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 14px;
}

.answer-input:focus { outline: none; border-color: #3b82f6; }
.answer-input::placeholder { color: #64748b; }

.submit-btn, .start-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled), .start-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59,130,246,0.4); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.result-section { text-align: center; }
.result-title { font-size: 18px; font-weight: 600; color: #22c55e; margin: 0 0 16px; }
.radar-chart { max-width: 100%; }

.score-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 16px 0;
}

.score-item {
  background: rgba(59,130,246,0.1);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.score-item span { font-size: 12px; color: #94a3b8; }
.score-item strong { font-size: 22px; font-weight: 700; color: #3b82f6; }

.level-badge {
  display: inline-block;
  padding: 8px 24px;
  background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.2));
  border: 1px solid rgba(34,197,94,0.3);
  border-radius: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #22c55e;
  margin-bottom: 16px;
}

.start-btn { background: linear-gradient(135deg, #22c55e, #16a34a); }
.start-btn:hover { box-shadow: 0 8px 25px rgba(34,197,94,0.4); }

.modal-hint { font-size: 11px; color: #64748b; margin: 16px 0 0; }

.modal-enter-active { animation: fadeIn 0.3s ease; }
.modal-leave-active { animation: fadeOut 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
</style>
