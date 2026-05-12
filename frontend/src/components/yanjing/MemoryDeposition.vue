<template>
  <div class="memory-deposition-panel">
    <div class="panel-header">
      <span class="panel-title">记忆沉积系统</span>
      <span class="network-status">
        <span class="status-dot"></span>
        城市文化神经网络
      </span>
    </div>

    <div class="dna-visualization">
      <div class="dna-label">个人记忆DNA生成</div>
      <div class="dna-strand">
        <div
          v-for="(gene, idx) in currentDNA.vector"
          :key="idx"
          class="dna-gene"
          :style="{
            background: getGeneColor(gene),
            height: 4 + Math.abs(gene) * 12 + 'px'
          }"
        ></div>
      </div>
      <div class="dna-metadata">
        <div class="meta-item">
          <span class="meta-label">空间权重</span>
          <span class="meta-value">{{ (currentDNA.vector[0] * 100).toFixed(1) }}%</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">情感强度</span>
          <span class="meta-value">{{ (currentDNA.emotionFeature.emotionIntensity * 100).toFixed(1) }}%</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">认知变化</span>
          <span class="meta-value">{{ (currentDNA.cognitionDelta.historyChange * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <div class="memory-insight-input">
      <textarea
        v-model="insightText"
        class="insight-textarea"
        placeholder="写下你的研学感悟..."
        rows="3"
      ></textarea>
      <button class="generate-btn" @click="generateDNA" :disabled="!insightText.trim()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        生成记忆DNA
      </button>
    </div>

    <div class="network-stats">
      <div class="stat-card">
        <span class="stat-value">{{ networkStats.totalMemories }}</span>
        <span class="stat-label">记忆节点</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ networkStats.activeNodes }}</span>
        <span class="stat-label">活跃节点</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ networkStats.crossTemporalEchoes }}</span>
        <span class="stat-label">跨时空回响</span>
      </div>
    </div>

    <div class="memory-nodes-list">
      <div class="list-header">
        <span>历史记忆节点</span>
        <span class="node-count">{{ memoryNodes.length }} 个</span>
      </div>
      <div class="nodes-container">
        <div
          v-for="node in memoryNodes"
          :key="node.id"
          class="memory-node-card"
          :class="{ awakened: node.awakenedCount > 0 }"
          @click="awakenNode(node)"
        >
          <div class="node-header">
            <div class="node-location">
              <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>{{ node.locationName }}</span>
            </div>
            <span class="node-emotion" :class="node.emotionType">
              {{ getEmotionLabel(node.emotionType) }}
            </span>
          </div>
          <div class="node-content">
            <p class="node-text-shadow">{{ node.textShadow }}</p>
          </div>
          <div class="node-footer">
            <span class="node-author">{{ node.visitorName }}</span>
            <span class="node-time">{{ formatTime(node.timestamp) }}</span>
            <span class="node-awaken-count" v-if="node.awakenedCount > 0">
              {{ node.awakenedCount }}次唤醒
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="awakening-modal" v-if="activeMemory">
      <div class="modal-backdrop" @click="closeAwakening"></div>
      <div class="modal-content">
        <button class="modal-close" @click="closeAwakening">&times;</button>
        <div class="memory-ripple">
          <div class="ripple-ring"></div>
          <div class="ripple-ring" style="animation-delay: 0.5s"></div>
          <div class="ripple-ring" style="animation-delay: 1s"></div>
        </div>
        <h3 class="awakening-title">{{ activeMemory.locationName }}</h3>
        <p class="awakening-text">{{ activeMemory.textShadow }}</p>
        <div class="awakening-audio" v-if="activeMemory.audioFragment">
          <button class="audio-play-btn" @click="playAudio(activeMemory)">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <div class="audio-wave">
            <span v-for="i in 12" :key="i" class="wave-bar"></span>
          </div>
          <span class="audio-duration">{{ audioDuration }}"</span>
        </div>
        <div class="awakening-meta">
          <span>{{ activeMemory.visitorName }}</span>
          <span>{{ formatDate(activeMemory.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { MemoryDNA, MemoryNode } from '../../utils/narrativeParticle'

const insightText = ref('')
const audioDuration = ref(0)
const isPlaying = ref(false)

const currentDNA = reactive<MemoryDNA>({
  id: '',
  visitorId: '',
  visitorName: '',
  timestamp: Date.now(),
  vector: [0, 0, 0, 0, 0, 0, 0, 0],
  spatialFeature: [107.5035, 31.2159],
  emotionFeature: {
    peakEmotion: 'empathy',
    emotionIntensity: 0,
    empathyLevel: 0
  },
  cognitionDelta: {
    historyChange: 0,
    logicChange: 0,
    empathyChange: 0,
    attentionChange: 0
  },
  canBeAwakened: false,
  awakenedCount: 0
})

const networkStats = reactive({
  totalMemories: 0,
  activeNodes: 0,
  crossTemporalEchoes: 0
})

const memoryNodes = ref<Array<MemoryNode & { locationName: string; awakenedCount: number }>>([
  {
    id: 'mem-1',
    visitorId: 'visitor-001',
    visitorName: '李明',
    timestamp: Date.now() - 86400000 * 3,
    emotionType: 'enlightenment',
    memoryDNA: '',
    textShadow: '站在列宁街上，我仿佛看到了1933年的那个清晨，红军战士们在这里写下了第一张革命标语...',
    locationName: '列宁街苏维埃旧址',
    awakenedCount: 5,
    cognitiveInsight: '历史的重量，责任的传承'
  },
  {
    id: 'mem-2',
    visitorId: 'visitor-002',
    visitorName: '王小红',
    timestamp: Date.now() - 86400000 * 7,
    emotionType: 'empathy',
    memoryDNA: '',
    textShadow: '在张爱萍将军的故居前，我久久不能平静。一个19岁的少年，是怀着怎样的心情走上革命道路的...',
    locationName: '张爱萍故居',
    awakenedCount: 12,
    cognitiveInsight: '青春与信仰的力量'
  },
  {
    id: 'mem-3',
    visitorId: 'visitor-003',
    visitorName: '张强',
    timestamp: Date.now() - 86400000 * 14,
    emotionType: 'reflection',
    memoryDNA: '',
    textShadow: '万源保卫战不仅是军事上的胜利，更是精神上的洗礼。红军战士们的勇气，让我重新思考什么是真正的坚强...',
    locationName: '红军纪念馆',
    awakenedCount: 8,
    cognitiveInsight: '困难面前的选择'
  }
])

const activeMemory = ref<typeof memoryNodes.value[0] | null>(null)

function generateDNA() {
  if (!insightText.value.trim()) return

  const textLength = insightText.value.length
  const words = insightText.value.split(/\s+/).length

  currentDNA.vector = [
    Math.sin(textLength * 0.1) * 0.5 + 0.5,
    Math.cos(words * 0.2) * 0.5 + 0.5,
    Math.random() * 0.3 + 0.4,
    Math.sin(Date.now() * 0.001) * 0.3 + 0.5,
    Math.random() * 0.4 + 0.3,
    Math.cos(textLength * 0.05) * 0.4 + 0.4,
    Math.random() * 0.2 + 0.5,
    Math.sin(words * 0.15) * 0.4 + 0.4
  ]

  currentDNA.emotionFeature = {
    peakEmotion: textLength > 100 ? 'empathy' : 'reflection',
    emotionIntensity: Math.min(1, textLength / 200),
    empathyLevel: Math.random() * 0.3 + 0.5
  }

  currentDNA.cognitionDelta = {
    historyChange: Math.random() * 0.2 + 0.1,
    logicChange: Math.random() * 0.15 + 0.05,
    empathyChange: Math.random() * 0.25 + 0.1,
    attentionChange: Math.random() * 0.1 + 0.05
  }

  currentDNA.timestamp = Date.now()
  currentDNA.canBeAwakened = true

  networkStats.totalMemories++
  networkStats.activeNodes = Math.min(networkStats.totalMemories, Math.floor(Math.random() * 5) + 3)
  networkStats.crossTemporalEchoes = Math.floor(networkStats.totalMemories * 0.7)
}

function getGeneColor(value: number): string {
  if (value > 0.7) return 'rgba(201, 165, 90, 0.9)'
  if (value > 0.4) return 'rgba(96, 165, 250, 0.7)'
  return 'rgba(148, 163, 184, 0.5)'
}

function getEmotionLabel(type: string): string {
  const labels: Record<string, string> = {
    'enlightenment': '顿悟',
    'confusion': '困惑',
    'empathy': '共情',
    'reflection': '反思'
  }
  return labels[type] || type
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return `${Math.floor(days / 7)}周前`
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function awakenNode(node: typeof memoryNodes.value[0]) {
  activeMemory.value = node
  node.awakenedCount++
  networkStats.crossTemporalEchoes++
  audioDuration.value = Math.floor(Math.random() * 20) + 10
}

function closeAwakening() {
  activeMemory.value = null
  isPlaying.value = false
}

function playAudio(node: typeof memoryNodes.value[0]) {
  isPlaying.value.value = !isPlaying.value.value
}

onMounted(() => {
  networkStats.totalMemories = memoryNodes.value.length + Math.floor(Math.random() * 10)
  networkStats.activeNodes = Math.floor(networkStats.totalMemories * 0.4)
  networkStats.crossTemporalEchoes = Math.floor(networkStats.totalMemories * 0.6)
})
</script>

<style scoped>
.memory-deposition-panel {
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

.network-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.6);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(74, 222, 128, 0.8);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.dna-visualization {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.dna-label {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.4);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.dna-strand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 20px;
  margin-bottom: 12px;
}

.dna-gene {
  width: 8px;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.dna-metadata {
  display: flex;
  justify-content: space-around;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.meta-label {
  font-size: 9px;
  color: rgba(148, 163, 184, 0.4);
}

.meta-value {
  font-size: 12px;
  font-weight: 600;
  color: rgba(201, 165, 90, 0.9);
}

.memory-insight-input {
  margin-bottom: 16px;
}

.insight-textarea {
  width: 100%;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  color: rgba(241, 245, 249, 0.9);
  font-size: 13px;
  resize: none;
  margin-bottom: 10px;
}

.insight-textarea:focus {
  outline: none;
  border-color: rgba(201, 165, 90, 0.3);
}

.insight-textarea::placeholder {
  color: rgba(148, 163, 184, 0.4);
}

.generate-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: rgba(201, 165, 90, 0.1);
  border: 1px solid rgba(201, 165, 90, 0.2);
  border-radius: 6px;
  color: rgba(201, 165, 90, 0.9);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.generate-btn:hover:not(:disabled) {
  background: rgba(201, 165, 90, 0.15);
  border-color: rgba(201, 165, 90, 0.3);
}

.generate-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.generate-btn svg {
  width: 14px;
  height: 14px;
}

.network-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: rgba(201, 165, 90, 0.9);
}

.stat-label {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.5);
}

.memory-nodes-list {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 12px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.6);
}

.node-count {
  color: rgba(201, 165, 90, 0.6);
}

.nodes-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.memory-node-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.memory-node-card:hover {
  border-color: rgba(201, 165, 90, 0.2);
  background: rgba(201, 165, 90, 0.03);
}

.memory-node-card.awakened {
  border-color: rgba(74, 222, 128, 0.2);
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.node-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(201, 165, 90, 0.8);
}

.node-emotion {
  font-size: 9px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(148, 163, 184, 0.6);
}

.node-emotion.enlightenment {
  background: rgba(74, 222, 128, 0.15);
  color: rgba(74, 222, 128, 0.9);
}

.node-emotion.empathy {
  background: rgba(96, 165, 250, 0.15);
  color: rgba(96, 165, 250, 0.9);
}

.node-emotion.reflection {
  background: rgba(192, 132, 252, 0.15);
  color: rgba(192, 132, 252, 0.9);
}

.node-content {
  margin-bottom: 8px;
}

.node-text-shadow {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.6);
  line-height: 1.5;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.node-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  color: rgba(148, 163, 184, 0.4);
}

.node-author {
  color: rgba(148, 163, 184, 0.6);
}

.node-awaken-count {
  color: rgba(74, 222, 128, 0.6);
}

.awakening-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 400px;
  background: rgba(15, 15, 20, 0.98);
  border: 1px solid rgba(201, 165, 90, 0.2);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 50%;
  color: rgba(148, 163, 184, 0.6);
  font-size: 18px;
  cursor: pointer;
}

.memory-ripple {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
}

.ripple-ring {
  width: 60px;
  height: 60px;
  border: 2px solid rgba(201, 165, 90, 0.3);
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  animation: rippleExpand 2s ease-out infinite;
}

@keyframes rippleExpand {
  0% {
    transform: translateX(-50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) scale(2);
    opacity: 0;
  }
}

.awakening-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(201, 165, 90, 0.9);
  margin-bottom: 16px;
}

.awakening-text {
  font-size: 14px;
  color: rgba(203, 213, 225, 0.8);
  line-height: 1.7;
  font-style: italic;
  margin-bottom: 20px;
}

.awakening-audio {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 16px;
}

.audio-play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(201, 165, 90, 0.2);
  border: 1px solid rgba(201, 165, 90, 0.3);
  color: rgba(201, 165, 90, 0.9);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-play-btn svg {
  width: 18px;
  height: 18px;
}

.audio-wave {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 24px;
}

.wave-bar {
  width: 3px;
  height: 8px;
  background: rgba(201, 165, 90, 0.5);
  border-radius: 2px;
  animation: wave 0.5s ease-in-out infinite alternate;
}

.wave-bar:nth-child(2) { animation-delay: 0.1s; }
.wave-bar:nth-child(3) { animation-delay: 0.2s; }
.wave-bar:nth-child(4) { animation-delay: 0.3s; }
.wave-bar:nth-child(5) { animation-delay: 0.4s; }

@keyframes wave {
  from { height: 8px; }
  to { height: 20px; }
}

.audio-duration {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.6);
}

.awakening-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.4);
}
</style>
