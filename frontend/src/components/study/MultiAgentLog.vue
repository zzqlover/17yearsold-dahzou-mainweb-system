<template>
  <div class="agent-log-overlay" @click.self="$emit('close')">
    <div class="agent-log-panel">
      <div class="log-header">
        <h3>🤖 多智能体协作日志</h3>
        <span class="log-subtitle">MAC-Narrative Agent Collaboration</span>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="log-filters">
        <button
          v-for="f in filters"
          :key="f.key"
          class="filter-btn"
          :class="{ active: activeFilter === f.key }"
          @click="activeFilter = f.key"
        >
          {{ f.label }}
        </button>
      </div>

      <div class="log-stream" ref="streamRef">
        <transition-group name="log-entry" tag="div">
          <div
            v-for="(log, i) in filteredLogs"
            :key="i"
            class="log-entry"
            :class="'type-' + log.type"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-avatar">{{ log.avatar }}</span>
            <div class="log-body">
              <span class="log-agent">{{ log.agent }}</span>
              <p class="log-content">{{ log.content }}</p>
            </div>
          </div>
        </transition-group>

        <div v-if="filteredLogs.length === 0" class="empty-logs">
          暂无日志记录
        </div>
      </div>

      <div class="log-footer">
        <span class="log-count">共 {{ logs.length }} 条协作记录</span>
        <div class="live-indicator">
          <span class="live-dot"></span>
          实时流
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'

export default {
  name: 'MultiAgentLog',
  props: {
    logs: { type: Array, default: () => [] }
  },
  emits: ['close'],
  setup(props) {
    const streamRef = ref(null)
    const activeFilter = ref('all')

    const filters = [
      { key: 'all', label: '全部' },
      { key: 'system', label: '系统' },
      { key: 'ai', label: 'AI' },
      { key: 'student', label: '学生' },
      { key: 'discovery', label: '发现' },
      { key: 'warning', label: '警告' }
    ]

    const filteredLogs = computed(() => {
      if (activeFilter.value === 'all') return props.logs
      return props.logs.filter(l => l.type === activeFilter.value)
    })

    watch(() => props.logs.length, () => {
      nextTick(() => {
        if (streamRef.value) {
          streamRef.value.scrollTop = streamRef.value.scrollHeight
        }
      })
    })

    return {
      streamRef,
      activeFilter,
      filters,
      filteredLogs
    }
  }
}
</script>

<style scoped>
.agent-log-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 6000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.agent-log-panel {
  width: 100%;
  max-width: 560px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(165deg, #111118, #0a0a10);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.5);
}

.log-header {
  padding: 20px 24px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.log-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 4px;
}

.log-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 0.12em;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  font-size: 13px;
}
.close-btn:hover { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

.log-filters {
  display: flex;
  gap: 6px;
  padding: 12px 24px;
  overflow-x: auto;
}

.filter-btn {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.filter-btn.active { background: rgba(139, 92, 246, 0.15); border-color: rgba(139, 92, 246, 0.4); color: #a78bfa; }
.filter-btn:hover:not(.active) { border-color: rgba(255, 255, 255, 0.15); color: rgba(255, 255, 255, 0.6); }

.log-stream {
  flex: 1;
  overflow-y: auto;
  padding: 8px 24px 16px;
  min-height: 200px;
  max-height: 400px;
}

.log-entry {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.log-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.2);
  font-family: monospace;
  width: 52px;
  flex-shrink: 0;
  padding-top: 2px;
}

.log-avatar {
  font-size: 18px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  flex-shrink: 0;
}

.log-body { flex: 1; min-width: 0; }
.log-agent {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 3px;
}

.type-system .log-agent { color: rgba(148, 163, 184, 0.7); }
.type-ai .log-agent { color: #a78bfa; }
.type-student .log-agent { color: #34d399; }
.type-discovery .log-agent { color: #fbbf24; }
.type-warning .log-agent { color: #f87171; }
.type-diagnosis .log-agent { color: #22d3ee; }
.type-success .log-agent { color: #4ade80; }
.type-replan .log-agent { color: #fb923c; }
.type-info .log-agent { color: #60a5fa; }

.log-content {
  font-size: 12px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
  word-break: break-word;
}

.type-warning .log-content { color: rgba(248, 113, 113, 0.7); }
.type-discovery .log-content { color: rgba(251, 191, 36, 0.75); }
.type-success .log-content { color: rgba(74, 222, 128, 0.7); }

.empty-logs {
  text-align: center;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.15);
  font-size: 13px;
}

.log-entry-enter-active { transition: all 0.35s ease-out; }
.log-entry-enter-from { opacity: 0; transform: translateX(-16px); }

.log-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.log-count { font-size: 11px; color: rgba(255, 255, 255, 0.25); }

.live-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: rgba(52, 211, 153, 0.6);
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
  animation: livePulse 1.5s infinite;
}

@keyframes livePulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); }
  50% { opacity: 0.6; box-shadow: 0 0 0 4px rgba(52, 211, 153, 0); }
}
</style>
