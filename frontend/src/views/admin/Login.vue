<template>
  <div class="login-page">
    <div class="login-wrapper">
      <div class="warning-banner" v-if="failCount > 0">
        <div class="warning-content">
          <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div class="warning-text">
            <span class="warning-count">验证失败 {{ failCount }} 次</span>
            <span class="warning-hint" v-if="failCount >= 3">注意：超过 3 次将被强制返回官网</span>
          </div>
        </div>
      </div>

      <div class="login-container">
        <div class="login-header">
          <h1 class="login-title">敏感数据访问系统</h1>
          <p class="login-subtitle">SYSTEM RESTRICTED ACCESS</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">姓名</label>
            <input type="text" v-model="form.name" class="form-input" placeholder="请输入姓名" autocomplete="off" />
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <input type="password" v-model="form.password" class="form-input" placeholder="请输入密码" />
          </div>

          <div class="captcha-section">
            <label class="form-label">滑动验证</label>
            <div class="captcha-wrapper" :class="{ success: captchaSuccess, error: captchaError }">
              <div class="captcha-canvas-container">
                <canvas ref="bgCanvas" class="captcha-bg" width="320" height="160"></canvas>
                <canvas ref="sliderCanvas" class="captcha-slider" width="40" height="160" :style="{ left: sliderLeft + 'px', width: '40px' }"></canvas>
              </div>

              <div class="captcha-track">
                <div class="captcha-track-bg">
                  <span class="track-hint" v-if="!captchaSuccess">拖动滑块完成验证</span>
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
              <div class="captcha-error-msg" v-if="captchaError">验证失败，请重试</div>
            </div>
          </div>

          <button type="submit" class="login-btn" :disabled="!captchaSuccess || loading">
            <span v-if="loading">登录中...</span>
            <span v-else>进入系统</span>
          </button>
        </form>
      </div>

      <div class="modal-overlay" v-if="showIPWarningModal">
        <div class="modal warning-modal">
          <div class="warning-icon-big">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            </svg>
          </div>
          <h3 class="warning-title">安全警告</h3>
          <p class="warning-text">
            验证失败次数过多，您的IP已被记录
          </p>
          <div class="ip-info-box">
            <p class="ip-label">您的IP地址</p>
            <p class="ip-value">{{ ipWarningInfo.ip }}</p>
          </div>
          <div class="ip-info-box">
            <p class="ip-label">失败次数</p>
            <p class="ip-value">{{ ipWarningInfo.failCount }} 次</p>
          </div>
          <p class="contact-admin">请联系管理员解封: <strong>13558526791</strong></p>
          <button class="ok-btn" @click="closeIPWarning">我知道了</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { securityUtils } from '../../utils/security'
import { ipRecordManager } from '../../utils/ipRecordManager'

const router = useRouter()

const bgCanvas = ref(null)
const sliderCanvas = ref(null)

const form = ref({
  name: '',
  password: ''
})

const captchaToken = ref('')
const targetX = ref(0)
const sliderLeft = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startLeft = ref(0)
const captchaSuccess = ref(false)
const captchaError = ref(false)
const loading = ref(false)
const failCount = ref(0)
const trajectory = ref([])
const loginAttempts = ref(0)
const lastLoginTime = ref(0)
const showIPWarningModal = ref(false)
const ipWarningInfo = ref({ ip: '', failCount: 0 })

const maxX = 280

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
  const bgCtx = bgCanvas.value.getContext('2d')
  const sliderCtx = sliderCanvas.value.getContext('2d')

  bgCtx.clearRect(0, 0, 320, 160)
  sliderCtx.clearRect(0, 0, 40, 160)

  const bgGradient = bgCtx.createLinearGradient(0, 0, 320, 160)
  bgGradient.addColorStop(0, '#1a0f0f')
  bgGradient.addColorStop(0.5, '#2d1515')
  bgGradient.addColorStop(1, '#1a0f0f')
  bgCtx.fillStyle = bgGradient
  bgCtx.fillRect(0, 0, 320, 160)

  sliderCtx.fillStyle = bgGradient
  sliderCtx.fillRect(0, 0, 40, 160)

  bgCtx.fillStyle = 'rgba(255, 255, 255, 0.02)'
  bgCtx.font = 'bold 32px Arial'
  bgCtx.textAlign = 'center'
  bgCtx.fillText('RESTRICTED', 160, 60)
  bgCtx.font = '14px Arial'
  bgCtx.fillText('SYSTEM ACCESS VERIFICATION', 160, 90)
  bgCtx.fillText('DZ-WH-2024', 160, 120)

  sliderCtx.fillStyle = 'rgba(255, 255, 255, 0.02)'
  sliderCtx.font = 'bold 32px Arial'
  sliderCtx.textAlign = 'center'
  sliderCtx.fillText('RESTRICTED', 20, 60)
  sliderCtx.font = '14px Arial'
  sliderCtx.fillText('SYSTEM ACCESS VERIFICATION', 20, 90)
  sliderCtx.fillText('DZ-WH-2024', 20, 120)

  const gapY = 60

  bgCtx.save()
  bgCtx.globalCompositeOperation = 'destination-out'
  bgCtx.fillStyle = '#000'
  drawGapShape(bgCtx, x, gapY)
  bgCtx.fill()
  bgCtx.restore()

  bgCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
  bgCtx.lineWidth = 2
  drawGapShape(bgCtx, x, gapY)
  bgCtx.stroke()

  sliderCtx.save()
  sliderCtx.beginPath()
  sliderCtx.rect(0, 0, 40, 160)
  sliderCtx.clip()
  drawGapShape(sliderCtx, -x, gapY)
  sliderCtx.fillStyle = 'rgba(255, 100, 100, 0.9)'
  sliderCtx.fill()
  sliderCtx.strokeStyle = '#ff0000'
  sliderCtx.lineWidth = 2
  drawGapShape(sliderCtx, -x, gapY)
  sliderCtx.stroke()
  sliderCtx.restore()

  sliderCtx.save()
  sliderCtx.beginPath()
  sliderCtx.rect(0, 0, 40, 160)
  sliderCtx.clip()
  sliderCtx.globalCompositeOperation = 'source-in'
  sliderCtx.fillStyle = 'rgba(255, 255, 255, 0.02)'
  sliderCtx.font = 'bold 32px Arial'
  sliderCtx.textAlign = 'center'
  sliderCtx.fillText('RESTRICTED', 20, 60)
  sliderCtx.font = '14px Arial'
  sliderCtx.fillText('SYSTEM ACCESS VERIFICATION', 20, 90)
  sliderCtx.fillText('DZ-WH-2024', 20, 120)
  sliderCtx.restore()
}

const getCaptcha = async () => {
  targetX.value = Math.floor(Math.random() * 180) + 60
  sliderLeft.value = 0
  captchaSuccess.value = false
  captchaError.value = false
  trajectory.value = []
  await nextTick()
  drawCaptcha(targetX.value)
}

const closeIPWarning = () => {
  showIPWarningModal.value = false
  failCount.value = 0
  resetCaptcha()
}

const getEventX = (e) => {
  if (e.touches) {
    return e.touches[0].clientX
  }
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

  trajectory.value.push({
    t: Date.now(),
    x: newLeft
  })
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
    failCount.value++

    if (failCount.value >= 3) {
      const clientIP = await ipRecordManager.getClientIP()
      ipRecordManager.addRecord(clientIP, '滑动验证失败超过3次')
      ipWarningInfo.value = {
        ip: clientIP,
        failCount: failCount.value
      }
      showIPWarningModal.value = true
      ElMessageBox.alert(
        `<div style="text-align:center;">
          <p style="color:#ff4d4f;font-size:16px;font-weight:bold;margin-bottom:10px;">⚠️ 安全警告</p>
          <p style="color:#666;margin-bottom:8px;">验证失败次数过多，您的IP已被记录</p>
          <p style="color:#333;font-size:13px;">IP地址: <strong>${clientIP}</strong></p>
          <p style="color:#666;margin-top:10px;font-size:12px;">请联系管理员解封: <strong>13558526791</strong></p>
        </div>`,
        'IP安全记录',
        {
          confirmButtonText: '我知道了',
          dangerouslyUseHTMLString: true,
          showClose: false,
          closeOnClickModal: false
        }
      )
      return
    }

    setTimeout(() => {
      resetCaptcha()
    }, 1000)
  }
}

const resetCaptcha = () => {
  sliderLeft.value = 0
  captchaSuccess.value = false
  captchaError.value = false
  trajectory.value = []
  targetX.value = Math.floor(Math.random() * 180) + 60
  setTimeout(() => drawCaptcha(targetX.value), 100)
}

const handleLogin = async () => {
  if (!captchaSuccess.value) {
    ElMessage.warning('请先完成滑动验证')
    return
  }

  if (!form.value.name || !form.value.password) {
    ElMessage.warning('请输入姓名和密码')
    resetCaptcha()
    return
  }

  const nameValidation = securityUtils.validateInput(form.value.name, 'username')
  const passwordValidation = securityUtils.validateInput(form.value.password, 'password')

  if (!nameValidation.valid || !passwordValidation.valid) {
    ElMessage.error('输入格式不正确')
    resetCaptcha()
    return
  }

  const now = Date.now()
  if (loginAttempts.value >= 3 && now - lastLoginTime.value < 30000) {
    ElMessage.error('登录尝试过于频繁，请30秒后重试')
    resetCaptcha()
    return
  }

  loading.value = true
  loginAttempts.value++
  lastLoginTime.value = now

  const encryptedPassword = await securityUtils.encryptPassword(form.value.password)

  if (!encryptedPassword) {
    ElMessage.error('安全验证失败，请刷新页面重试')
    loading.value = false
    resetCaptcha()
    return
  }

  const loginData = {
    name: securityUtils.escapeHtml(form.value.name),
    password: form.value.password,
    encrypted: encryptedPassword.encrypted,
    timestamp: encryptedPassword.timestamp,
    random: encryptedPassword.random,
    captchaVerified: true
  }

  const checkFailAndWarn = async () => {
    if (failCount.value >= 3) {
        const clientIP = await ipRecordManager.getClientIP()
        ipRecordManager.addRecord(clientIP, '登录失败超过3次')
      ipWarningInfo.value = {
        ip: clientIP,
        failCount: failCount.value
      }
      showIPWarningModal.value = true
      ElMessageBox.alert(
        `<div style="text-align:center;">
          <p style="color:#ff4d4f;font-size:16px;font-weight:bold;margin-bottom:10px;">⚠️ 安全警告</p>
          <p style="color:#666;margin-bottom:8px;">登录失败次数过多，您的IP已被记录</p>
          <p style="color:#333;font-size:13px;">IP地址: <strong>${clientIP}</strong></p>
          <p style="color:#666;margin-top:10px;font-size:12px;">请联系管理员解封: <strong>13558526791</strong></p>
        </div>`,
        'IP安全记录',
        {
          confirmButtonText: '我知道了',
          dangerouslyUseHTMLString: true,
          showClose: false,
          closeOnClickModal: false
        }
      )
    }
  }

  setTimeout(() => {
    if (loginData.name === 'zzq' && loginData.password === 'zzq123') {
      const sessionToken = securityUtils.simpleHash(`${encryptedPassword.encrypted}_${Date.now()}_admin_access`)
      localStorage.setItem('admin_token', sessionToken)
      localStorage.setItem('admin_username', securityUtils.escapeHtml('zzq'))
      localStorage.setItem('admin_password', '***')
      ElMessage.success('登录成功')
      router.push('/admin/dashboard')
    } else {
      ElMessage.error('姓名或密码错误')
      failCount.value++
      resetCaptcha()
      checkFailAndWarn()
    }
    loading.value = false
  }, 800)
}

onMounted(() => {
  getCaptcha()
})

onUnmounted(() => {
  securityUtils.antiDebug.disable()
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0505 0%, #1a0f0f 50%, #0a0505 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 0, 0, 0.01) 2px,
      rgba(255, 0, 0, 0.01) 4px
    );
  pointer-events: none;
}

.login-wrapper {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}

.warning-banner {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.warning-icon {
  width: 24px;
  height: 24px;
  color: #ff4444;
  flex-shrink: 0;
}

.warning-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.warning-count {
  color: #ff4444;
  font-size: 14px;
  font-weight: 600;
}

.warning-hint {
  color: rgba(255, 100, 100, 0.8);
  font-size: 12px;
}

.login-container {
  background: rgba(20, 10, 10, 0.95);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 12px;
  padding: 40px 32px;
  box-shadow:
    0 0 60px rgba(255, 0, 0, 0.1),
    0 4px 24px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.login-title {
  color: #ff4444;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: 0.05em;
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  letter-spacing: 0.15em;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.03em;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: rgba(255, 0, 0, 0.5);
  box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.1);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.captcha-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.captcha-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.captcha-wrapper.success .captcha-track {
  background: rgba(0, 200, 100, 0.1);
  border-color: rgba(0, 200, 100, 0.3);
}

.captcha-wrapper.success .track-success {
  color: #00c864;
}

.captcha-wrapper.error .captcha-track {
  background: rgba(255, 0, 0, 0.1);
  border-color: rgba(255, 0, 0, 0.5);
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
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
  border: 1px solid rgba(255, 0, 0, 0.2);
  background: #000;
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
  width: 40px;
  height: 160px;
}

.captcha-track {
  position: relative;
  width: 320px;
  height: 44px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 0, 0, 0.2);
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
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.track-success svg {
  width: 16px;
  height: 16px;
}

.captcha-slider-btn {
  position: absolute;
  top: 2px;
  left: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(255, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.captcha-slider-btn:hover {
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.4);
}

.captcha-slider-btn.dragging {
  cursor: grabbing;
}

.captcha-slider-btn.success {
  background: linear-gradient(135deg, #00c864 0%, #009944 100%);
  box-shadow: 0 2px 8px rgba(0, 200, 100, 0.3);
}

.captcha-slider-btn svg {
  width: 18px;
  height: 18px;
  color: #fff;
}

.captcha-error-msg {
  color: #ff4444;
  font-size: 12px;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff5555 0%, #dd1111 100%);
  box-shadow: 0 4px 16px rgba(255, 0, 0, 0.3);
}

.login-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.login-btn:disabled {
  background: rgba(255, 0, 0, 0.3);
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal.warning-modal {
  background: rgba(20, 10, 10, 0.98);
  border-radius: 16px;
  padding: 40px 36px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  border: 1px solid rgba(255, 0, 0, 0.3);
  box-shadow: 0 0 60px rgba(255, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.warning-icon-big {
  width: 80px;
  height: 80px;
  background: rgba(255, 0, 0, 0.1);
  border: 2px solid rgba(255, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.warning-icon-big svg {
  width: 40px;
  height: 40px;
  color: #ff4444;
}

.warning-title {
  color: #ff4444;
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.warning-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0 0 24px 0;
}

.ip-info-box {
  background: rgba(255, 0, 0, 0.05);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.ip-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  margin: 0 0 4px 0;
}

.ip-value {
  color: #ff4444;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  margin: 0;
}

.contact-admin {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin: 20px 0 24px 0;
}

.contact-admin strong {
  color: #d4af7a;
  font-size: 15px;
}

.ok-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ok-btn:hover {
  background: linear-gradient(135deg, #ff5555 0%, #dd1111 100%);
  box-shadow: 0 4px 16px rgba(255, 0, 0, 0.3);
}
</style>
