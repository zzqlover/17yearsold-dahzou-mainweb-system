<template>
  <div class="security-page" :class="{ exiting: isSuccess }">
    <div class="security-container" :class="{ success: isSuccess }">
      <div class="security-header">
        <div class="shield-icon" :class="{ success: isSuccess }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path class="check-mark" d="M9 12l2 2 4-4"/>
          </svg>
        </div>
        <h1 class="security-title">安全验证</h1>
        <p class="security-subtitle">SECURITY VERIFICATION REQUIRED</p>
      </div>

      <div class="security-content">
        <div class="blocked-warning" v-if="isBlocked">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
          <div class="blocked-text">
            <p class="blocked-title">访问受限</p>
            <p class="blocked-message">{{ blockedMessage }}</p>
            <p class="blocked-contact">管理员微信(),,WeChat：zzq135585267911012</p>
          </div>
        </div>

        <div class="key-input-wrapper" v-else>
          <label class="key-label">请输入访问密钥 <span class="fail-count" v-if="failCount > 0">(失败{{ failCount }}次)</span></label>
          <div class="key-input-container" :class="{ error: hasError, success: isSuccess }">
            <input
              type="password"
              v-model="securityKey"
              class="key-input"
              placeholder="请输入密钥"
              @keyup.enter="handleVerify"
              autocomplete="off"
            />
            <div class="key-icon">
              <svg v-if="!isSuccess" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <div class="error-message" v-if="hasError">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            密钥错误，请重试
          </div>
        </div>

        <button class="verify-btn" @click="handleVerify" :disabled="!securityKey || isSuccess">
          <span v-if="isSuccess">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            验证通过
          </span>
          <span v-else>验证进入</span>
        </button>
      </div>
    </div>

    <div class="background-effects">
      <div class="grid-overlay"></div>
      <div class="scan-line"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const securityKey = ref('')
const hasError = ref(false)
const isSuccess = ref(false)
const failCount = ref(0)
const isBlocked = ref(false)
const blockedMessage = ref('')

onMounted(() => {
  sessionStorage.removeItem('security_verified')
})

const handleVerify = async () => {
  if (!securityKey.value || isBlocked.value) return

  const key = securityKey.value.trim()

  try {
    const res = await fetch('/api/v1/security/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    })
    const data = await res.json()

    if (data.success) {
      hasError.value = false
      isSuccess.value = true
      setTimeout(() => {
        sessionStorage.setItem('security_verified', 'true')
        router.push('/admin/login')
      }, 1200)
    } else if (data.error === 'blocked' || data.error === 'too_many_attempts') {
      isBlocked.value = true
      blockedMessage.value = data.message || '验证失败次数过多，您的IP已被记录，请联系管理员13558526791'
      failCount.value = data.failCount || 5
    } else {
      hasError.value = true
      failCount.value = data.failCount || 0
      setTimeout(() => {
        hasError.value = false
      }, 2000)
    }
  } catch (e) {
    hasError.value = true
    setTimeout(() => {
      hasError.value = false
    }, 2000)
  }
}
</script>

<style scoped>
.security-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.security-container {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  position: relative;
  z-index: 10;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.security-container.success {
  transform: translateY(-20px);
  opacity: 0.9;
}

.security-header {
  text-align: center;
  margin-bottom: 50px;
}

.shield-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(212, 175, 122, 0.1), rgba(212, 175, 122, 0.05));
  border: 1px solid rgba(212, 175, 122, 0.3);
  border-radius: 50%;
  transition: all 0.4s ease;
}

.shield-icon.success {
  background: linear-gradient(135deg, rgba(46, 213, 115, 0.15), rgba(46, 213, 115, 0.08));
  border-color: rgba(46, 213, 115, 0.4);
  box-shadow: 0 0 30px rgba(46, 213, 115, 0.2);
}

.shield-icon svg {
  width: 100%;
  height: 100%;
  color: #d4af7a;
  transition: color 0.3s ease;
}

.shield-icon.success svg {
  color: #2ed573;
}

.check-mark {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: drawCheck 0.4s ease-out forwards;
}

@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}

.security-title {
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
  letter-spacing: 4px;
}

.security-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 3px;
  font-family: 'Courier New', monospace;
}

.security-content {
  background: rgba(26, 26, 46, 0.6);
  border: 1px solid rgba(212, 175, 122, 0.2);
  border-radius: 12px;
  padding: 40px;
  backdrop-filter: blur(10px);
  transition: all 0.4s ease;
}

.security-content.success {
  border-color: rgba(46, 213, 115, 0.3);
  box-shadow: 0 0 40px rgba(46, 213, 115, 0.1);
}

.blocked-warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 30px;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 12px;
  text-align: center;
}

.blocked-warning svg {
  width: 60px;
  height: 60px;
  color: #ff4757;
}

.blocked-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.blocked-title {
  color: #ff4757;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.blocked-message {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
}

.blocked-contact {
  color: #d4af7a;
  font-size: 16px;
  font-weight: 600;
  margin: 8px 0 0 0;
}

.fail-count {
  color: #ff4757;
  font-size: 12px;
}

.key-input-wrapper {
  margin-bottom: 30px;
}

.key-label {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.key-input-container {
  position: relative;
  border: 2px solid rgba(212, 175, 122, 0.3);
  border-radius: 8px;
  background: rgba(10, 10, 15, 0.8);
  transition: all 0.3s ease;
}

.key-input-container:focus-within {
  border-color: #d4af7a;
  box-shadow: 0 0 20px rgba(212, 175, 122, 0.2);
}

.key-input-container.error {
  border-color: #ff4757;
  animation: shake 0.5s ease;
}

.key-input-container.success {
  border-color: #2ed573;
  background: rgba(46, 213, 115, 0.1);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

.key-input {
  width: 100%;
  padding: 16px 50px 16px 20px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 16px;
  letter-spacing: 2px;
  outline: none;
}

.key-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
}

.key-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  color: rgba(212, 175, 122, 0.5);
  transition: color 0.3s ease;
}

.key-input-container.success .key-icon {
  color: #2ed573;
}

.key-icon svg {
  width: 100%;
  height: 100%;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  color: #ff4757;
  font-size: 13px;
  animation: fadeIn 0.3s ease;
}

.error-message svg {
  width: 16px;
  height: 16px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.verify-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #d4af7a, #c9a96a);
  border: none;
  border-radius: 8px;
  color: #0a0a0f;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.verify-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 122, 0.4);
}

.verify-btn:disabled {
  background: #d4af7a;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 122, 0.4);
  cursor: default;
}

.verify-btn svg {
  width: 20px;
  height: 20px;
}

.background-effects {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(212, 175, 122, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 175, 122, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 122, 0.3), transparent);
  animation: scan 4s linear infinite;
}

@keyframes scan {
  0% { top: 0; }
  100% { top: 100%; }
}
</style>
