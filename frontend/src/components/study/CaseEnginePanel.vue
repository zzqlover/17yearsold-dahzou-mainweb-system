<template>
  <div class="case-panel-overlay" @click.self="$emit('close')">
    <div class="case-panel">
      <div class="panel-header">
        <div class="panel-title-row">
          <span class="panel-icon">⚙️</span>
          <h2>CASE 引擎面板</h2>
        </div>
        <p class="panel-subtitle">Cognitive Adaptive Scheduling Engine · 认知自适应研学调度引擎</p>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="panel-body">
        <div class="layer-section" v-for="(layer, i) in layers" :key="i" :class="'layer-' + (i + 1)">
          <div class="layer-header" @click="toggleLayer(i)">
            <div class="layer-badge">{{ String(i + 1).padStart(2, '0') }}</div>
            <h3>{{ layer.name }}</h3>
            <span class="layer-status" :class="{ active: layer.active }">
              {{ layer.active ? '● 运行中' : '○ 待激活' }}
            </span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>

          <transition name="layer-expand">
            <div v-show="expandedLayers.includes(i)" class="layer-content">
              <div class="layer-desc">{{ layer.desc }}</div>

              <div v-if="i === 0 && cognitiveProfile?.theta !== null" class="irt-output">
                <div class="irt-param">
                  <span>θ (能力参数)</span>
                  <strong>{{ cognitiveProfile.theta.toFixed(4) }}</strong>
                </div>
                <div class="irt-bar-container">
                  <div class="irt-bar-track">
                    <div
                      class="irt-bar-fill"
                      :style="{
                        left: ((cognitiveProfile.theta + 3) / 6 * 100) + '%',
                        background: layer.color
                      }"
                    ></div>
                    <div class="irt-marker" style="left: 50%">
                      <span>均值</span>
                    </div>
                  </div>
                </div>
                <div class="irt-dims">
                  <div v-for="dim in ['historyKnowledge', 'logicReasoning', 'emotionalEmpathy', 'attentionSpan']" :key="dim" class="irt-dim">
                    <span class="dim-label">{{ dimLabels[dim] }}</span>
                    <div class="dim-track"><div class="dim-fill" :style="{ width: cognitiveProfile[dim] + '%' }"></div></div>
                    <span>{{ cognitiveProfile[dim] }}%</span>
                  </div>
                </div>
              </div>

              <div v-if="i === 1 && routePlan" class="planning-output">
                <div class="plan-route">
                  <div v-for="(stop, j) in routePlan.route" :key="j" class="route-stop">
                    <div class="stop-dot" :style="{ background: layer.color }"></div>
                    <span>{{ stop }}</span>
                    <svg v-if="j < routePlan.route.length - 1" class="route-line" viewBox="0 0 20 40">
                      <line x1="10" y1="0" x2="10" y2="40" :stroke="layer.color" stroke-width="2" stroke-dasharray="4"/>
                    </svg>
                  </div>
                </div>

                <div class="plan-metrics">
                  <div class="metric-card" v-for="m in planMetrics" :key="m.key">
                    <span class="metric-value" :style="{ color: m.color }">{{ routePlan[m.key] || '--' }}</span>
                    <span class="metric-label">{{ m.label }}</span>
                  </div>
                </div>

                <div class="algorithm-info">
                  <code>A* + 帕累托前沿搜索 | D* Lite 实时重规划</code>
                </div>
              </div>

              <div v-if="i === 2" class="agents-grid">
                <div v-for="agent in agents" :key="agent.name" class="agent-card">
                  <div class="agent-avatar">{{ agent.icon }}</div>
                  <div class="agent-name">{{ agent.name }}</div>
                  <div class="agent-role">{{ agent.role }}</div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <div class="gain-function" v-if="cognitiveProfile?.theta !== null">
          <h4>📊 教育增益函数 G = f(认知匹配, 天气舒适度, 安全系数, 时间可行性)</h4>
          <div class="gain-bars">
            <div class="gain-item" v-for="g in gainFactors" :key="g.label">
              <span class="g-label">{{ g.label }}</span>
              <div class="g-track"><div class="g-fill" :style="{ width: g.value + '%', background: g.color }"></div></div>
              <span class="g-val">{{ g.value }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'CaseEnginePanel',
  props: {
    cognitiveProfile: { type: Object, default: () => ({}) },
    routePlan: { type: Object, default: null },
    agentLogs: { type: Array, default: () => [] }
  },
  emits: ['close'],
  setup() {
    const expandedLayers = ref([0])

    const dimLabels = {
      historyKnowledge: '历史知识',
      logicReasoning: '逻辑推理',
      emotionalEmpathy: '情感共情',
      attentionSpan: '注意力'
    }

    const layers = [
      {
        name: 'L1 学习者认知诊断模型（基于 IRT 的快速画像）',
        desc: '采用三参数 Logistic 模型进行贝叶斯在线估计，3分钟内从轻量对话中收敛出认知参数 θ。全球研学领域首次实现主动式认知诊断，无需学生自报年级。',
        color: '#8b5cf6',
        active: true
      },
      {
        name: 'L2 约束时空-天气-认知多目标动态规划',
        desc: '改进的 A* 算法融合帕累托前沿搜索。状态节点=(位置,时间,已学技能集)，转移代价=步行时间+天气衰减，启发式=剩余时间最大认知增益预估。D* Lite 实现 0.5 秒内重规划。',
        color: '#06b6d4',
        active: true
      },
      {
        name: 'L3 多智能体协作叙事生成（MAC-Narrative）',
        desc: '四个专业智能体协同工作：历史严谨性、教育对话、环境感知、安全守护。每个智能体基于 DeepSeek 驱动，通过协作日志实时展示 AI 决策过程。',
        color: '#f59e0b',
        active: true
      }
    ]

    const agents = [
      { name: '历史严谨性智能体', icon: '📚', role: 'DeepSeek+本地知识库' },
      { name: '教育对话智能体', icon: '🎓', role: '苏格拉底式提问' },
      { name: '环境感知智能体', icon: '🌤️', role: '天气API+高德POI' },
      { name: '安全守护智能体', icon: '🛡️', role: '地理围栏监控' }
    ]

    const planMetrics = [
      { key: 'teachingDepth', label: '讲解深度', color: '#8b5cf6' },
      { key: 'estimatedTime', label: '预计时长(分)', color: '#06b6d4' },
      { key: 'gainScore', label: '增益分数 G', color: '#10b981' },
      { key: 'safetyScore', label: '安全评分', color: '#ef4444' }
    ]

    const toggleLayer = (idx) => {
      const pos = expandedLayers.value.indexOf(idx)
      if (pos >= 0) {
        expandedLayers.value.splice(pos, 1)
      } else {
        expandedLayers.value.push(idx)
      }
    }

    return {
      expandedLayers,
      layers,
      agents,
      planMetrics,
      dimLabels,
      toggleLayer
    }
  }
}
</script>

<style scoped>
.case-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(16px);
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.case-panel {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(165deg, #12121e, #0a0a12);
  border-radius: 24px;
  border: 1px solid rgba(139, 92, 246, 0.15);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6), 0 0 80px rgba(99, 102, 241, 0.06);
  position: relative;
}

.panel-header {
  padding: 28px 28px 16px;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.panel-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.panel-icon { font-size: 22px; }
.panel-header h2 { font-size: 18px; font-weight: 700; color: #fff; margin: 0; letter-spacing: 0.03em; }

.panel-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
  padding-left: 32px;
  letter-spacing: 0.08em;
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  font-size: 14px;
}
.close-btn:hover { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

.panel-body { padding: 16px 24px 28px; }

.layer-section {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.25s ease;
}
.layer-section:hover { border-color: rgba(255, 255, 255, 0.1); }

.layer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}
.layer-header:hover { background: rgba(255, 255, 255, 0.02); }

.layer-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.layer-1 .layer-badge { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
.layer-2 .layer-badge { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
.layer-3 .layer-badge { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

.layer-header h3 {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  line-height: 1.4;
}

.layer-status {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.2);
  white-space: nowrap;
}
.layer-status.active { color: #34d399; }

.chevron { width: 16px; height: 16px; transition: transform 0.25s; color: rgba(255, 255, 255, 0.25); }

.layer-content { padding: 0 16px 16px; }
.layer-expand-enter-active, .layer-expand-leave-active { transition: all 0.3s ease; overflow: hidden; }
.layer-expand-enter-from, .layer-expand-leave-to { opacity: 0; transform: translateY(-8px); }

.layer-desc {
  font-size: 12px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}

.irt-output, .planning-output { margin-top: 12px; }

.irt-param {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.55);
}
.irt-param strong { color: #a78bfa; font-family: monospace; font-size: 16px; }

.irt-bar-container { margin-bottom: 16px; }
.irt-bar-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  position: relative;
}
.irt-bar-fill {
  position: absolute;
  top: -2px;
  width: 4px;
  height: 12px;
  border-radius: 2px;
  transition: left 0.8s ease;
}
.irt-marker {
  position: absolute;
  top: -6px;
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.15);
}
.irt-marker span {
  position: absolute;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: rgba(255, 255, 255, 0.2);
  white-space: nowrap;
}

.irt-dims { display: flex; flex-direction: column; gap: 8px; }
.irt-dim {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}
.dim-label { width: 70px; flex-shrink: 0; }
.dim-track { flex: 1; height: 5px; background: rgba(255, 255, 255, 0.06); border-radius: 3px; overflow: hidden; }
.dim-fill { height: 100%; background: linear-gradient(90deg, #8b5cf6, #6366f1); border-radius: 3px; transition: width 0.8s ease; }
.irt-dim > span:last-child { width: 36px; text-align: right; font-weight: 500; color: rgba(255, 255, 255, 0.6); }

.plan-route { display: flex; flex-direction: column; align-items: center; margin-bottom: 16px; }
.route-stop {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  position: relative;
  padding: 4px 0;
}
.stop-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.route-line { width: 20px; height: 30px; position: absolute; top: 18px; left: 4px; opacity: 0.4; }

.plan-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 14px; }
.metric-card {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  text-align: center;
}
.metric-value { display: block; font-size: 17px; font-weight: 700; margin-bottom: 2px; }
.metric-label { font-size: 10px; color: rgba(255, 255, 255, 0.35); }

.algorithm-info {
  padding: 8px 12px;
  background: rgba(6, 182, 212, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.12);
  border-radius: 8px;
}
.algorithm-info code {
  font-size: 11px;
  color: #22d3ee;
  font-family: monospace;
}

.agents-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 10px; }
.agent-card {
  padding: 14px 12px;
  background: rgba(245, 158, 11, 0.04);
  border: 1px solid rgba(245, 158, 11, 0.1);
  border-radius: 12px;
  text-align: center;
}
.agent-avatar { font-size: 28px; margin-bottom: 6px; }
.agent-name { font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.8); margin-bottom: 2px; }
.agent-role { font-size: 9px; color: rgba(255, 255, 255, 0.35); }

.gain-function {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(6, 182, 212, 0.05));
  border: 1px solid rgba(16, 185, 129, 0.1);
  border-radius: 14px;
}
.gain-function h4 { font-size: 12px; color: rgba(255, 255, 255, 0.6); margin: 0 0 12px; font-weight: 500; }

.gain-bars { display: flex; flex-direction: column; gap: 8px; }
.gain-item { display: flex; align-items: center; gap: 10px; font-size: 11px; }
.g-label { width: 65px; color: rgba(255, 255, 255, 0.45); flex-shrink: 0; }
.g-track { flex: 1; height: 6px; background: rgba(255, 255, 255, 0.06); border-radius: 3px; overflow: hidden; }
.g-fill { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
.g-val { width: 34px; text-align: right; font-weight: 600; color: rgba(255, 255, 255, 0.6); }
</style>
