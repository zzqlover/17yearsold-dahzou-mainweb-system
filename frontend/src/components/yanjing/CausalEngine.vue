<template>
  <div class="causal-engine-panel">
    <div class="panel-header">
      <span class="panel-title">因果推断式叙事引擎</span>
      <span class="engine-status" :class="{ active: isEngineActive }">
        {{ isEngineActive ? '推理中' : '待机' }}
      </span>
    </div>

    <div class="current-scenario">
      <div class="scenario-label">当前场景</div>
      <div class="scenario-content">
        <div class="scenario-location">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>{{ activeScenario.location }}</span>
        </div>
        <p class="scenario-fact">{{ activeScenario.historicalFact }}</p>
      </div>
    </div>

    <div class="counterfactual-section">
      <div class="section-header">
        <span class="section-title">历史反事实推理</span>
        <button class="regenerate-btn" @click="regenerateQuestion">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
        </button>
      </div>

      <div class="counterfactual-question">
        <div class="question-icon">?</div>
        <p>{{ activeScenario.counterfactualQuestion }}</p>
      </div>
    </div>

    <div class="alternative-branches">
      <div class="branches-label">平行历史分支</div>
      <div class="branches-container">
        <div
          v-for="branch in activeScenario.alternativeBranches"
          :key="branch.id"
          class="branch-card"
          :class="{ selected: selectedBranch?.id === branch.id, debating: debatingBranch?.id === branch.id }"
          @click="selectBranch(branch)"
        >
          <div class="branch-header">
            <span class="branch-condition">{{ branch.condition }}</span>
            <span class="branch-probability">{{ (branch.probabilityEstimate * 100).toFixed(0) }}%</span>
          </div>
          <div class="branch-chain">
            <div
              v-for="(step, idx) in branch.consequenceChain.slice(0, 3)"
              :key="idx"
              class="chain-step"
            >
              {{ step }}
            </div>
          </div>
          <div class="branch-ai-argument" v-if="branch.showArgument">
            <div class="argument-label">AI观点</div>
            <p>{{ branch.aiArgument }}</p>
          </div>
          <button
            class="debate-btn"
            v-if="selectedBranch?.id === branch.id && !debatingBranch"
            @click.stop="startDebate(branch)"
          >
            与AI辩论
          </button>
        </div>
      </div>
    </div>

    <div class="debate-arena" v-if="debatingBranch">
      <div class="arena-header">
        <span>辩论进行中</span>
        <span class="debate-topic">{{ debatingBranch.condition }}</span>
      </div>

      <div class="debate-messages">
        <div
          v-for="(msg, idx) in debateMessages"
          :key="idx"
          class="debate-message"
          :class="msg.type"
        >
          <div class="msg-avatar" :class="msg.type">
            {{ msg.type === 'ai' ? 'AI' : '你' }}
          </div>
          <div class="msg-content">
            <p>{{ msg.text }}</p>
            <span class="msg-time">{{ msg.time }}</span>
          </div>
        </div>
      </div>

      <div class="debate-input">
        <input
          v-model="debateInput"
          type="text"
          placeholder="输入你的观点..."
          @keyup.enter="sendDebateMessage"
        />
        <button class="send-btn" @click="sendDebateMessage" :disabled="!debateInput.trim()">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="world-innovation-badge">
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
      </svg>
      <span>全球研学首创 · 不是推荐内容，而是制造认知冲突</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

interface HistoryBranch {
  id: string
  condition: string
  consequenceChain: string[]
  probabilityEstimate: number
  aiArgument: string
  showArgument?: boolean
}

interface CausalScenario {
  id: string
  location: string
  historicalFact: string
  counterfactualQuestion: string
  alternativeBranches: HistoryBranch[]
}

interface DebateMessage {
  type: 'ai' | 'user'
  text: string
  time: string
}

const isEngineActive = ref(false)
const selectedBranch = ref<HistoryBranch | null>(null)
const debatingBranch = ref<HistoryBranch | null>(null)
const debateInput = ref('')
const debateMessages = ref<DebateMessage[]>([])

const scenarios: CausalScenario[] = [
  {
    id: 'scenario-1',
    location: '列宁街苏维埃旧址',
    historicalFact: '1933年，红四方面军在此建立川东苏维埃政权，保留了大量革命标语。',
    counterfactualQuestion: '如果1934年国民党军队提前攻占列宁街，捣毁了所有革命标语，万源保卫战的部署会怎样改变？',
    alternativeBranches: [
      {
        id: 'branch-1a',
        condition: '如果标语被毁',
        consequenceChain: [
          '当地群众失去精神寄托',
          '红军士气受挫',
          '情报传递效率下降30%',
          '敌军进攻更加肆无忌惮'
        ],
        probabilityEstimate: 0.75,
        aiArgument: '标语不仅仅是文字，更是群众与红军之间的精神纽带。一旦失去，短期内军心涣散，但从军事角度看，红军可能被迫采取更灵活的游击战术。'
      },
      {
        id: 'branch-1b',
        condition: '如果苏维埃政府转移',
        consequenceChain: [
          '群众基础得以保留',
          '秘密情报网继续运作',
          '红军能够长期坚持',
          '最终实现战略包围'
        ],
        probabilityEstimate: 0.25,
        aiArgument: '历史告诉我们，分散的群众基础比集中的政权更能抵御打击。苏维埃政府的秘密转移，可能是万源保卫战最终获胜的关键因素之一。'
      }
    ]
  },
  {
    id: 'scenario-2',
    location: '凤凰山战斗遗址',
    historicalFact: '1934年6月，红军战士在凤凰山构筑工事，以少胜多，成功阻击敌军进攻。',
    counterfactualQuestion: '如果红军没有在凤凰山设立防线，而是主动撤退到巴山大峡谷，万源保卫战的结果会怎样？',
    alternativeBranches: [
      {
        id: 'branch-2a',
        condition: '如果主动撤退',
        consequenceChain: [
          '保存有生力量',
          '但失去战略要地',
          '敌军长驱直入',
          '整个川东陷入敌手'
        ],
        probabilityEstimate: 0.85,
        aiArgument: '凤凰山虽然地势险要，但如果死守不放，很可能全军覆没。红军选择在此狙击，实际上是用局部牺牲换取全局胜利的明智决策。'
      },
      {
        id: 'branch-2b',
        condition: '如果增援及时到达',
        consequenceChain: [
          '形成前后夹击',
          '敌军陷入包围',
          '可能提前结束战斗',
          '但也会暴露红军主力'
        ],
        probabilityEstimate: 0.15,
        aiArgument: '历史上没有如果。增援的时机和规模都是极其不确定的因素，这种赌博式的胜利并不稳定。红军当时的决策是在信息不完全下的最优选择。'
      }
    ]
  },
  {
    id: 'scenario-3',
    location: '红军纪念馆',
    historicalFact: '万源保卫战是红军历史上最大规模的阵地防御战之一，历时两个多月，歼敌万余人。',
    counterfactualQuestion: '如果万源保卫战失败，红四方面军被迫西撤，中国革命的历史进程会怎样改变？',
    alternativeBranches: [
      {
        id: 'branch-3a',
        condition: '如果战役失败',
        consequenceChain: [
          '川陕根据地丧失',
          '红军被迫北上',
          '可能与红一方面军提前会师',
          '但失去重要的战略后方'
        ],
        probabilityEstimate: 0.60,
        aiArgument: '历史是无数偶然事件的叠加。万源保卫战的胜利，不仅保卫了根据地，更为后续的长征提供了宝贵的战斗经验和大批优秀指战员。'
      },
      {
        id: 'branch-3b',
        condition: '如果采用不同战术',
        consequenceChain: [
          '集中兵力突击',
          '可能打乱敌军部署',
          '但也容易陷入包围',
          '损失可能更加惨重'
        ],
        probabilityEstimate: 0.40,
        aiArgument: '战争的艺术在于因地制宜。红军当时的阵地防御战术，是在敌强我弱情况下的最优解。任何激进的战术改变，都可能带来不可预测的后果。'
      }
    ]
  }
]

const activeScenario = ref<CausalScenario>(scenarios[0])

function regenerateQuestion() {
  const currentIdx = scenarios.findIndex(s => s.id === activeScenario.value.id)
  const nextIdx = (currentIdx + 1) % scenarios.length
  activeScenario.value = scenarios[nextIdx]
  selectedBranch.value = null
  debatingBranch.value = null
  debateMessages.value = []
}

function selectBranch(branch: HistoryBranch) {
  if (debatingBranch.value) return

  if (selectedBranch.value?.id === branch.id) {
    branch.showArgument = !branch.showArgument
  } else {
    selectedBranch.value = branch
    branch.showArgument = true
  }
}

function startDebate(branch: HistoryBranch) {
  debatingBranch.value = branch
  debateMessages.value = [
    {
      type: 'ai',
      text: branch.aiArgument,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
  ]
}

function sendDebateMessage() {
  if (!debateInput.value.trim() || !debatingBranch.value) return

  debateMessages.value.push({
    type: 'user',
    text: debateInput.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  })

  const userText = debateInput.value
  debateInput.value = ''

  setTimeout(() => {
    const responses = [
      '这是一个很有见地的观点。从历史唯物主义的角度看，你的分析有其合理性，但可能忽略了当时的具体历史条件。',
      '你的观点很有意思。如果从军事地理学的角度分析，情况可能会更加复杂。你能进一步阐述你的理由吗？',
      '我理解你的担忧。历史上确实存在很多不确定因素。但正是这些抉择，体现了革命先辈的智慧和勇气。',
      '这个角度很独特。如果我们深入研究当时的政治经济背景，会发现事情远比表面上复杂得多。'
    ]
    debateMessages.value.push({
      type: 'ai',
      text: responses[Math.floor(Math.random() * responses.length)],
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    })
  }, 1500)
}

onMounted(() => {
  isEngineActive.value = true
})
</script>

<style scoped>
.causal-engine-panel {
  background: rgba(10, 10, 15, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(241, 245, 249, 0.9);
  letter-spacing: 0.05em;
}

.engine-status {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(148, 163, 184, 0.6);
}

.engine-status.active {
  background: rgba(192, 132, 252, 0.15);
  color: rgba(192, 132, 252, 0.9);
  animation: enginePulse 2s ease-in-out infinite;
}

@keyframes enginePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.current-scenario {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.scenario-label {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.4);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.scenario-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.scenario-location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(201, 165, 90, 0.9);
}

.scenario-fact {
  font-size: 13px;
  color: rgba(203, 213, 225, 0.7);
  line-height: 1.6;
}

.counterfactual-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.7);
}

.regenerate-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  color: rgba(148, 163, 184, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.regenerate-btn:hover {
  background: rgba(192, 132, 252, 0.1);
  border-color: rgba(192, 132, 252, 0.2);
  color: rgba(192, 132, 252, 0.8);
}

.regenerate-btn svg {
  width: 14px;
  height: 14px;
}

.counterfactual-question {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: rgba(192, 132, 252, 0.05);
  border: 1px solid rgba(192, 132, 252, 0.1);
  border-radius: 8px;
}

.question-icon {
  width: 28px;
  height: 28px;
  background: rgba(192, 132, 252, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: rgba(192, 132, 252, 0.9);
  flex-shrink: 0;
}

.counterfactual-question p {
  font-size: 13px;
  color: rgba(203, 213, 225, 0.85);
  line-height: 1.6;
  font-style: italic;
}

.alternative-branches {
  margin-bottom: 16px;
}

.branches-label {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.4);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.branches-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.branch-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.branch-card:hover {
  border-color: rgba(192, 132, 252, 0.2);
}

.branch-card.selected {
  border-color: rgba(192, 132, 252, 0.3);
  background: rgba(192, 132, 252, 0.03);
}

.branch-card.debating {
  border-color: rgba(201, 165, 90, 0.3);
  background: rgba(201, 165, 90, 0.05);
}

.branch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.branch-condition {
  font-size: 13px;
  font-weight: 600;
  color: rgba(241, 245, 249, 0.9);
}

.branch-probability {
  font-size: 12px;
  font-weight: 600;
  color: rgba(192, 132, 252, 0.8);
}

.branch-chain {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chain-step {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.6);
  padding-left: 12px;
  position: relative;
}

.chain-step::before {
  content: '→';
  position: absolute;
  left: 0;
  color: rgba(192, 132, 252, 0.4);
}

.branch-ai-argument {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.argument-label {
  font-size: 9px;
  color: rgba(192, 132, 252, 0.6);
  margin-bottom: 6px;
  text-transform: uppercase;
}

.branch-ai-argument p {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.7);
  line-height: 1.5;
  font-style: italic;
}

.debate-btn {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  background: rgba(201, 165, 90, 0.1);
  border: 1px solid rgba(201, 165, 90, 0.2);
  border-radius: 6px;
  color: rgba(201, 165, 90, 0.9);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.debate-btn:hover {
  background: rgba(201, 165, 90, 0.15);
  border-color: rgba(201, 165, 90, 0.3);
}

.debate-arena {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.arena-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.arena-header span:first-child {
  font-size: 11px;
  color: rgba(201, 165, 90, 0.7);
}

.debate-topic {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.5);
}

.debate-messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 12px;
}

.debate-message {
  display: flex;
  gap: 10px;
}

.msg-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.msg-avatar.ai {
  background: rgba(192, 132, 252, 0.2);
  color: rgba(192, 132, 252, 0.9);
}

.msg-avatar.user {
  background: rgba(201, 165, 90, 0.2);
  color: rgba(201, 165, 90, 0.9);
}

.msg-content {
  flex: 1;
}

.msg-content p {
  font-size: 12px;
  color: rgba(203, 213, 225, 0.8);
  line-height: 1.5;
}

.msg-time {
  font-size: 9px;
  color: rgba(148, 163, 184, 0.4);
}

.debate-input {
  display: flex;
  gap: 8px;
}

.debate-input input {
  flex: 1;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  color: rgba(241, 245, 249, 0.9);
  font-size: 12px;
}

.debate-input input:focus {
  outline: none;
  border-color: rgba(201, 165, 90, 0.3);
}

.debate-input input::placeholder {
  color: rgba(148, 163, 184, 0.4);
}

.send-btn {
  width: 40px;
  height: 40px;
  background: rgba(201, 165, 90, 0.1);
  border: 1px solid rgba(201, 165, 90, 0.2);
  border-radius: 6px;
  color: rgba(201, 165, 90, 0.9);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  background: rgba(201, 165, 90, 0.15);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-btn svg {
  width: 16px;
  height: 16px;
}

.world-innovation-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(192, 132, 252, 0.05);
  border: 1px solid rgba(192, 132, 252, 0.1);
  border-radius: 6px;
  font-size: 10px;
  color: rgba(192, 132, 252, 0.6);
}

.world-innovation-badge svg {
  color: rgba(192, 132, 252, 0.8);
}
</style>
