<template>
  <div class="multi-agent-panel">
    <div class="panel-header">
      <span class="panel-title">多智能体协作系统</span>
      <span class="system-status" :class="{ active: isSystemActive }">
        {{ isSystemActive ? '运行中' : '待机' }}
      </span>
    </div>

    <div class="agents-grid">
      <div
        v-for="agent in agents"
        :key="agent.id"
        class="agent-card"
        :class="[agent.status, { highlighted: agent.isProcessing }]"
      >
        <div class="agent-header">
          <div class="agent-icon" :style="{ background: agent.color }">
            <span class="agent-emoji">{{ agent.icon }}</span>
          </div>
          <div class="agent-info">
            <span class="agent-name">{{ agent.name }}</span>
            <span class="agent-status-text">{{ agent.statusText }}</span>
          </div>
        </div>

        <div class="agent-metrics">
          <div class="metric">
            <span class="metric-label">任务</span>
            <span class="metric-value">{{ agent.tasks }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">延迟</span>
            <span class="metric-value">{{ agent.latency }}ms</span>
          </div>
        </div>

        <div class="agent-log">
          <div
            v-for="(log, idx) in agent.recentLogs.slice(-3)"
            :key="idx"
            class="log-line"
          >
            {{ log }}
          </div>
        </div>

        <div class="agent-connection" v-if="agent.connectedTo.length > 0">
          <span class="connection-label">协作:</span>
          <span
            v-for="conn in agent.connectedTo"
            :key="conn"
            class="connection-tag"
            :class="getAgentById(conn)?.status"
          >
            {{ getAgentById(conn)?.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="collaboration-flow">
      <div class="flow-title">协作信息流</div>
      <div class="flow-container">
        <div
          v-for="(msg, idx) in collaborationMessages.slice(-8)"
          :key="idx"
          class="flow-message"
          :style="{ animationDelay: idx * 0.1 + 's' }"
        >
          <span class="flow-from">{{ msg.from }}</span>
          <span class="flow-arrow">→</span>
          <span class="flow-to">{{ msg.to }}</span>
          <span class="flow-content">{{ msg.content }}</span>
        </div>
      </div>
    </div>

    <div class="system-metrics">
      <div class="sys-metric">
        <span class="sys-label">系统吞吐</span>
        <span class="sys-value">{{ systemMetrics.throughput }} msg/s</span>
      </div>
      <div class="sys-metric">
        <span class="sys-label">活跃粒子</span>
        <span class="sys-value">{{ systemMetrics.activeParticles }}</span>
      </div>
      <div class="sys-metric">
        <span class="sys-label">群体规模</span>
        <span class="sys-value">{{ systemMetrics.swarmSize }}</span>
      </div>
      <div class="sys-metric">
        <span class="sys-label">记忆节点</span>
        <span class="sys-value">{{ systemMetrics.memoryNodes }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

interface Agent {
  id: string
  name: string
  icon: string
  color: string
  status: 'idle' | 'processing' | 'error'
  statusText: string
  tasks: number
  latency: number
  recentLogs: string[]
  connectedTo: string[]
  isProcessing: boolean
}

const isSystemActive = ref(true)

const agents = reactive<Agent[]>([
  {
    id: 'particle-scheduler',
    name: '粒子调度器',
    icon: '◉',
    color: 'rgba(201, 165, 90, 0.8)',
    status: 'idle',
    statusText: '监听空间信号',
    tasks: 0,
    latency: 0,
    recentLogs: [],
    connectedTo: ['resonance-monitor', 'causal-engine', 'memory-deposit'],
    isProcessing: false
  },
  {
    id: 'resonance-monitor',
    name: '共振监听',
    icon: '◎',
    color: 'rgba(96, 165, 250, 0.8)',
    status: 'idle',
    statusText: '监测群体认知',
    tasks: 0,
    latency: 0,
    recentLogs: [],
    connectedTo: ['causal-engine', 'memory-deposit'],
    isProcessing: false
  },
  {
    id: 'causal-engine',
    name: '因果引擎',
    icon: '⟐',
    color: 'rgba(192, 132, 252, 0.8)',
    status: 'idle',
    statusText: '反事实推理',
    tasks: 0,
    latency: 0,
    recentLogs: [],
    connectedTo: ['particle-scheduler', 'memory-deposit'],
    isProcessing: false
  },
  {
    id: 'memory-deposit',
    name: '记忆引擎',
    icon: '◈',
    color: 'rgba(74, 222, 128, 0.8)',
    status: 'idle',
    statusText: 'DNA存储',
    tasks: 0,
    latency: 0,
    recentLogs: [],
    connectedTo: ['particle-scheduler'],
    isProcessing: false
  }
])

interface FlowMessage {
  from: string
  to: string
  content: string
  timestamp: number
}

const collaborationMessages = ref<FlowMessage[]>([])

const systemMetrics = reactive({
  throughput: 0,
  activeParticles: 0,
  swarmSize: 0,
  memoryNodes: 0
})

let logInterval: number | null = null
let metricInterval: number | null = null
let throughputCounter = 0

function getAgentById(id: string): Agent | undefined {
  return agents.find(a => a.id === id)
}

function generateRandomLog(agent: Agent): string {
  const logs: Record<string, string[]> = {
    'particle-scheduler': [
      '检测到新粒子激活信号',
      '空间坐标匹配成功',
      '唤醒叙事碎片 #12',
      '情感权重更新完成',
      '发送至共振监听模块'
    ],
    'resonance-monitor': [
      '群体认知指数: 0.72',
      '检测到认知失调',
      '触发同伴互教机制',
      '同步Swarm成员状态',
      '共振事件已记录'
    ],
    'causal-engine': [
      '生成反事实分支',
      '因果图更新完成',
      '辩论话题: 万源保卫战',
      '推理深度: L3',
      '输出认知冲突信号'
    ],
    'memory-deposit': [
      'DNA向量生成完成',
      '记忆节点已种植',
      '唤醒历史回响',
      '跨时空传承触发',
      '节点激活计数+1'
    ]
  }
  const agentLogs = logs[agent.id] || ['处理中...']
  return agentLogs[Math.floor(Math.random() * agentLogs.length)]
}

function simulateAgentActivity() {
  throughputCounter++

  agents.forEach(agent => {
    if (Math.random() > 0.6) {
      agent.tasks++
      agent.latency = Math.floor(Math.random() * 50) + 10
      agent.status = 'processing'
      agent.isProcessing = true
      agent.recentLogs.push(generateRandomLog(agent))

      if (agent.recentLogs.length > 5) {
        agent.recentLogs.shift()
      }

      const targetConnections = agent.connectedTo
      if (targetConnections.length > 0 && Math.random() > 0.5) {
        const targetId = targetConnections[Math.floor(Math.random() * targetConnections.length)]
        const targetAgent = getAgentById(targetId)
        if (targetAgent) {
          collaborationMessages.value.push({
            from: agent.name,
            to: targetAgent.name,
            content: agent.id === 'particle-scheduler' ? '粒子激活' :
                    agent.id === 'resonance-monitor' ? '共振触发' :
                    agent.id === 'causal-engine' ? '推理完成' : '记忆同步',
            timestamp: Date.now()
          })
        }
      }

      setTimeout(() => {
        agent.status = 'idle'
        agent.statusText = getStatusText(agent.id)
        agent.isProcessing = false
      }, 500 + Math.random() * 1000)
    }
  })
}

function getStatusText(agentId: string): string {
  const statusTexts: Record<string, string> = {
    'particle-scheduler': '监听空间信号',
    'resonance-monitor': '监测群体认知',
    'causal-engine': '反事实推理',
    'memory-deposit': 'DNA存储'
  }
  return statusTexts[agentId] || '待机'
}

function updateSystemMetrics() {
  systemMetrics.throughput = throughputCounter
  throughputCounter = 0
  systemMetrics.activeParticles = Math.floor(Math.random() * 10) + 5
  systemMetrics.swarmSize = Math.floor(Math.random() * 3) + 1
  systemMetrics.memoryNodes = Math.floor(Math.random() * 20) + 10
}

onMounted(() => {
  logInterval = window.setInterval(simulateAgentActivity, 800)
  metricInterval = window.setInterval(updateSystemMetrics, 1000)
})

onUnmounted(() => {
  if (logInterval) clearInterval(logInterval)
  if (metricInterval) clearInterval(metricInterval)
})
</script>

<style scoped>
.multi-agent-panel {
  background: rgba(10, 10, 15, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 20px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
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

.system-status {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(148, 163, 184, 0.6);
}

.system-status.active {
  background: rgba(74, 222, 128, 0.15);
  color: rgba(74, 222, 128, 0.9);
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.agent-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  padding: 14px;
  transition: all 0.3s ease;
}

.agent-card.processing {
  border-color: rgba(201, 165, 90, 0.3);
  background: rgba(201, 165, 90, 0.05);
}

.agent-card.highlighted {
  box-shadow: 0 0 20px rgba(201, 165, 90, 0.1);
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.agent-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.8);
}

.agent-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.agent-name {
  font-size: 13px;
  font-weight: 600;
  color: rgba(241, 245, 249, 0.9);
}

.agent-status-text {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.5);
}

.agent-metrics {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-size: 9px;
  color: rgba(148, 163, 184, 0.4);
  text-transform: uppercase;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: rgba(201, 165, 90, 0.9);
}

.agent-log {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 10px;
  min-height: 54px;
}

.log-line {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.6);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-connection {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.connection-label {
  font-size: 9px;
  color: rgba(148, 163, 184, 0.4);
}

.connection-tag {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(148, 163, 184, 0.6);
}

.connection-tag.idle { background: rgba(148, 163, 184, 0.1); }
.connection-tag.processing { background: rgba(201, 165, 90, 0.15); color: rgba(201, 165, 90, 0.9); }

.collaboration-flow {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.flow-title {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.4);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.flow-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 100px;
  overflow-y: auto;
}

.flow-message {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.5);
  display: flex;
  align-items: center;
  gap: 6px;
  animation: fadeSlideIn 0.3s ease;
}

.flow-from {
  color: rgba(201, 165, 90, 0.8);
}

.flow-arrow {
  color: rgba(148, 163, 184, 0.3);
}

.flow-to {
  color: rgba(96, 165, 250, 0.8);
}

.flow-content {
  color: rgba(148, 163, 184, 0.4);
  margin-left: 6px;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.system-metrics {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.sys-metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sys-label {
  font-size: 9px;
  color: rgba(148, 163, 184, 0.4);
  text-transform: uppercase;
}

.sys-value {
  font-size: 13px;
  font-weight: 600;
  color: rgba(203, 213, 225, 0.8);
}
</style>
