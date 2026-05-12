<template>
  <div id="yanjing-app">
    <YanJingMap />
    <BottomPanel />

    <button class="home-btn" @click="goHome" title="返回官网">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import YanJingMap from './components/YanJingMap.vue'
import BottomPanel from './components/BottomPanel.vue'

function goHome(): void {
  window.location.href = '/culture'
}

onMounted(() => {
  document.title = '研景·达州 - 城市尺度人机共生学习系统'
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #1A1A2E;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#yanjing-app {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #1A1A2E;
}

.home-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(14, 14, 18, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: rgba(148, 163, 184, 0.45);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 160;
  transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
  backdrop-filter: blur(12px);
}

.home-btn:hover {
  background: rgba(18, 18, 22, 0.96);
  color: rgba(201, 165, 90, 0.75);
  border-color: rgba(201, 165, 90, 0.1);
  transform: translateY(-1px);
}
</style>
