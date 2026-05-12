<template>
  <div class="yanjing-dashboard">
    <div class="dashboard-header">
      <div class="header-title">
        <h1>研景系统</h1>
        <span class="subtitle">城市尺度人机共生学习系统</span>
      </div>
      <div class="header-controls">
        <button class="tab-btn" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
          系统概览
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'demo' }" @click="activeTab = 'demo'">
          答辩演示
        </button>
      </div>
    </div>

    <div class="dashboard-content" v-if="activeTab === 'overview'">
      <div class="main-grid">
        <div class="left-column">
          <MultiAgentPanel />
          <SwarmRing />
        </div>
        <div class="right-column">
          <CausalEngine />
          <MemoryDeposition />
        </div>
      </div>
    </div>

    <div class="dashboard-content demo-mode" v-else>
      <div class="demo-header">
        <div class="demo-title">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>竞赛答辩模式</span>
        </div>
        <div class="demo-tips">
          <span class="tip">提示：点击"模拟群体共振"按钮可触发同伴互教事件</span>
          <span class="tip">提示：在因果引擎中选择分支并与AI辩论</span>
          <span class="tip">提示：生成记忆DNA并选择位置种植</span>
        </div>
      </div>

      <div class="demo-grid">
        <div class="demo-section full-width">
          <div class="section-label">多智能体分工可视化</div>
          <MultiAgentPanel />
        </div>

        <div class="demo-section">
          <div class="section-label">现场模拟：群体共振</div>
          <SwarmRing />
        </div>

        <div class="demo-section">
          <div class="section-label">因果推断式叙事引擎</div>
          <CausalEngine />
        </div>

        <div class="demo-section full-width">
          <div class="section-label">记忆沉积演示</div>
          <MemoryDeposition />
        </div>
      </div>

      <div class="demo-conclusion">
        <div class="conclusion-text">
          <p>"我们没有用现成的库拼凑功能，而是构建了一套<strong>城市尺度的人机共生学习系统</strong>。"</p>
          <p>"这是全球首个将<strong>因果推断引擎</strong>应用于历史教育的研学平台，也是首个实现<strong>去中心化自适应学习</strong>的系统架构。"</p>
          <p>"当其他队伍还在用推荐算法展示景点时，我们已经在用<strong>认知冲突</strong>促进深度学习。"</p>
        </div>
        <div class="tech-highlights">
          <div class="highlight">
            <span class="highlight-num">01</span>
            <span class="highlight-text">空间锚定叙事粒子</span>
            <span class="highlight-desc">物理空间数字化的记忆载体</span>
          </div>
          <div class="highlight">
            <span class="highlight-num">02</span>
            <span class="highlight-text">群体智能共振环</span>
            <span class="highlight-desc">去中心化P2P实时协作</span>
          </div>
          <div class="highlight">
            <span class="highlight-num">03</span>
            <span class="highlight-text">因果推断引擎</span>
            <span class="highlight-desc">制造认知冲突而非推荐内容</span>
          </div>
          <div class="highlight">
            <span class="highlight-num">04</span>
            <span class="highlight-text">城市文化神经网络</span>
            <span class="highlight-desc">跨时空记忆传承基础设施</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MultiAgentPanel from './MultiAgentPanel.vue'
import SwarmRing from './SwarmRing.vue'
import CausalEngine from './CausalEngine.vue'
import MemoryDeposition from './MemoryDeposition.vue'

const activeTab = ref<'overview' | 'demo'>('overview')
</script>

<style scoped>
.yanjing-dashboard {
  min-height: 100vh;
  background: #0a0a0f;
  color: rgba(241, 245, 249, 0.9);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.header-title h1 {
  font-size: 20px;
  font-weight: 700;
  color: rgba(201, 165, 90, 0.9);
  margin: 0 0 4px 0;
  letter-spacing: 0.05em;
}

.subtitle {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.5);
}

.header-controls {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  color: rgba(148, 163, 184, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(241, 245, 249, 0.8);
}

.tab-btn.active {
  background: rgba(201, 165, 90, 0.1);
  border-color: rgba(201, 165, 90, 0.2);
  color: rgba(201, 165, 90, 0.9);
}

.dashboard-content {
  padding: 24px 32px;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-mode {
  max-width: 1600px;
  margin: 0 auto;
}

.demo-header {
  background: rgba(201, 165, 90, 0.05);
  border: 1px solid rgba(201, 165, 90, 0.1);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.demo-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: rgba(201, 165, 90, 0.9);
  margin-bottom: 16px;
}

.demo-title svg {
  width: 24px;
  height: 24px;
  color: rgba(201, 165, 90, 0.8);
}

.demo-tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.6);
  padding-left: 16px;
  position: relative;
}

.tip::before {
  content: '>';
  position: absolute;
  left: 0;
  color: rgba(201, 165, 90, 0.4);
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.demo-section {
  display: flex;
  flex-direction: column;
}

.demo-section.full-width {
  grid-column: 1 / -1;
}

.section-label {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.4);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.demo-conclusion {
  margin-top: 32px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
}

.conclusion-text {
  margin-bottom: 24px;
}

.conclusion-text p {
  font-size: 14px;
  color: rgba(203, 213, 225, 0.8);
  line-height: 1.8;
  margin-bottom: 12px;
}

.conclusion-text strong {
  color: rgba(201, 165, 90, 0.9);
}

.tech-highlights {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.highlight {
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.highlight-num {
  font-size: 24px;
  font-weight: 700;
  color: rgba(201, 165, 90, 0.3);
  font-family: 'SF Mono', Monaco, monospace;
}

.highlight-text {
  font-size: 13px;
  font-weight: 600;
  color: rgba(241, 245, 249, 0.9);
}

.highlight-desc {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.5);
}

@media (max-width: 1200px) {
  .main-grid,
  .demo-grid {
    grid-template-columns: 1fr;
  }

  .tech-highlights {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
