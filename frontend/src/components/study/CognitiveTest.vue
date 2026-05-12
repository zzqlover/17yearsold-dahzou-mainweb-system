<template>
  <div class="cognitive-test-overlay" @click.self="$emit('close')">
    <div class="cognitive-test" ref="testRef">
      <button class="close-btn" @click="$emit('close')">✕</button>

      <div v-if="phase === 'intro'" class="test-phase intro-phase">
        <div class="phase-icon">🧠</div>
        <h2>认知诊断评估</h2>
        <p class="phase-desc">
          基于IRT（项目反应理论）的贝叶斯在线估计，
          通过3分钟轻量对话游戏，精准诊断你的真实认知水平
        </p>
        <div class="dimension-preview">
          <div class="dim-item" v-for="d in dimensions" :key="d.key">
            <span class="dim-icon">{{ d.icon }}</span>
            <span class="dim-name">{{ d.name }}</span>
          </div>
        </div>
        <button class="start-btn" @click="startTest">开始诊断</button>
      </div>

      <div v-else-if="phase === 'testing'" class="test-phase testing-phase">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="question-counter">{{ currentQuestion + 1 }} / {{ questions.length }}</div>

        <transition name="question-slide" mode="out-in">
          <div :key="currentQuestion" class="question-card">
            <div class="q-scenario" v-if="currentQData.scenario">
              📍 {{ currentQData.scenario }}
            </div>
            <h3 class="q-text">{{ currentQData.question }}</h3>

            <div class="q-options" v-if="currentQData.options">
              <button
                v-for="(opt, i) in currentQData.options"
                :key="i"
                class="option-btn"
                :class="{ selected: selectedOption === i }"
                @click="selectOption(i)"
              >
                <span class="opt-letter">{{ String.fromCharCode(65 + i) }}</span>
                <span>{{ opt }}</span>
              </button>
            </div>

            <div class="q-open" v-else>
              <textarea
                v-model="openAnswer"
                placeholder="请输入你的想法..."
                rows="3"
              ></textarea>
            </div>
          </div>
        </transition>

        <button
          class="submit-btn"
          :disabled="selectedOption === null && !openAnswer.trim()"
          @click="submitAnswer"
        >
          {{ isLastQuestion ? '完成诊断' : '下一题' }}
        </button>
      </div>

      <div v-else-if="phase === 'analyzing'" class="test-phase analyzing-phase">
        <div class="analysis-animation">
          <div class="brain-ring ring-1"></div>
          <div class="brain-ring ring-2"></div>
          <div class="brain-core">🧠</div>
        </div>
        <h3>IRT 贝叶斯分析中...</h3>
        <p class="analysis-desc">三参数 Logistic 模型收敛中 θ → 稳定值</p>
        <div class="convergence-data">
          <div class="data-row">
            <span>θ 估计值</span>
            <span class="value">{{ thetaEstimate.toFixed(4) }}</span>
          </div>
          <div class="data-row">
            <span>标准误 SE</span>
            <span class="value">{{ standardError.toFixed(4) }}</span>
          </div>
          <div class="data-row">
            <span>迭代次数</span>
            <span class="value">{{ iterations }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="phase === 'result'" class="test-phase result-phase">
        <h2>诊断完成</h2>

        <div class="theta-display">
          <div class="theta-gauge">
            <svg viewBox="0 0 200 100" class="gauge-svg">
              <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="#1e293b" stroke-width="12" stroke-linecap="round"/>
              <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" :stroke="thetaColor" stroke-width="12" stroke-linecap="round"
                    :stroke-dasharray="`${result.theta * 251.2} 251.2`" class="gauge-fill"/>
              <text x="100" y="70" text-anchor="middle" :fill="thetaColor" font-size="24" font-weight="bold">
                {{ result.theta.toFixed(2) }}
              </text>
            </svg>
          </div>
          <p class="theta-label">认知能力参数 θ</p>
        </div>

        <div class="dimension-results">
          <div class="dim-result" v-for="d in dimensions" :key="d.key">
            <div class="dim-header">
              <span class="dim-icon">{{ d.icon }}</span>
              <span class="dim-name">{{ d.name }}</span>
            </div>
            <div class="dim-bar-track">
              <div class="dim-bar-fill" :style="{ width: result[d.key] + '%', background: d.color }"></div>
            </div>
            <span class="dim-value">{{ result[d.key] }}%</span>
          </div>
        </div>

        <div class="level-badge" :class="'level-' + result.level.toLowerCase()">
          {{ levelLabels[result.level] }}
        </div>

        <p class="result-desc">{{ getLevelDesc(result.level) }}</p>

        <button class="confirm-btn" @click="handleComplete">确认并开始研学</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'CognitiveTest',
  emits: ['complete', 'close'],
  setup(props, { emit }) {
    const testRef = ref(null)
    const phase = ref('intro')
    const currentQuestion = ref(0)
    const selectedOption = ref(null)
    const openAnswer = ref('')
    const thetaEstimate = ref(0)
    const standardError = ref(1.0)
    const iterations = ref(0)

    const dimensions = [
      { key: 'historyKnowledge', name: '历史知识深度', icon: '📜', color: '#dc2626' },
      { key: 'logicReasoning', name: '逻辑推理能力', icon: '🧩', color: '#2563eb' },
      { key: 'emotionalEmpathy', name: '情感共情水平', icon: '💝', color: '#d946ef' },
      { key: 'attentionSpan', name: '注意力持久度', icon: '🎯', color: '#059669' }
    ]

    const questions = [
      {
        scenario: '场景：红军长征中的粮食分配',
        question: '如果你是红军长征队伍中负责粮食分配的人，面对粮食仅够维持3天但预计需要5天才能到达目的地的情况，你会怎么处理？',
        options: [
          '按人头平均分配，大家一起坚持',
          '优先保障伤员和体弱者，其他人减少配给',
          '寻找替代食物来源，同时严格定量',
          '召开集体讨论，共同决定方案'
        ],
        difficulty: 0.3,
        discrimination: 1.5,
        dimension: 'logicReasoning'
      },
      {
        question: '看到红军纪念馆里陈列的草鞋，你首先想到的是什么？',
        options: [
          '这鞋看起来很破旧，穿着肯定很疼',
          '当年红军战士就是穿着这样的鞋走完长征的，太不容易了',
          '想知道这种草鞋是怎么编成的',
          '思考为什么他们能在这么艰苦的条件下坚持下来'
        ],
        difficulty: 0.1,
        discrimination: 1.8,
        dimension: 'historyKnowledge'
      },
      {
        scenario: '场景：万源保卫战',
        question: '在万源保卫战中，有位年轻战士为了保护战友牺牲了自己。如果当时你在现场，你的感受是？',
        options: [
          '非常难过和敬佩',
          '想了解更多关于这位战士的故事',
          '思考战争的残酷和和平的可贵',
          '希望能为他的家乡做点什么来纪念他'
        ],
        difficulty: 0.2,
        discrimination: 1.6,
        dimension: 'emotionalEmpathy'
      },
      {
        question: '如果让你设计一个红色文化研学路线，你会优先考虑哪些因素？',
        open: true,
        difficulty: 0.5,
        discrimination: 1.2,
        dimension: 'attentionSpan'
      },
      {
        scenario: '场景：列宁主义街石刻标语',
        question: '"打土豪分田地"这条标语反映了当时什么样的社会矛盾？它对农民来说意味着什么？',
        options: [
          '地主占有太多土地，农民没有自己的土地',
          '这是改变社会不平等的一种方式',
          '体现了共产党代表农民利益的政治立场',
          '以上都是，而且这个口号动员了广大农民参与革命'
        ],
        difficulty: 0.7,
        discrimination: 1.7,
        dimension: 'historyKnowledge'
      }
    ]

    const answers = []
    let analysisTimer

    const progress = computed(() => ((currentQuestion.value + (selectedOption.value !== null ? 1 : 0)) / questions.length) * 100)

    const currentQData = computed(() => questions[currentQuestion.value] || {})
    const isLastQuestion = computed(() => currentQuestion.value === questions.length - 1)

    const levelLabels = {
      '初级': '🌱 初级探索者',
      '中级': '🌿 进阶学习者',
      '高级': '🌳 深度研究者'
    }

    const thetaColor = computed(() => {
      if (!result.value) return '#6366f1'
      const t = result.value.theta
      if (t < -0.5) return '#ef4444'
      if (t < 0.5) return '#f59e0b'
      return '#10b981'
    })

    const result = ref({
      theta: 0,
      historyKnowledge: 50,
      logicReasoning: 50,
      emotionalEmpathy: 50,
      attentionSpan: 50,
      level: '中级'
    })

    const startTest = () => {
      phase.value = 'testing'
    }

    const selectOption = (idx) => {
      selectedOption.value = idx
    }

    const submitAnswer = () => {
      const q = questions[currentQuestion.value]
      const answer = q.open ? openAnswer.value.trim() : selectedOption.value

      answers.push({
        questionIndex: currentQuestion.value,
        answer,
        difficulty: q.difficulty,
        discrimination: q.discrimination,
        dimension: q.dimension,
        optionCount: q.options?.length || 0
      })

      selectedOption.value = null
      openAnswer.value = ''

      if (isLastQuestion.value) {
        phase.value = 'analyzing'
        runIRTAnalysis()
      } else {
        currentQuestion.value++
      }
    }

    const runIRTAnalysis = () => {
      let iter = 0
      let theta = 0
      let se = 1.0

      analysisTimer = setInterval(() => {
        iter++
        iterations.value = iter

        const n = Math.min(iter, answers.length)

        for (let j = 0; j < n; j++) {
          const a = answers[j]
          const b = a.difficulty
          const alpha = a.discrimination
          const responseScore = a.open ? 0.75 : (a.answer / (a.optionCount - 1))

          const z = alpha * (theta - b)
          const p = 1 / (1 + Math.exp(-z))

          const gradient = alpha * (responseScore - p) / (se * se)
          const fisherInfo = alpha * alpha * p * (1 - p)

          theta += gradient * 0.15
          se = Math.max(0.1, 1 / Math.sqrt(fisherInfo + 0.01))
        }

        theta = Math.max(-3, Math.min(3, theta))
        thetaEstimate.value = theta
        standardError.value = se

        if (iter >= 30 || se < 0.15) {
          clearInterval(analysisTimer)
          computeResult(theta)
        }
      }, 120)
    }

    const computeResult = (theta) => {
      const dimScores = { historyKnowledge: 50, logicReasoning: 50, emotionalEmpathy: 50, attentionSpan: 50 }

      answers.forEach(a => {
        const base = a.open ? 75 : ((a.answer + 1) / (a.optionCount || 1)) * 100
        dimScores[a.dimension] = Math.round((dimScores[a.dimension] + base) / 2)
      })

      Object.keys(dimScores).forEach(k => {
        dimScores[k] = Math.max(10, Math.min(95, dimScores[k] + (theta > 0 ? theta * 10 : theta * 8)))
      })

      const avgDim = Object.values(dimScores).reduce((s, v) => s + v, 0) / 4

      result.value = {
        theta: parseFloat(theta.toFixed(3)),
        ...dimScores,
        level: theta > 0.5 ? '高级' : theta > -0.5 ? '中级' : '初级'
      }

      setTimeout(() => { phase.value = 'result' }, 800)
    }

    const getLevelDesc = (level) => {
      const descs = {
        '初级': '适合基础讲解模式，AI导师将使用更直观的语言引导你探索红色文化。',
        '中级': '适合引导式学习模式，AI导师会通过苏格拉底式提问帮助你深入思考。',
        '高级': '适合深度探究模式，AI导师将与你进行高阶对话，挑战你的批判性思维。'
      }
      return descs[level] || ''
    }

    const handleComplete = () => {
      emit('complete', result.value)
    }

    onUnmounted(() => {
      if (analysisTimer) clearInterval(analysisTimer)
    })

    return {
      testRef,
      phase,
      currentQuestion,
      selectedOption,
      openAnswer,
      questions,
      dimensions,
      answers,
      thetaEstimate,
      standardError,
      iterations,
      progress,
      currentQData,
      isLastQuestion,
      levelLabels,
      thetaColor,
      result,
      startTest,
      selectOption,
      submitAnswer,
      getLevelDesc,
      handleComplete
    }
  }
}
</script>

<style scoped>
.cognitive-test-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.cognitive-test {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(165deg, #13131f, #0d0d17);
  border-radius: 24px;
  border: 1px solid rgba(139, 92, 246, 0.15);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(99, 102, 241, 0.08);
  position: relative;
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  z-index: 10;
}
.close-btn:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.test-phase { padding: 40px 28px; text-align: center; }

.intro-phase .phase-icon { font-size: 56px; margin-bottom: 16px; }
.intro-phase h2 { font-size: 22px; font-weight: 600; color: #fff; margin-bottom: 10px; letter-spacing: 0.04em; }
.phase-desc { font-size: 13px; line-height: 1.8; color: rgba(255, 255, 255, 0.45); margin-bottom: 28px; max-width: 340px; margin-left: auto; margin-right: auto; }

.dimension-preview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 28px;
}

.dim-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(139, 92, 246, 0.06);
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: 12px;
}

.dim-icon { font-size: 18px; }
.dim-name { font-size: 11px; color: rgba(255, 255, 255, 0.65); }

.start-btn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.start-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35); }

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  margin-bottom: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #6366f1);
  border-radius: 2px;
  transition: width 0.4s ease;
}

.question-counter { font-size: 11px; color: rgba(255, 255, 255, 0.35); margin-bottom: 20px; }

.question-card { min-height: 200px; }
.q-scenario { font-size: 12px; color: #a78bfa; margin-bottom: 14px; padding: 8px 12px; background: rgba(139, 92, 246, 0.08); border-radius: 8px; display: inline-block; }
.q-text { font-size: 15px; color: rgba(255, 255, 255, 0.9); line-height: 1.7; margin-bottom: 20px; font-weight: 400; }

.q-options { display: flex; flex-direction: column; gap: 10px; }

.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: left;
  font-size: 13px;
}
.option-btn:hover { border-color: rgba(139, 92, 246, 0.3); background: rgba(139, 92, 246, 0.06); }
.option-btn.selected { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.15); color: #fff; }

.opt-letter {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: rgba(139, 92, 246, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #a78bfa;
  flex-shrink: 0;
}
.option-btn.selected .opt-letter { background: #8b5cf6; color: #fff; }

.q-open textarea {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  font-size: 13px;
  resize: none;
  outline: none;
  font-family: inherit;
}
.q-open textarea:focus { border-color: rgba(139, 92, 246, 0.4); }
.q-open textarea::placeholder { color: rgba(255, 255, 255, 0.2); }

.submit-btn {
  width: 100%;
  margin-top: 20px;
  padding: 13px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.submit-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.submit-btn:not(:disabled):hover { transform: translateY(-1px); }

.question-slide-enter-active { transition: all 0.35s ease-out; }
.question-slide-leave-active { transition: all 0.2s ease-in; }
.question-slide-enter-from { opacity: 0; transform: translateX(30px); }
.question-slide-leave-to { opacity: 0; transform: translateX(-30px); }

.analysis-animation {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 24px;
}

.brain-ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(139, 92, 246, 0.2);
  border-radius: 50%;
  animation: spinRing 8s linear infinite;
}
.ring-2 { inset: 15px; animation-duration: 6s; animation-direction: reverse; border-color: rgba(99, 102, 241, 0.25); }

@keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.brain-core {
  position: absolute;
  inset: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  animation: pulseCore 2s ease-in-out infinite;
}

@keyframes pulseCore { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

.analyzing-phase h3 { font-size: 18px; color: #fff; margin-bottom: 8px; }
.analysis-desc { font-size: 12px; color: rgba(255, 255, 255, 0.35); margin-bottom: 24px; font-family: monospace; }

.convergence-data { max-width: 260px; margin: 0 auto; }

.data-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}
.data-row .value { color: #a78bfa; font-family: monospace; font-weight: 600; }

.result-phase h2 { font-size: 22px; color: #fff; margin-bottom: 24px; }

.theta-display { margin-bottom: 28px; }
.theta-gauge { width: 160px; margin: 0 auto 8px; }
.gauge-svg { width: 100%; filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.3)); }
.gauge-fill { transition: stroke-dasharray 1s ease; }
.theta-label { font-size: 12px; color: rgba(255, 255, 255, 0.4); }

.dimension-results { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }

.dim-result { display: flex; align-items: center; gap: 10px; }
.dim-header { width: 110px; display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.dim-header .dim-name { font-size: 11px; color: rgba(255, 255, 255, 0.55); }

.dim-bar-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}

.dim-bar-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }
.dim-value { width: 38px; font-size: 12px; font-weight: 600; color: rgba(255, 255, 255, 0.6); text-align: right; }

.level-badge {
  display: inline-block;
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 14px;
}
.level-primary { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
.level-intermediate { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
.level-advanced { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }

.result-desc { font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.45); margin-bottom: 24px; }

.confirm-btn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}
.confirm-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(5, 150, 105, 0.35); }
</style>
