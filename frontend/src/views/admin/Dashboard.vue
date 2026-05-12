<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="header-left">
        <h1 class="dashboard-title">系统管理后台</h1>
        <p class="dashboard-subtitle">DASHBOARD MANAGEMENT SYSTEM</p>
      </div>
      <div class="header-user">
        <div class="user-info">
          <span class="user-label">当前用户</span>
          <span class="user-value">{{ username }}</span>
        </div>
        <button class="logout-btn" @click="handleLogout">退出系统</button>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card stat-gold">
        <div class="stat-bg-effect"></div>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-value">{{ stats.redCulture }}</p>
          <p class="stat-label">红色文化</p>
        </div>
        <div class="stat-trend up">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
          +12%
        </div>
      </div>
      <div class="stat-card stat-gold-light">
        <div class="stat-bg-effect"></div>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            <path d="M2 12h20"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-value">{{ stats.scenicCulture }}</p>
          <p class="stat-label">景色文化</p>
        </div>
        <div class="stat-trend up">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
          +8%
        </div>
      </div>
      <div class="stat-card stat-gold-dark">
        <div class="stat-bg-effect"></div>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/>
            <line x1="10" y1="1" x2="10" y2="4"/>
            <line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-value">{{ stats.foodCulture }}</p>
          <p class="stat-label">美食文化</p>
        </div>
        <div class="stat-trend up">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
          +15%
        </div>
      </div>
      <div class="stat-card stat-dark">
        <div class="stat-bg-effect"></div>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-value">{{ stats.redCulture + stats.scenicCulture + stats.foodCulture }}</p>
          <p class="stat-label">内容总数</p>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card chart-line">
        <div class="chart-header">
          <h3 class="chart-title">内容趋势</h3>
          <div class="chart-actions">
            <button class="chart-btn" @click="refreshLineChart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="chart-body">
          <div ref="lineChartRef" class="chart-container"></div>
        </div>
      </div>
      <div class="chart-card chart-pie">
        <div class="chart-header">
          <h3 class="chart-title">景区内容分布</h3>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-dot" style="background: #d4af7a"></span>
              红色文化
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: #c9a96a"></span>
              景色文化
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: #b8985a"></span>
              美食文化
            </div>
          </div>
        </div>
        <div class="chart-body">
          <div ref="pieChartRef" class="chart-container-pie"></div>
        </div>
      </div>
    </div>

    <div class="api-key-section">
      <div class="api-key-card">
        <div class="api-key-header">
          <div class="api-key-title">
            <svg class="key-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            <h3>安全配置</h3>
          </div>
        </div>
        <div class="api-key-buttons">
          <button class="api-btn" @click="loadAPIConfig">
            API密钥配置
          </button>
          <button class="api-btn ip-btn" @click="loadIPRecords">
            IP访问记录
          </button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showIPModal" @click.self="showIPModal = false">
      <div class="modal ip-modal">
        <div class="modal-header">
          <h3 class="modal-title">IP访问记录</h3>
          <button class="modal-close" @click="showIPModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="ip-list">
            <div class="ip-item header">
              <span class="ip-checkbox">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
              </span>
              <span>IP地址</span>
              <span>失败次数</span>
              <span>状态</span>
              <span>操作</span>
            </div>
            <div v-if="ipRecords.length === 0" class="ip-empty">
              暂无访问记录
            </div>
            <div v-for="record in ipRecords" :key="record.id" class="ip-item">
              <span class="ip-checkbox">
                <input type="checkbox" :value="record.ip" v-model="selectedIPs" />
              </span>
              <span class="ip-address">{{ record.ip }}</span>
              <span class="ip-count">{{ record.fail_count }}次</span>
              <span class="ip-status">
                <span v-if="record.blocked" class="status-blocked">已拉黑</span>
                <span v-else-if="record.fail_count >= 5" class="status-warning">待拉黑</span>
                <span v-else class="status-normal">正常</span>
              </span>
              <span class="ip-actions">
                <button v-if="record.blocked" class="ip-btn unblock" @click="unblockIP(record.ip)">解除</button>
                <button v-else class="ip-btn block" @click="blockIP(record.ip)">拉黑</button>
                <button class="ip-btn delete" @click="deleteIP(record.ip)">删除</button>
              </span>
            </div>
            <div v-if="ipRecords.length > 0" class="ip-footer">
              <div class="ip-batch-actions">
                <span class="selected-count">已选择 {{ selectedIPs.length }} 项</span>
                <button class="ip-btn batch-block" @click="batchBlock" :disabled="selectedIPs.length === 0">批量拉黑</button>
                <button class="ip-btn batch-unblock" @click="batchUnblock" :disabled="selectedIPs.length === 0">批量解除</button>
                <button class="ip-btn block-all" @click="blockAllIPs">全部拉黑</button>
                <button class="ip-btn clear-all" @click="clearAllIPs">清空所有</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showWarningModal" @click.self="showWarningModal = false">
      <div class="modal warning-modal">
        <div class="warning-icon-big">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          </svg>
        </div>
        <h3 class="warning-title">安全警告</h3>
        <p class="warning-text">
          您即将访问敏感配置区域，此操作将被记录
        </p>
        <div class="warning-actions">
          <button class="cancel-btn" @click="showWarningModal = false">取消</button>
          <button class="confirm-btn" @click="proceedToVerify" :disabled="countdown > 0">
            <span v-if="countdown > 0">确定 ({{ countdown }})</span>
            <span v-else>确定</span>
          </button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showVerifyModal" @click.self="showVerifyModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">身份验证</h3>
          <button class="modal-close" @click="showVerifyModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <p class="verify-hint">请完成验证以继续</p>
          <div class="verify-form">
            <div class="form-group">
              <label class="form-label">姓名</label>
              <input type="text" v-model="verifyForm.name" class="form-input" placeholder="请输入姓名" />
            </div>
            <div class="form-group">
              <label class="form-label">密钥</label>
              <input type="text" v-model="verifyForm.secret" class="form-input" placeholder="请输入密钥" />
            </div>
            <div class="form-group">
              <label class="form-label">最喜欢的游戏</label>
              <input type="text" v-model="verifyForm.game" class="form-input" placeholder="请输入" />
            </div>
            <div class="captcha-section">
              <label class="form-label">滑动验证</label>
              <div class="captcha-wrapper" :class="{ success: captchaSuccess, error: captchaError }">
                <div class="captcha-canvas-container">
                  <canvas ref="bgCanvas" class="captcha-bg" width="320" height="160"></canvas>
                  <canvas ref="sliderCanvas" class="captcha-slider" width="40" height="160" :style="{ left: sliderLeft + 'px' }"></canvas>
                </div>
                <div class="captcha-track">
                  <div class="captcha-track-bg">
                    <span class="track-hint" v-if="!captchaSuccess">向右滑动</span>
                    <span class="track-success" v-else>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      验证通过
                    </span>
                  </div>
                  <div class="captcha-slider-btn"
                    :class="{ dragging: isDragging, success: captchaSuccess }"
                    :style="{ left: sliderLeft + 'px' }"
                    @mousedown="startDrag"
                    @touchstart="startDrag">
                    <svg v-if="!captchaSuccess" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
                <div class="captcha-error-msg" v-if="captchaError">验证失败</div>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="cancel-btn" @click="showVerifyModal = false">取消</button>
            <button class="confirm-btn" @click="handleVerify" :disabled="!captchaSuccess || verifying">
              {{ verifying ? '验证中...' : '确认' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showApiConfigModal" @click.self="showApiConfigModal = false">
      <div class="modal api-modal">
        <div class="modal-header">
          <h3 class="modal-title">API密钥配置</h3>
          <button class="modal-close" @click="showApiConfigModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="api-config-form">
            <div class="form-group">
              <label class="form-label">高德地图</label>
              <input type="text" v-model="apiConfig.amap" class="form-input" placeholder="高德地图API" />
            </div>
            <div class="form-group">
              <label class="form-label">DeepSeek</label>
              <input type="text" v-model="apiConfig.deepseek" class="form-input" placeholder="DeepSeek API" />
            </div>
            <div class="form-group">
              <label class="form-label">天气API</label>
              <input type="text" v-model="apiConfig.weather" class="form-input" placeholder="天气API" />
            </div>
          </div>
          <div class="modal-actions">
            <button class="cancel-btn" @click="showApiConfigModal = false">取消</button>
            <button class="confirm-btn" @click="saveApiConfig">保存</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showSuccess">
      <div class="modal success-modal">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 class="success-title">保存成功</h3>
        <p class="success-text">配置已保存</p>
        <button class="ok-btn" @click="showSuccess = false">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { spotAPI, cultureAPI } from '@/api'
import { securityUtils } from '@/utils/security'
import { ipRecordManager } from '@/utils/ipRecordManager'

const router = useRouter()
const username = ref(localStorage.getItem('admin_username') || 'zzq')
const showWarningModal = ref(false)
const showVerifyModal = ref(false)
const showApiConfigModal = ref(false)
const showSuccess = ref(false)
const showIPModal = ref(false)
const verifying = ref(false)
const apiCalls = ref(0)
const countdown = ref(0)
const loading = ref(false)
const ipRecords = ref([])
const selectedIPs = ref([])
const selectAll = ref(false)

const stats = ref({
  redCulture: 0,
  scenicCulture: 0,
  foodCulture: 0
})

const verifyForm = ref({
  name: '',
  secret: '',
  game: ''
})

const apiConfig = ref({
  amap: '',
  deepseek: '',
  weather: ''
})

const bgCanvas = ref(null)
const sliderCanvas = ref(null)
const captchaToken = ref('')
const targetX = ref(0)
const sliderLeft = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startLeft = ref(0)
const captchaSuccess = ref(false)
const captchaError = ref(false)
const trajectory = ref([])
const maxX = 280

let lineChart = null
let pieChart = null
const lineChartRef = ref(null)
const pieChartRef = ref(null)
let countdownTimer = null

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const [redData, scenicData, foodData] = await Promise.all([
      cultureAPI.getRedCulture(),
      cultureAPI.getScenicCulture(),
      cultureAPI.getFoodCulture()
    ])
    
    const redItems = redData?.items || []
    const scenicItems = scenicData?.items || []
    const foodItems = foodData?.items || []
    
    stats.value = {
      redCulture: Array.isArray(redItems) ? redItems.length : 0,
      scenicCulture: Array.isArray(scenicItems) ? scenicItems.length : 0,
      foodCulture: Array.isArray(foodItems) ? foodItems.length : 0
    }
    
    if (lineChart) {
      lineChart.setOption({
        series: [{
          data: [
            Math.floor(Math.random() * 100) + 50,
            Math.floor(Math.random() * 100) + 80,
            Math.floor(Math.random() * 100) + 60,
            Math.floor(Math.random() * 100) + 120,
            Math.floor(Math.random() * 100) + 90,
            Math.floor(Math.random() * 100) + 150,
            Math.floor(Math.random() * 100) + 130
          ]
        }]
      })
    }
    
    if (pieChart) {
      pieChart.setOption({
        series: [{
          data: [
            { value: stats.value.redCulture, name: '红色文化' },
            { value: stats.value.scenicCulture, name: '景色文化' },
            { value: stats.value.foodCulture, name: '美食文化' }
          ]
        }]
      })
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    stats.value = {
      redCulture: 0,
      scenicCulture: 0,
      foodCulture: 0
    }
  } finally {
    loading.value = false
  }
}

const drawGapShape = (ctx, x, y) => {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + 20, y)
  ctx.lineTo(x + 40, y + 20)
  ctx.lineTo(x + 40, y + 40)
  ctx.lineTo(x + 20, y + 40)
  ctx.lineTo(x, y + 20)
  ctx.closePath()
}

const drawCaptcha = (x) => {
  if (!bgCanvas.value || !sliderCanvas.value) return
  const bgCtx = bgCanvas.value.getContext('2d')
  const sliderCtx = sliderCanvas.value.getContext('2d')
  
  bgCtx.clearRect(0, 0, 320, 160)
  sliderCtx.clearRect(0, 0, 40, 160)
  
  const bgGradient = bgCtx.createLinearGradient(0, 0, 320, 160)
  bgGradient.addColorStop(0, '#1a1a1f')
  bgGradient.addColorStop(1, '#0f0f12')
  bgCtx.fillStyle = bgGradient
  bgCtx.fillRect(0, 0, 320, 160)
  
  sliderCtx.fillStyle = bgGradient
  sliderCtx.fillRect(0, 0, 40, 160)
  
  bgCtx.fillStyle = '#666'
  bgCtx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  bgCtx.textAlign = 'center'
  bgCtx.fillText('请滑动完成验证', 160, 85)
  
  sliderCtx.fillStyle = '#666'
  sliderCtx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  sliderCtx.textAlign = 'center'
  sliderCtx.fillText('请滑动完成验证', 20, 85)
  
  const gapY = 60
  
  bgCtx.save()
  bgCtx.globalCompositeOperation = 'destination-out'
  bgCtx.fillStyle = '#000'
  drawGapShape(bgCtx, x, gapY)
  bgCtx.fill()
  bgCtx.restore()
  
  bgCtx.strokeStyle = 'rgba(212, 175, 122, 0.3)'
  bgCtx.lineWidth = 2
  drawGapShape(bgCtx, x, gapY)
  bgCtx.stroke()
  
  sliderCtx.save()
  sliderCtx.beginPath()
  sliderCtx.rect(0, 0, 40, 160)
  sliderCtx.clip()
  drawGapShape(sliderCtx, -x, gapY)
  sliderCtx.fillStyle = '#d4af7a'
  sliderCtx.fill()
  sliderCtx.strokeStyle = '#c9a96a'
  sliderCtx.lineWidth = 2
  drawGapShape(sliderCtx, -x, gapY)
  sliderCtx.stroke()
  sliderCtx.restore()
}

const getCaptcha = async () => {
  targetX.value = Math.floor(Math.random() * 180) + 60
  sliderLeft.value = 0
  captchaSuccess.value = false
  captchaError.value = false
  drawCaptcha(targetX.value)
}

const resetCaptcha = () => {
  sliderLeft.value = 0
  captchaSuccess.value = false
  captchaError.value = false
  targetX.value = Math.floor(Math.random() * 180) + 60
  drawCaptcha(targetX.value)
}

const getEventX = (e) => {
  if (e.touches) return e.touches[0].clientX
  return e.clientX
}

const startDrag = (e) => {
  if (captchaSuccess.value) return
  isDragging.value = true
  startX.value = getEventX(e)
  startLeft.value = sliderLeft.value
  trajectory.value = []
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', endDrag)
}

const onDrag = (e) => {
  if (!isDragging.value) return
  e.preventDefault()
  
  const currentX = getEventX(e)
  const diff = currentX - startX.value
  let newLeft = startLeft.value + diff
  
  if (newLeft < 0) newLeft = 0
  if (newLeft > maxX) newLeft = maxX
  
  sliderLeft.value = newLeft
  trajectory.value.push({ t: Date.now(), x: newLeft })
}

const endDrag = async () => {
  if (!isDragging.value) return
  isDragging.value = false
  
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)
  
  const distance = Math.abs(sliderLeft.value - targetX.value)
  if (distance < 8) {
    captchaSuccess.value = true
    captchaError.value = false
  } else {
    captchaError.value = true
    setTimeout(() => resetCaptcha(), 1000)
  }
}

const startCountdown = () => {
  countdown.value = 3
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(countdownTimer)
  }, 1000)
}

const proceedToVerify = () => {
  showWarningModal.value = false
  showVerifyModal.value = true
  nextTick(() => getCaptcha())
}

const handleVerify = async () => {
  if (!captchaSuccess.value) {
    ElMessage.warning('请完成滑动验证')
    return
  }

  if (!verifyForm.value.name || !verifyForm.value.secret || !verifyForm.value.game) {
    ElMessage.warning('请填写所有信息')
    return
  }

  const nameValidation = securityUtils.validateInput(verifyForm.value.name, 'username')
  const secretValidation = securityUtils.validateInput(verifyForm.value.secret, 'password')
  const gameValidation = securityUtils.validateInput(verifyForm.value.game, 'text')

  if (!nameValidation.valid || !secretValidation.valid || !gameValidation.valid) {
    ElMessage.error('输入格式包含非法字符')
    return
  }

  const encryptedSecret = securityUtils.encryptPassword(verifyForm.value.secret)

  verifying.value = true

  const verifyData = {
    name: securityUtils.escapeHtml(verifyForm.value.name),
    secret: verifyForm.value.secret,
    encryptedSecret: encryptedSecret ? encryptedSecret.encrypted : null,
    game: securityUtils.escapeHtml(verifyForm.value.game.toUpperCase()),
    timestamp: Date.now()
  }

  setTimeout(() => {
    if (verifyData.name === 'zzq' && verifyData.secret === '13558526791' && verifyData.game === 'PUBG') {
      showVerifyModal.value = false
      showApiConfigModal.value = true
      resetVerifyForm()
      ElMessage.success('身份验证通过')
    } else {
      ElMessage.error('验证信息不正确')
      failCount.value++
      resetCaptcha()

      if (failCount.value >= 3) {
        ElMessage.error('验证失败次数过多，正在返回官网...')
        setTimeout(() => {
          router.push('/')
        }, 1500)
      }
    }
    verifying.value = false
  }, 800)
}

const resetVerifyForm = () => {
  verifyForm.value = { name: '', secret: '', game: '' }
  resetCaptcha()
}

const saveApiConfig = () => {
  showApiConfigModal.value = false
  showSuccess.value = true
  ElMessage.success('保存成功')
}

const refreshLineChart = () => {
  if (lineChart) {
    fetchDashboardData()
  }
}

const initLineChart = () => {
  if (!lineChartRef.value) return

  lineChart = echarts.init(lineChartRef.value)

  const lineOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(18, 18, 26, 0.95)',
      borderColor: 'rgba(212, 175, 122, 0.3)',
      borderWidth: 1,
      textStyle: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 13 },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(212, 175, 122, 0.3)',
          type: 'dashed'
        }
      },
      formatter: function(params) {
        let result = `<div style="font-weight:600;margin-bottom:8px;color:#d4af7a">${params[0].axisValueLabel}</div>`
        params.forEach(param => {
          result += `<div style="display:flex;align-items:center;margin:4px 0">
            <span style="display:inline-block;margin-right:8px;border-radius:50%;width:10px;height:10px;background:${param.color}"></span>
            <span style="flex:1;color:rgba(255,255,255,0.7)">${param.seriesName}</span>
            <span style="font-weight:600;color:#fff">${param.value}</span>
          </div>`
        })
        return result
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
          width: 1
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        margin: 12
      },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        margin: 12
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.05)',
          type: 'dashed'
        }
      },
      axisTick: { show: false }
    },
    series: [{
      name: 'API调用',
      type: 'line',
      smooth: 0.6,
      symbol: 'circle',
      symbolSize: 8,
      data: [120, 132, 101, 134, 90, 230, 210],
      lineStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#d4af7a' },
          { offset: 0.3, color: '#c9a96a' },
          { offset: 0.7, color: '#b8985a' },
          { offset: 1, color: '#a0784a' }
        ]),
        width: 3,
        shadowColor: 'rgba(212, 175, 122, 0.3)',
        shadowBlur: 10,
        shadowOffsetY: 8
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: 'rgba(212, 175, 122, 0.25)' },
          { offset: 0.3, color: 'rgba(201, 169, 106, 0.15)' },
          { offset: 0.7, color: 'rgba(184, 152, 90, 0.08)' },
          { offset: 1, color: 'rgba(160, 120, 74, 0.02)' }
        ])
      },
      itemStyle: {
        color: '#d4af7a',
        borderColor: 'rgba(10, 10, 15, 0.8)',
        borderWidth: 2,
        shadowColor: 'rgba(212, 175, 122, 0.5)',
        shadowBlur: 8
      },
      emphasis: {
        scale: 1.8,
        focus: 'series'
      },
      animationDuration: 2000,
      animationEasing: 'cubicInOut',
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: {
          color: 'rgba(212, 175, 122, 0.2)',
          type: 'dashed',
          width: 1
        },
        data: [
          { type: 'average', name: '平均值' }
        ],
        label: {
          formatter: '平均值: {c}',
          position: 'end',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: 11
        }
      }
    }]
  }

  lineChart.setOption(lineOption)
}

const initPieChart = () => {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)

  const pieOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(18, 18, 26, 0.95)',
      borderColor: 'rgba(212, 175, 122, 0.3)',
      borderWidth: 1,
      textStyle: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 13 },
      padding: [12, 16],
      formatter: function(params) {
        return `<div style="font-weight:600;color:#d4af7a;margin-bottom:8px">${params.name}</div>
          <div style="display:flex;justify-content:space-between;gap:20px">
            <span style="color:rgba(255,255,255,0.6)">数量</span>
            <span style="font-weight:600;color:#fff">${params.value}</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:20px;margin-top:4px">
            <span style="color:rgba(255,255,255,0.6)">占比</span>
            <span style="font-weight:600;color:#d4af7a">${params.percent.toFixed(1)}%</span>
          </div>`
      }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 13
      },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 16,
      formatter: function(name) {
        const data = pieOption.series[0].data
        const item = data.find(d => d.name === name)
        return `${name}  ${item.value}`
      }
    },
    series: [{
      name: '内容分布',
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: 'rgba(10, 10, 15, 0.8)',
        borderWidth: 3
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        scale: true,
        scaleSize: 10,
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#d4af7a',
          formatter: '{b}\n{d}%'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        {
          value: stats.value.redCulture,
          name: '红色文化',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
              { offset: 0, color: '#d4af7a' },
              { offset: 1, color: '#b8985a' }
            ])
          }
        },
        {
          value: stats.value.scenicCulture,
          name: '景色文化',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
              { offset: 0, color: '#c9a96a' },
              { offset: 1, color: '#a0784a' }
            ])
          }
        },
        {
          value: stats.value.foodCulture,
          name: '美食文化',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
              { offset: 0, color: '#b8985a' },
              { offset: 1, color: '#8a6840' }
            ])
          }
        }
      ],
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDuration: 1500
    }]
  }

  pieChart.setOption(pieOption)
}

const initCharts = async () => {
  await nextTick()
  initLineChart()
  initPieChart()
  await fetchDashboardData()
}

const handleResize = () => {
  lineChart?.resize()
  pieChart?.resize()
}

const loadAPIConfig = () => {
  showWarningModal.value = true
  countdown.value = 3
}

const loadIPRecords = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/v1/security/ip-records')
    const data = await res.json()
    ipRecords.value = data.records || []
    showIPModal.value = true
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const blockIP = async (ip) => {
  try {
    const res = await fetch('http://localhost:5000/api/v1/security/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip })
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success('已拉黑 ' + ip)
      loadIPRecords()
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const unblockIP = async (ip) => {
  try {
    const res = await fetch('http://localhost:5000/api/v1/security/unblock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip })
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success('已解除 ' + ip)
      loadIPRecords()
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const deleteIP = async (ip) => {
  try {
    const res = await fetch('http://localhost:5000/api/v1/security/ip/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip })
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success('已删除 ' + ip)
      loadIPRecords()
    }
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIPs.value = ipRecords.value.map(r => r.ip)
  } else {
    selectedIPs.value = []
  }
}

const batchBlock = async () => {
  if (selectedIPs.value.length === 0) {
    ElMessage.warning('请先选择IP')
    return
  }
  try {
    const res = await fetch('http://localhost:5000/api/v1/security/batch-block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: selectedIPs.value })
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success('已批量拉黑 ' + selectedIPs.value.length + ' 个IP')
      selectedIPs.value = []
      selectAll.value = false
      loadIPRecords()
    }
  } catch (e) {
    ElMessage.error('批量拉黑失败')
  }
}

const batchUnblock = async () => {
  if (selectedIPs.value.length === 0) {
    ElMessage.warning('请先选择IP')
    return
  }
  try {
    for (const ip of selectedIPs.value) {
      await fetch('http://localhost:5000/api/v1/security/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      })
    }
    ElMessage.success('已批量解除 ' + selectedIPs.value.length + ' 个IP')
    selectedIPs.value = []
    selectAll.value = false
    loadIPRecords()
  } catch (e) {
    ElMessage.error('批量解除失败')
  }
}

const blockAllIPs = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/v1/security/block-all', {
      method: 'POST'
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success('已拉黑所有IP')
      loadIPRecords()
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const clearAllIPs = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/v1/security/ips/clear', {
      method: 'POST'
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success('已清空所有记录')
      loadIPRecords()
    }
  } catch (e) {
    ElMessage.error('清空失败')
  }
}

const handleLogout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_username')
  localStorage.removeItem('admin_password')
  sessionStorage.removeItem('security_verified')
  ElMessage.success('已退出')
  router.push('/admin/security')
}

watch(showWarningModal, (val) => {
  if (val) {
    startCountdown()
  } else {
    countdown.value = 0
    if (countdownTimer) clearInterval(countdownTimer)
  }
})

onMounted(() => {
  securityUtils.antiDebug.enable()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  securityUtils.antiDebug.disable()
  lineChart?.dispose()
  pieChart?.dispose()
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background: linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: rgba(18, 18, 26, 0.8);
  padding: 24px 28px;
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 122, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dashboard-title {
  font-size: 22px;
  font-weight: 600;
  color: #d4af7a;
  margin: 0;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 8px rgba(212, 175, 122, 0.2);
}

.dashboard-subtitle {
  font-size: 11px;
  color: rgba(212, 175, 122, 0.6);
  margin: 0;
  letter-spacing: 0.15em;
  font-family: 'Courier New', monospace;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: rgba(212, 175, 122, 0.05);
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 122, 0.1);
}

.user-label {
  font-size: 11px;
  color: rgba(212, 175, 122, 0.6);
}

.user-value {
  font-size: 14px;
  color: #d4af7a;
  font-weight: 600;
}

.logout-btn {
  padding: 10px 24px;
  background: transparent;
  border: 1px solid rgba(212, 175, 122, 0.3);
  border-radius: 8px;
  color: #d4af7a;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: rgba(212, 175, 122, 0.1);
  border-color: rgba(212, 175, 122, 0.5);
  box-shadow: 0 0 12px rgba(212, 175, 122, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(18, 18, 26, 0.6);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 122, 0.08);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: rgba(212, 175, 122, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.stat-bg-effect {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.05;
  transform: translate(20%, -20%);
}

.stat-gold .stat-bg-effect {
  background: linear-gradient(135deg, #d4af7a, #c9a96a);
}

.stat-gold-light .stat-bg-effect {
  background: linear-gradient(135deg, #c9a96a, #b8985a);
}

.stat-gold-dark .stat-bg-effect {
  background: linear-gradient(135deg, #b8985a, #a7874a);
}

.stat-dark .stat-bg-effect {
  background: linear-gradient(135deg, #333, #222);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(212, 175, 122, 0.15);
}

.stat-gold .stat-icon {
  background: rgba(212, 175, 122, 0.1);
  color: #d4af7a;
}

.stat-gold-light .stat-icon {
  background: rgba(201, 169, 106, 0.1);
  color: #c9a96a;
}

.stat-gold-dark .stat-icon {
  background: rgba(184, 152, 90, 0.1);
  color: #b8985a;
}

.stat-dark .stat-icon {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(212, 175, 122, 0.6);
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 16px;
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.stat-trend.down {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.stat-trend svg {
  width: 14px;
  height: 14px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background: rgba(18, 18, 26, 0.6);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(212, 175, 122, 0.08);
  backdrop-filter: blur(10px);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(212, 175, 122, 0.1);
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: #d4af7a;
  margin: 0;
  letter-spacing: 0.02em;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.chart-btn {
  width: 34px;
  height: 34px;
  background: rgba(212, 175, 122, 0.05);
  border: 1px solid rgba(212, 175, 122, 0.15);
  border-radius: 6px;
  color: rgba(212, 175, 122, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.chart-btn:hover {
  background: rgba(212, 175, 122, 0.1);
  border-color: rgba(212, 175, 122, 0.3);
  color: #d4af7a;
}

.chart-btn svg {
  width: 16px;
  height: 16px;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.chart-body {
  position: relative;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.chart-container-pie {
  height: 300px;
  width: 100%;
}

.api-key-section {
  margin-top: 24px;
}

.api-key-card {
  background: rgba(18, 18, 26, 0.6);
  border-radius: 12px;
  padding: 28px;
  border: 1px solid rgba(212, 175, 122, 0.08);
  border-left: 3px solid #d4af7a;
  backdrop-filter: blur(10px);
}

.api-key-header {
  margin-bottom: 20px;
}

.api-key-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.api-key-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: #d4af7a;
  margin: 0;
}

.key-icon {
  width: 22px;
  height: 22px;
  color: #d4af7a;
}

.api-key-buttons {
  display: flex;
  gap: 12px;
}

.api-key-buttons .api-btn {
  flex: 1;
}

.api-key-buttons .ip-btn {
  background: rgba(255, 71, 87, 0.1);
  border-color: rgba(255, 71, 87, 0.3);
  color: #ff4757;
}

.api-key-buttons .ip-btn:hover {
  background: rgba(255, 71, 87, 0.15);
  border-color: rgba(255, 71, 87, 0.5);
}

.api-btn {
  width: 100%;
  padding: 14px 28px;
  background: transparent;
  border: 1px solid rgba(212, 175, 122, 0.3);
  border-radius: 8px;
  color: #d4af7a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 0.05em;
}

.api-btn:hover {
  background: rgba(212, 175, 122, 0.1);
  border-color: rgba(212, 175, 122, 0.5);
  box-shadow: 0 0 16px rgba(212, 175, 122, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal {
  background: rgba(18, 18, 26, 0.95);
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
  border: 1px solid rgba(212, 175, 122, 0.15);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(-20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.warning-modal {
  text-align: center;
  padding: 48px 36px;
}

.warning-icon-big {
  width: 72px;
  height: 72px;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.warning-icon-big svg {
  width: 36px;
  height: 36px;
  color: #ff4d4f;
}

.warning-title {
  font-size: 20px;
  font-weight: 600;
  color: #d4af7a;
  margin: 0 0 12px 0;
}

.warning-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.warning-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(212, 175, 122, 0.1);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #d4af7a;
  margin: 0;
}

.modal-close {
  width: 34px;
  height: 34px;
  background: rgba(212, 175, 122, 0.05);
  border: 1px solid rgba(212, 175, 122, 0.15);
  border-radius: 6px;
  color: rgba(212, 175, 122, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 77, 79, 0.1);
  border-color: rgba(255, 77, 79, 0.3);
  color: #ff4d4f;
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.modal-content {
  padding: 24px;
}

.verify-hint {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0 0 24px 0;
}

.verify-form,
.api-config-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: #d4af7a;
  font-size: 13px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(10, 10, 15, 0.8);
  border: 1px solid rgba(212, 175, 122, 0.15);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: rgba(212, 175, 122, 0.4);
  background: rgba(10, 10, 15, 0.9);
  box-shadow: 0 0 0 2px rgba(212, 175, 122, 0.1);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.captcha-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.captcha-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.captcha-wrapper.success .captcha-track {
  background: rgba(82, 196, 26, 0.1);
  border-color: rgba(82, 196, 26, 0.3);
}

.captcha-wrapper.success .track-success {
  color: #52c41a;
}

.captcha-wrapper.error .captcha-track {
  background: rgba(255, 77, 79, 0.1);
  border-color: rgba(255, 77, 79, 0.3);
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.captcha-canvas-container {
  position: relative;
  width: 320px;
  height: 160px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 122, 0.15);
  background: #0f0f12;
}

.captcha-bg {
  display: block;
  width: 100%;
  height: 100%;
}

.captcha-slider {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
}

.captcha-track {
  position: relative;
  width: 320px;
  height: 40px;
  background: rgba(10, 10, 15, 0.8);
  border: 1px solid rgba(212, 175, 122, 0.15);
  border-radius: 8px;
  margin: 0 auto;
  overflow: hidden;
}

.captcha-track-bg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-hint {
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
}

.track-success {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}

.track-success svg {
  width: 16px;
  height: 16px;
}

.captcha-slider-btn {
  position: absolute;
  top: 2px;
  left: 0;
  width: 36px;
  height: 36px;
  background: rgba(212, 175, 122, 0.1);
  border: 1px solid rgba(212, 175, 122, 0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  transition: all 0.2s;
}

.captcha-slider-btn:hover {
  background: rgba(212, 175, 122, 0.15);
  border-color: rgba(212, 175, 122, 0.4);
}

.captcha-slider-btn.dragging {
  cursor: grabbing;
}

.captcha-slider-btn.success {
  background: rgba(82, 196, 26, 0.1);
  border-color: rgba(82, 196, 26, 0.3);
}

.captcha-slider-btn svg {
  width: 18px;
  height: 18px;
  color: #d4af7a;
}

.captcha-slider-btn.success svg {
  color: #52c41a;
}

.captcha-error-msg {
  color: #ff4d4f;
  font-size: 12px;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 16px;
  margin-top: 28px;
}

.cancel-btn {
  flex: 1;
  padding: 12px 24px;
  background: transparent;
  border: 1px solid rgba(212, 175, 122, 0.2);
  border-radius: 8px;
  color: rgba(212, 175, 122, 0.7);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  border-color: rgba(212, 175, 122, 0.4);
  color: #d4af7a;
}

.confirm-btn {
  flex: 2;
  padding: 12px 24px;
  background: rgba(212, 175, 122, 0.1);
  border: 1px solid rgba(212, 175, 122, 0.3);
  border-radius: 8px;
  color: #d4af7a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn:hover:not(:disabled) {
  background: rgba(212, 175, 122, 0.15);
  border-color: rgba(212, 175, 122, 0.5);
  box-shadow: 0 0 12px rgba(212, 175, 122, 0.2);
}

.confirm-btn:disabled {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.api-modal {
  max-width: 520px;
}

.success-modal {
  text-align: center;
  padding: 48px 36px;
}

.success-icon {
  width: 72px;
  height: 72px;
  background: rgba(82, 196, 26, 0.1);
  border: 1px solid rgba(82, 196, 26, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.success-icon svg {
  width: 36px;
  height: 36px;
  color: #52c41a;
}

.success-title {
  font-size: 20px;
  font-weight: 600;
  color: #d4af7a;
  margin: 0 0 8px 0;
}

.success-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 32px 0;
}

.ok-btn {
  padding: 12px 48px;
  background: rgba(82, 196, 26, 0.1);
  border: 1px solid rgba(82, 196, 26, 0.3);
  border-radius: 8px;
  color: #52c41a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.ok-btn:hover {
  background: rgba(82, 196, 26, 0.15);
  border-color: rgba(82, 196, 26, 0.5);
}

.ip-modal {
  width: 600px;
  max-height: 80vh;
}

.ip-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ip-item {
  display: grid;
  grid-template-columns: 40px 1.5fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  align-items: center;
}

.ip-item.header {
  background: rgba(255, 255, 255, 0.05);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ip-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #d4af7a;
}

.ip-batch-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.selected-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-right: 8px;
}

.ip-address {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #d4af7a;
}

.ip-count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.ip-status {
  font-size: 12px;
}

.status-blocked {
  color: #ff4757;
  font-weight: 600;
}

.status-warning {
  color: #ffa502;
  font-weight: 600;
}

.status-normal {
  color: #2ed573;
}

.ip-actions {
  display: flex;
  gap: 8px;
}

.ip-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.ip-btn.block {
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.3);
}

.ip-btn.block:hover {
  background: rgba(255, 71, 87, 0.2);
}

.ip-btn.unblock {
  background: rgba(46, 213, 115, 0.1);
  color: #2ed573;
  border: 1px solid rgba(46, 213, 115, 0.3);
}

.ip-btn.unblock:hover {
  background: rgba(46, 213, 115, 0.2);
}

.ip-btn.delete {
  background: rgba(255, 165, 2, 0.1);
  color: #ffa502;
  border: 1px solid rgba(255, 165, 2, 0.3);
}

.ip-btn.delete:hover {
  background: rgba(255, 165, 2, 0.2);
}

.ip-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
}

.ip-btn.batch-block,
.ip-btn.batch-unblock,
.ip-btn.block-all {
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.3);
  padding: 6px 14px;
  font-size: 12px;
}

.ip-btn.batch-block:hover,
.ip-btn.batch-unblock:hover,
.ip-btn.block-all:hover {
  background: rgba(255, 71, 87, 0.2);
}

.ip-btn.batch-unblock {
  background: rgba(46, 213, 115, 0.1);
  color: #2ed573;
  border: 1px solid rgba(46, 213, 115, 0.3);
}

.ip-btn.batch-unblock:hover {
  background: rgba(46, 213, 115, 0.2);
}

.ip-btn.clear-all {
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.3);
  padding: 6px 14px;
  font-size: 12px;
}

.ip-btn.clear-all:hover {
  background: rgba(255, 71, 87, 0.2);
}

.ip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ip-empty {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}
</style>