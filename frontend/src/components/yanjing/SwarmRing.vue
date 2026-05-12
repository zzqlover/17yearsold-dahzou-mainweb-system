<template>
  <div class="swarm-ring-panel">
    <div class="panel-header">
      <span class="panel-title">群体智能共振环</span>
      <div class="connection-status" :class="{ connected: isConnected }">
        <span class="status-indicator"></span>
        {{ isConnected ? 'P2P已连接' : '等待连接' }}
      </div>
    </div>

    <div class="swarm-members">
      <div
        v-for="member in swarmMembers"
        :key="member.id"
        class="member-card"
        :class="{ online: member.isOnline, enlightenment: member.emotionState === 'enlightenment', confusion: member.emotionState === 'confusion' }"
      >
        <div class="member-avatar" :style="{ background: member.avatarColor }">
          {{ member.name.charAt(0) }}
        </div>
        <div class="member-info">
          <span class="member-name">{{ member.name }}</span>
          <span class="member-emotion">{{ getEmotionLabel(member.emotionState) }}</span>
        </div>
        <div class="member-location">
          <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>{{ getDistanceText(member.location) }}</span>
        </div>
        <div class="member-cognition">
          <div class="cog-bar">
            <div class="cog-fill" :style="{ width: (member.cognitionProfile.history * 100) + '%', background: 'rgba(201, 165, 90, 0.6)' }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="resonance-monitor">
      <div class="monitor-header">
        <span class="monitor-title">认知失调指数</span>
        <span class="misalignment-value" :class="getMisalignmentClass()">
          {{ misalignmentIndex.toFixed(2) }}
        </span>
      </div>
      <div class="misalignment-bar">
        <div class="bar-track">
          <div
            class="bar-fill"
            :style="{ width: (misalignmentIndex * 100) + '%', background: getMisalignmentColor() }"
          ></div>
          <div class="threshold-line" style="left: 60%"></div>
          <div class="threshold-line danger" style="left: 80%"></div>
        </div>
        <div class="bar-labels">
          <span>和谐</span>
          <span>失调</span>
          <span>冲突</span>
        </div>
      </div>
    </div>

    <div class="resonance-events" v-if="resonanceEvents.length > 0">
      <div class="events-header">
        <span>共振事件</span>
        <span class="event-count">{{ resonanceEvents.length }}</span>
      </div>
      <div class="events-list">
        <div
          v-for="event in resonanceEvents.slice(-3)"
          :key="event.id"
          class="event-item"
          :class="event.type"
        >
          <div class="event-icon">
            <svg v-if="event.type === 'peer_teaching'" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
            <svg v-else-if="event.type === 'group_discussion'" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
            </svg>
          </div>
          <div class="event-content">
            <span class="event-action">{{ getEventLabel(event.type) }}</span>
            <span class="event-detail">{{ event.trigger.fromName }} → {{ event.trigger.toName }}</span>
          </div>
          <span class="event-time">{{ formatEventTime(event.timestamp) }}</span>
        </div>
      </div>
    </div>

    <div class="peer-teaching-demo">
      <button class="demo-btn" @click="simulateResonance">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        模拟群体共振
      </button>
    </div>

    <div class="decentralized-badge">
      <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
      <span>去中心化架构 · 无服务器依赖 · WebRTC直连</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

interface SwarmMember {
  id: string
  name: string
  avatarColor: string
  cognitionProfile: {
    history: number
    logic: number
    empathy: number
    attention: number
  }
  location: [number, number]
  heartRate?: number
  emotionState: 'enlightenment' | 'confusion' | 'neutral'
  isOnline: boolean
}

interface ResonanceEvent {
  id: string
  type: 'peer_teaching' | 'group_discussion' | 'conflict_arousal'
  trigger: {
    from: string
    fromName: string
    to: string
    toName: string
    topic: string
  }
  timestamp: number
  resolved: boolean
}

const isConnected = ref(false)
const misalignmentIndex = ref(0.3)

const swarmMembers = reactive<SwarmMember[]>([
  {
    id: 'member-1',
    name: '李明',
    avatarColor: 'rgba(201, 165, 90, 0.8)',
    cognitionProfile: { history: 0.8, logic: 0.6, empathy: 0.7, attention: 0.5 },
    location: [107.5055, 31.2229],
    heartRate: 72,
    emotionState: 'neutral',
    isOnline: true
  },
  {
    id: 'member-2',
    name: '王小红',
    avatarColor: 'rgba(96, 165, 250, 0.8)',
    cognitionProfile: { history: 0.5, logic: 0.8, empathy: 0.9, attention: 0.6 },
    location: [107.5085, 31.2129],
    heartRate: 68,
    emotionState: 'neutral',
    isOnline: true
  },
  {
    id: 'member-3',
    name: '张强',
    avatarColor: 'rgba(192, 132, 252, 0.8)',
    cognitionProfile: { history: 0.6, logic: 0.7, empathy: 0.5, attention: 0.8 },
    location: [107.5005, 31.2189],
    heartRate: 75,
    emotionState: 'neutral',
    isOnline: true
  },
  {
    id: 'member-4',
    name: '陈思',
    avatarColor: 'rgba(74, 222, 128, 0.8)',
    cognitionProfile: { history: 0.7, logic: 0.5, empathy: 0.8, attention: 0.7 },
    location: [107.4515, 31.2289],
    heartRate: 70,
    emotionState: 'neutral',
    isOnline: false
  }
])

const resonanceEvents = ref<ResonanceEvent[]>([])

let simulationInterval: number | null = null

function getEmotionLabel(state: string): string {
  const labels: Record<string, string> = {
    'enlightenment': '顿悟中',
    'confusion': '困惑中',
    'neutral': '学习中'
  }
  return labels[state] || state
}

function getDistanceText(location: [number, number]): string {
  const baseLocation: [number, number] = [107.5035, 31.2159]
  const dx = location[0] - baseLocation[0]
  const dy = location[1] - baseLocation[1]
  const distance = Math.sqrt(dx * dx + dy * dy) * 111000
  if (distance < 100) return '同位置'
  if (distance < 1000) return `${Math.round(distance)}m`
  return `${(distance / 1000).toFixed(1)}km`
}

function getMisalignmentClass(): string {
  if (misalignmentIndex.value < 0.4) return 'low'
  if (misalignmentIndex.value < 0.7) return 'medium'
  return 'high'
}

function getMisalignmentColor(): string {
  if (misalignmentIndex.value < 0.4) return 'rgba(74, 222, 128, 0.6)'
  if (misalignmentIndex.value < 0.7) return 'rgba(253, 230, 138, 0.6)'
  return 'rgba(252, 165, 165, 0.6)'
}

function getEventLabel(type: string): string {
  const labels: Record<string, string> = {
    'peer_teaching': '同伴互教触发',
    'group_discussion': '小组讨论',
    'conflict_arousal': '认知冲突'
  }
  return labels[type] || type
}

function formatEventTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  return `${Math.floor(diff / 3600000)}小时前`
}

function simulateResonance() {
  const onlineMembers = swarmMembers.filter(m => m.isOnline)

  const confusedIdx = Math.floor(Math.random() * onlineMembers.length)
  const enlightenedIdx = (confusedIdx + 1) % onlineMembers.length

  const confusedMember = onlineMembers[confusedIdx]
  const enlightenedMember = onlineMembers[enlightenedIdx]

  confusedMember.emotionState = 'confusion'
  enlightenedMember.emotionState = 'enlightenment'

  resonanceEvents.value.push({
    id: `event-${Date.now()}`,
    type: 'peer_teaching',
    trigger: {
      from: enlightenedMember.id,
      fromName: enlightenedMember.name,
      to: confusedMember.id,
      toName: confusedMember.name,
      topic: '万源保卫战的意义'
    },
    timestamp: Date.now(),
    resolved: false
  })

  misalignmentIndex.value = 0.6 + Math.random() * 0.3

  setTimeout(() => {
    confusedMember.emotionState = 'neutral'
    enlightenedMember.emotionState = 'neutral'
    misalignmentIndex.value = 0.2 + Math.random() * 0.2
    const event = resonanceEvents.value[resonanceEvents.value.length - 1]
    if (event) event.resolved = true
  }, 3000)
}

function simulateActivity() {
  isConnected.value = true

  swarmMembers.forEach(member => {
    if (member.isOnline && Math.random() > 0.7) {
      const emotionIdx = Math.random()
      if (emotionIdx > 0.8) {
        member.emotionState = 'enlightenment'
      } else if (emotionIdx > 0.6) {
        member.emotionState = 'confusion'
      } else {
        member.emotionState = 'neutral'
      }

      setTimeout(() => {
        member.emotionState = 'neutral'
      }, 1500)
    }

    member.heartRate = 65 + Math.floor(Math.random() * 15)
  })

  const onlineCount = swarmMembers.filter(m => m.isOnline).length
  if (onlineCount >= 2) {
    const confusionCount = swarmMembers.filter(m => m.emotionState === 'confusion').length
    const enlightenmentCount = swarmMembers.filter(m => m.emotionState === 'enlightenment').length

    if (confusionCount > 0 && enlightenmentCount > 0) {
      misalignmentIndex.value = 0.7 + Math.random() * 0.25
    } else if (confusionCount > 0 || enlightenmentCount > 0) {
      misalignmentIndex.value = 0.4 + Math.random() * 0.2
    } else {
      misalignmentIndex.value = 0.2 + Math.random() * 0.15
    }
  }
}

onMounted(() => {
  simulationInterval = window.setInterval(simulateActivity, 2000)
})

onUnmounted(() => {
  if (simulationInterval) clearInterval(simulationInterval)
})
</script>

<style scoped>
.swarm-ring-panel {
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

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.5);
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.3);
}

.connection-status.connected .status-indicator {
  background: rgba(74, 222, 128, 0.8);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.swarm-members {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.member-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  padding: 12px;
  transition: all 0.3s ease;
}

.member-card.online {
  border-color: rgba(74, 222, 128, 0.2);
}

.member-card.enlightenment {
  border-color: rgba(74, 222, 128, 0.4);
  background: rgba(74, 222, 128, 0.05);
}

.member-card.confusion {
  border-color: rgba(252, 165, 165, 0.4);
  background: rgba(252, 165, 165, 0.05);
}

.member-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
  margin-bottom: 8px;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 6px;
}

.member-name {
  font-size: 12px;
  font-weight: 600;
  color: rgba(241, 245, 249, 0.9);
}

.member-emotion {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.5);
}

.member-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  color: rgba(148, 163, 184, 0.4);
  margin-bottom: 6px;
}

.member-cognition {
  margin-top: 6px;
}

.cog-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.cog-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.resonance-monitor {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 14px;
  margin-bottom: 16px;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.monitor-title {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.6);
}

.misalignment-value {
  font-size: 18px;
  font-weight: 700;
}

.misalignment-value.low { color: rgba(74, 222, 128, 0.9); }
.misalignment-value.medium { color: rgba(253, 230, 138, 0.9); }
.misalignment-value.high { color: rgba(252, 165, 165, 0.9); }

.misalignment-bar {
  position: relative;
}

.bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: visible;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: all 0.5s ease;
}

.threshold-line {
  position: absolute;
  top: -4px;
  width: 1px;
  height: 14px;
  background: rgba(148, 163, 184, 0.3);
}

.threshold-line.danger {
  background: rgba(252, 165, 165, 0.5);
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 9px;
  color: rgba(148, 163, 184, 0.3);
}

.resonance-events {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.6);
}

.event-count {
  background: rgba(201, 165, 90, 0.15);
  color: rgba(201, 165, 90, 0.8);
  padding: 2px 8px;
  border-radius: 4px;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
}

.event-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(201, 165, 90, 0.1);
  border-radius: 4px;
  color: rgba(201, 165, 90, 0.8);
}

.event-icon svg {
  width: 14px;
  height: 14px;
}

.event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-action {
  font-size: 11px;
  color: rgba(241, 245, 249, 0.8);
}

.event-detail {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.5);
}

.event-time {
  font-size: 9px;
  color: rgba(148, 163, 184, 0.4);
}

.peer-teaching-demo {
  margin-bottom: 16px;
}

.demo-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(201, 165, 90, 0.1);
  border: 1px solid rgba(201, 165, 90, 0.2);
  border-radius: 6px;
  color: rgba(201, 165, 90, 0.9);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.demo-btn:hover {
  background: rgba(201, 165, 90, 0.15);
  border-color: rgba(201, 165, 90, 0.3);
}

.demo-btn svg {
  width: 14px;
  height: 14px;
}

.decentralized-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: rgba(74, 222, 128, 0.05);
  border: 1px solid rgba(74, 222, 128, 0.1);
  border-radius: 6px;
  font-size: 10px;
  color: rgba(74, 222, 128, 0.6);
}
</style>
