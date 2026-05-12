export const securityUtils = {
  async sha256(str) {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  },

  md5(str) {
    return this._md5Fast(str)
  },

  _md5Fast(str) {
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i)
      h |= 0
    }
    return Math.abs(h).toString(16)
  },

  escapeHtml(unsafe) {
    if (!unsafe) return ''
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  },

  validateInput(input, type = 'text') {
    if (!input) return { valid: true, sanitized: '' }

    const sanitized = this.escapeHtml(String(input).trim())

    const patterns = {
      username: /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/,
      password: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,20}$/,
      key: /^[0-9]{4,20}$/,
      text: /^[\s\S]{0,500}$/
    }

    const pattern = patterns[type] || patterns.text
    const valid = pattern.test(input)

    return { valid, sanitized }
  },

  async encryptPassword(password, salt = '') {
    try {
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 15)
      const combined = `${randomStr}${timestamp}${password}${salt}`
      const shaHash = await this.sha256(combined)
      return {
        encrypted: shaHash,
        timestamp,
        random: randomStr
      }
    } catch (error) {
      console.error('Encryption failed:', error)
      return null
    }
  },

  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  },

  generateCSRFToken() {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  },

  validateSecurityKey(key) {
    const numKey = parseInt(key, 10)
    return !isNaN(numKey) && numKey > 1000000 && numKey < 9999999
  },

  encodeData(data) {
    try {
      const encoder = new TextEncoder()
      const bytes = encoder.encode(JSON.stringify(data))
      let binary = ''
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      return btoa(binary)
    } catch (error) {
      return null
    }
  },

  decodeData(encoded) {
    try {
      const binary = atob(encoded)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const decoder = new TextDecoder()
      return JSON.parse(decoder.decode(bytes))
    } catch (error) {
      return null
    }
  },

  obfuscateString(str) {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] ^= 0x55
    }
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  },

  deobfuscateString(obfuscated) {
    try {
      const binary = atob(obfuscated)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i) ^ 0x55
      }
      return new TextDecoder().decode(bytes)
    } catch (error) {
      return null
    }
  },

  xorEncrypt(str, key) {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] ^= (key % 256)
    }
    const decoder = new TextDecoder()
    return decoder.decode(bytes)
  },

  generateBehaviorKey(mouseMoves, keyPresses) {
    const mouseSum = mouseMoves.reduce((a, b) => a ^ b, 12345)
    const keySum = keyPresses.reduce((a, b) => a ^ b, 0)
    return mouseSum ^ keySum
  },

  _checkDevToolsSync() {
    const threshold = 160
    return window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold
  },

  checkDevTools() {
    return new Promise(resolve => {
      setTimeout(() => {
        if (this._checkDevToolsSync()) {
          resolve(true)
          return
        }

        let checkStatus = false
        const element = document.createElement('div')
        element.style.cssText = 'width:1px;height:1px;position:absolute;top:0;left:0;overflow:hidden;'
        document.body.appendChild(element)
        const size = element.getBoundingClientRect()
        document.body.removeChild(element)

        if (size.width === 0 || size.height === 0) {
          checkStatus = true
        }

        resolve(checkStatus)
      }, 100)
    })
  },

  detectDebugger() {
    const start = performance.now()
    for (let i = 0; i < 1000; i++) {
      Math.random()
    }
    const end = performance.now()
    return end - start > 50
  },

  detectBot() {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      return false
    }

    let score = 0
    if (navigator.webdriver) score++
    if (/HeadlessChrome/.test(navigator.userAgent)) score++
    if (!navigator.plugins || navigator.plugins.length === 0) score++
    if (!navigator.languages || navigator.languages.length === 0) score++
    if (window.chrome && !window.chrome.loadTimes) score++
    if (!window.indexedDB) score++
    if (!navigator.hardwareConcurrency) score++
    if (screen.width < 200 || screen.height < 200) score++

    return score >= 3
  },

  async generateHumanToken() {
    const data = `${Date.now()}-${navigator.hardwareConcurrency || 4}-${screen.width}x${screen.height}-${navigator.language}`
    return this.sha256(data)
  },

  secureSessionStorage: {
    setItem(key, value) {
      try {
        const encrypted = securityUtils.obfuscateString(JSON.stringify(value))
        sessionStorage.setItem(key, encrypted)
      } catch (e) {
        sessionStorage.setItem(key, value)
      }
    },
    getItem(key) {
      try {
        const item = sessionStorage.getItem(key)
        if (!item) return null
        return JSON.parse(securityUtils.deobfuscateString(item))
      } catch (e) {
        return sessionStorage.getItem(key)
      }
    },
    removeItem(key) {
      sessionStorage.removeItem(key)
    }
  },

  antiDebug: {
    enabled: false,
    interval: null,
    score: 0,

    enable() {
      if (this.enabled) return
      this.enabled = true
      this.score = 0

      const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1'

      this.interval = setInterval(() => {
        const devToolsOpen = securityUtils._checkDevToolsSync()
        const debugSlow = securityUtils.detectDebugger()

        if (devToolsOpen || debugSlow) {
          this.score++
        }

        if (isDev) {
          if (devToolsOpen) {
            this.disable()
            window.location.reload()
          }
        } else {
          if (this.score >= 3) {
            document.body.style.filter = 'blur(8px)'
            document.body.style.pointerEvents = 'none'

            if (!document.getElementById('security-warning-banner')) {
              const banner = document.createElement('div')
              banner.id = 'security-warning-banner'
              banner.style.cssText = 'position:fixed;top:0;left:0;width:100%;z-index:10000;background:#1a0000;color:#ff4444;padding:12px;text-align:center;font-size:14px;'
              banner.innerHTML = '检测到异常环境，页面已锁定。<button onclick="window.reloadClean()" style="margin-left:16px;padding:6px 16px;background:#cc0000;color:#fff;border:none;border-radius:4px;cursor:pointer;">页面显示异常？点此安全刷新</button>'
              document.body.appendChild(banner)
            }
          }
        }
      }, 500)
    },

    disable() {
      if (this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }
      this.enabled = false
      this.score = 0
      document.body.style.filter = ''
      document.body.style.pointerEvents = ''

      const banner = document.getElementById('security-warning-banner')
      if (banner) banner.remove()
    }
  },

  behaviorTracker: {
    mouseMoves: [],
    keyPresses: [],
    scrollEvents: [],
    mouseTimestamps: [],
    keyTimestamps: [],
    isHuman: false,
    verified: false,
    startTime: Date.now(),

    init() {
      const self = this

      document.addEventListener('mousemove', (e) => {
        const now = Date.now()
        self.mouseMoves.push({ x: e.clientX, y: e.clientY, t: now })
        if (self.mouseMoves.length > 100) self.mouseMoves = self.mouseMoves.slice(-50)
        if (!self.verified && self.mouseMoves.length > 0) self._analyze()
      }, { passive: true })

      document.addEventListener('keydown', (e) => {
        const now = Date.now()
        self.keyTimestamps.push(now)
        self.keyPresses.push(e.keyCode)
        if (self.keyTimestamps.length > 50) {
          self.keyTimestamps = self.keyTimestamps.slice(-30)
          self.keyPresses = self.keyPresses.slice(-30)
        }
        if (!self.verified) self._analyze()
      }, { passive: true })

      window.addEventListener('scroll', () => {
        const now = Date.now()
        self.scrollEvents.push(now)
        if (self.scrollEvents.length > 20) self.scrollEvents = self.scrollEvents.slice(-10)
        if (!self.verified) self._analyze()
      }, { passive: true })
    },

    _analyze() {
      if (this.mouseMoves.length < 5 || this.keyTimestamps.length < 1) return

      let nonLinearMoves = 0
      for (let i = 2; i < this.mouseMoves.length; i++) {
        const m1 = this.mouseMoves[i - 2]
        const m2 = this.mouseMoves[i - 1]
        const m3 = this.mouseMoves[i]

        const dx1 = m2.x - m1.x
        const dy1 = m2.y - m1.y
        const dx2 = m3.x - m2.x
        const dy2 = m3.y - m2.y

        const angle1 = Math.atan2(dy1, dx1)
        const angle2 = Math.atan2(dy2, dx2)
        const angleDiff = Math.abs(angle2 - angle1)

        if (angleDiff > 0.1) nonLinearMoves++
      }

      let scrollPauses = 0
      for (let i = 1; i < this.scrollEvents.length; i++) {
        if (this.scrollEvents[i] - this.scrollEvents[i - 1] > 1000) {
          scrollPauses++
        }
      }

      let keyInterval200 = false
      if (this.keyTimestamps.length >= 2) {
        for (let i = 1; i < this.keyTimestamps.length; i++) {
          if (this.keyTimestamps[i] - this.keyTimestamps[i - 1] > 200) {
            keyInterval200 = true
            break
          }
        }
      }

      if (nonLinearMoves >= 5 && scrollPauses >= 2 && keyInterval200) {
        this.isHuman = true
        this.verified = true
        sessionStorage.setItem('human_verified', 'true')
      }

      if (this.mouseMoves.length > 30) {
        this._curvatureAnalysis()
      }
    },

    _curvatureAnalysis() {
      const moves = this.mouseMoves
      const last30 = moves.slice(-30)
      if (last30.length < 10) return

      const speeds = []
      for (let i = 1; i < last30.length; i++) {
        const dx = last30[i].x - last30[i - 1].x
        const dy = last30[i].y - last30[i - 1].y
        const dt = last30[i].t - last30[i - 1].t
        if (dt > 0) {
          speeds.push(Math.sqrt(dx * dx + dy * dy) / dt)
        }
      }

      if (speeds.length < 5) return

      const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length
      const variance = speeds.reduce((a, b) => a + (b - mean) ** 2, 0) / speeds.length
      const stddev = Math.sqrt(variance)

      if (stddev < 0.05) {
        this.isHuman = false
      }
    },

    getBehaviorKey() {
      return securityUtils.generateBehaviorKey(
        this.mouseMoves.map(m => m.x ^ m.y),
        this.keyPresses
      )
    },

    reset() {
      this.mouseMoves = []
      this.keyPresses = []
      this.scrollEvents = []
      this.mouseTimestamps = []
      this.keyTimestamps = []
      this.isHuman = false
      this.verified = false
      this.startTime = Date.now()
    }
  },

  fakeDataInjector: {
    originalFetch: null,
    active: false,
    injectedElements: [],

    _generateFakeData() {
      const noises = [
        'fake_value_' + Math.random().toFixed(6),
        '数据噪声_' + Date.now().toString(36),
        '干扰文本_' + (Math.random() * 9999).toFixed(0)
      ]
      return {
        spots: [
          { name: 'XX公园', description: noises[0] },
          { name: 'YY广场', description: noises[1] }
        ],
        contacts: { phone: '0818-' + (Math.random() * 9999).toFixed(0), email: 'fake@example.com' }
      }
    },

    enable() {
      const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      if (isDev) return

      if (this.active) return
      this.active = true
      this.originalFetch = window.fetch

      const self = this
      window.fetch = function(url, options) {
        if (securityUtils.detectBot()) {
          const fakeData = self._generateFakeData()
          return Promise.resolve(new Response(JSON.stringify({ data: fakeData, fake: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }))
        }
        return self.originalFetch.apply(this, arguments)
      }

      this._injectFakeDOM()
    },

    disable() {
      if (this.originalFetch) {
        window.fetch = this.originalFetch
        this.originalFetch = null
      }
      this.active = false

      this.injectedElements.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el)
      })
      this.injectedElements = []
    },

    _injectFakeDOM() {
      const fakeId = 'fake_' + this.simpleHash(Date.now().toString()).substring(0, 8)
      const fakeDiv = document.createElement('div')
      fakeDiv.id = fakeId
      fakeDiv.className = 'fake_' + Math.random().toString(36).substring(2, 10)
      fakeDiv.style.cssText = 'display:none;'
      const noise = '干扰数据_' + Date.now()
      fakeDiv.innerHTML = `<div class="fn_${Math.random().toString(36).substring(2, 8)}">${noise}</div>`
      document.body.appendChild(fakeDiv)
      this.injectedElements.push(fakeDiv)
    },

    simpleHash(str) {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i)
        hash |= 0
      }
      return Math.abs(hash).toString(16)
    }
  },

  contentProtector: {
    timer: null,

    init() {
      const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      if (isDev) return

      const self = this

      this.timer = setTimeout(() => {
        if (!securityUtils.behaviorTracker.isHuman) {
          const overlay = document.createElement('div')
          overlay.id = 'content-placeholder'
          overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;'
          overlay.innerHTML = `
            <div style="font-size:18px;margin-bottom:20px;">请完成验证以继续浏览</div>
            <div style="font-size:14px;color:#aaa;margin-bottom:20px;">${Math.floor(Math.random() * 10)} + ${Math.floor(Math.random() * 10)} = ?</div>
            <button onclick="window.reloadClean()" style="padding:12px 24px;background:#cc0000;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;">页面显示异常？点此安全刷新</button>
          `
          document.body.appendChild(overlay)
        }
      }, 5000)
    },

    disable() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      const overlay = document.getElementById('content-placeholder')
      if (overlay) overlay.remove()
    }
  },

  enableAll() {
    this.antiDebug.enable()
    this.behaviorTracker.init()
    this.fakeDataInjector.enable()
    this.contentProtector.init()
  },

  disableAll() {
    this.antiDebug.disable()
    this.fakeDataInjector.disable()
    this.contentProtector.disable()
  },

  debounce(func, wait = 300, immediate = false) {
    let timeout = null
    return function executedFunction(...args) {
      const later = () => {
        timeout = null
        if (!immediate) func.apply(this, args)
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(this, args)
    }
  },

  throttle(func, limit = 300) {
    let inThrottle = false
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}

window.reloadClean = function() {
  sessionStorage.setItem('bypass_protection', '1')
  window.location.reload()
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    securityUtils.disableAll()
  })
}

export default securityUtils
