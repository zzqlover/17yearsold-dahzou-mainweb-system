// 研景系统 - 全局状态管理 (Pinia Store)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { runPlanner, type POI, type RouteResult } from '../utils/planner'
export { type POI } from '../utils/planner'
import {
  evaluateCognitiveAnswer,
  evaluateTaskAnswer,
  generateTaskQuestion,
  generateWelcomeMessage,
  generateClosureMessage,
  generateEncouragement,
  generateRouteDescription,
  type CognitionScore
} from '../utils/mockAi'

// ============ 类型定义 ============
export interface UserLocation {
  lng: number
  lat: number
  accuracy?: number
  heading?: number
}

export interface Weather {
  temp: number
  icon: 'sunny' | 'cloudy' | 'rain' | 'fog'
  comfort: number
  condition: string
  location?: string
  aqi?: number
  pm25?: number
  pm10?: number
  warnings?: string[]
}

export interface Cognition {
  history: number
  logic: number
  empathy: number
  attention: number
  theta: number
  level: string
  diagnosed: boolean
}

export interface CurrentRoute {
  waypoints: [number, number][]
  stationOrder: POI[]
  totalTime: number
  totalScore: number
  estimatedDistance: number
}

export interface TutorMessage {
  id: number
  text: string
  type: 'tutor' | 'system' | 'warning'
  timestamp: number
}

// ============ Store 定义 ============
export const useYanJingStore = defineStore('yanjing', () => {
  // ============ 核心状态 ============
  const userLocation = ref<UserLocation | null>(null)
  const fenceCenter = ref<[number, number]>([107.5035, 31.2159])
  const fenceRadius = ref(500) // 米
  const isLocating = ref(false)
  const locationError = ref<string | null>(null)

  // 天气状态
  const weather = ref<Weather>({
    temp: 22,
    icon: 'sunny',
    comfort: 75,
    condition: '晴',
    location: '四川·达州',
    aqi: 45,
    pm25: 28,
    pm10: 52,
    warnings: []
  })

  // 认知画像
  const cognition = ref<Cognition>({
    history: 0.5,
    logic: 0.5,
    empathy: 0.5,
    attention: 0.5,
    theta: 0,
    level: '待诊断',
    diagnosed: false
  })

  // 研学POI列表（达州真实地点 - 更准确的经纬度）
  const pois = ref<POI[]>([
    {
      id: 'poi-1',
      name: '张爱萍故居',
      image: '/images/History/张爱萍故居.jpeg',
      lng: 107.5005,
      lat: 31.2189,
      type: 'red',
      timeCost: 45,
      weatherSensitive: false,
      eduTags: { history: 0.9, logic: 0.6, empathy: 0.7, attention: 0.5 },
      description: '开国上将张爱萍的出生地，展示其革命生涯和贡献'
    },
    {
      id: 'poi-2',
      name: '红军纪念馆',
      image: '/images/History/红军纪念馆.jpeg',
      lng: 107.5085,
      lat: 31.2129,
      type: 'red',
      timeCost: 60,
      weatherSensitive: false,
      eduTags: { history: 0.95, logic: 0.7, empathy: 0.8, attention: 0.6 },
      description: '纪念红四方面军在万源保卫战中的英勇事迹'
    },
    {
      id: 'poi-3',
      name: '凤凰山红军战斗遗址',
      image: '/images/History/万源保卫战.jpeg',
      lng: 107.4515,
      lat: 31.2289,
      type: 'red',
      timeCost: 50,
      weatherSensitive: true,
      eduTags: { history: 0.85, logic: 0.8, empathy: 0.6, attention: 0.7 },
      description: '1934年红军在此与敌军展开激烈战斗'
    },
    {
      id: 'poi-4',
      name: '巴山大峡谷',
      image: '/images/spots/巴山大峡谷.jpeg',
      lng: 108.5185,
      lat: 31.7189,
      type: 'nature',
      timeCost: 120,
      weatherSensitive: true,
      eduTags: { history: 0.4, logic: 0.5, empathy: 0.3, attention: 0.9 },
      description: '典型峡谷地貌，自然风光秀丽，红色文化深厚'
    },
    {
      id: 'poi-5',
      name: '列宁街苏维埃旧址',
      image: '/images/History/列宁街.jpeg',
      lng: 107.5055,
      lat: 31.2229,
      type: 'red',
      timeCost: 40,
      weatherSensitive: false,
      eduTags: { history: 0.92, logic: 0.75, empathy: 0.85, attention: 0.6 },
      description: '保存完好的列宁街，展现川东苏维埃政权历史'
    },
    {
      id: 'poi-6',
      name: '达州博物馆',
      image: '/images/spots/真佛山.jpeg',
      lng: 107.4678,
      lat: 31.2098,
      type: 'culture',
      timeCost: 55,
      weatherSensitive: false,
      eduTags: { history: 0.8, logic: 0.65, empathy: 0.7, attention: 0.75 },
      description: '展示达州历史文化变迁的重要场所'
    }
  ])

  // 当前规划路线
  const currentRoute = ref<CurrentRoute>({
    waypoints: [],
    stationOrder: [],
    totalTime: 0,
    totalScore: 0,
    estimatedDistance: 0
  })

  // UI状态
  const showCognitionModal = ref(false)
  const showFenceAlert = ref(false)
  const showRouteDrawer = ref(false)
  const isPlanning = ref(false)
  const currentStationIndex = ref(0)
  const timeBudget = ref(360) // 6小时
  const selectedDestinationPOI = ref<POI | null>(null) // 用户选择的景点
  const planningMessageShown = ref(false) // 是否已显示规划消息

  // 导师消息队列
  const tutorMessages = ref<TutorMessage[]>([])
  let messageId = 0

  // ============ Getters ============
  const isOutOfFence = computed(() => {
    if (!userLocation.value) return false
    const dx = userLocation.value.lng - fenceCenter.value[0]
    const dy = userLocation.value.lat - fenceCenter.value[1]
    // 简化计算：1度 ≈ 111000米
    const distance = Math.sqrt(dx * dx + dy * dy) * 111000
    return distance > fenceRadius.value
  })

  const distanceToFence = computed(() => {
    if (!userLocation.value) return 0
    const dx = userLocation.value.lng - fenceCenter.value[0]
    const dy = userLocation.value.lat - fenceCenter.value[1]
    return Math.sqrt(dx * dx + dy * dy) * 111000
  })

  const cognitiveMatch = computed(() => {
    if (!cognition.value.diagnosed) return 0
    // theta范围 [-1, 1]，转换为 [0, 100]
    return Math.round((cognition.value.theta + 1) * 50)
  })

  const safetyScore = computed(() => {
    if (isOutOfFence.value) return 40
    return 95
  })

  const remainingTime = computed(() => {
    return Math.max(0, timeBudget.value - currentRoute.value.totalTime)
  })

  const currentStation = computed(() => {
    return currentRoute.value.stationOrder[currentStationIndex.value] || null
  })

  // ============ Actions ============

  // 更新用户位置
  function updateLocation(pos: UserLocation) {
    userLocation.value = pos
    locationError.value = null

    // 检查围栏状态
    if (isOutOfFence.value) {
      showFenceAlert.value = true
      pushTutorMessage('⚠️ 警告！你已离开研学安全区域，请立即返回！', 'warning')
    }
  }

  // 获取天气数据
  async function fetchWeather() {
    try {
      const res = await fetch('/api/v1/weather?city=达州')
      const data = await res.json()
      if (data.weather) {
        weather.value = {
          temp: data.weather.temp,
          icon: getWeatherIcon(data.weather.status),
          comfort: calculateComfort(data.weather),
          condition: data.weather.status,
          location: data.weather.location || '四川·达州',
          aqi: data.weather.aqi || 50,
          pm25: data.weather.pm25,
          pm10: data.weather.pm10,
          warnings: data.weather.warnings || []
        }
      }
    } catch {
      // 模拟天气
      const conditions = [
        { icon: 'sunny', condition: '晴', temp: 22 + Math.floor(Math.random() * 8) },
        { icon: 'cloudy', condition: '多云', temp: 18 + Math.floor(Math.random() * 5) },
        { icon: 'rain', condition: '小雨', temp: 15 + Math.floor(Math.random() * 5) },
        { icon: 'fog', condition: '雾', temp: 12 + Math.floor(Math.random() * 5) }
      ]
      const c = conditions[Math.floor(Math.random() * conditions.length)]
      const aqiValue = 30 + Math.floor(Math.random() * 50)
      weather.value = {
        temp: c.temp,
        icon: c.icon as Weather['icon'],
        comfort: c.icon === 'rain' ? 55 : c.icon === 'fog' ? 60 : 75 + Math.floor(Math.random() * 15),
        condition: c.condition,
        location: '四川·达州',
        aqi: aqiValue,
        pm25: 15 + Math.floor(Math.random() * 30),
        pm10: 30 + Math.floor(Math.random() * 40),
        warnings: aqiValue > 100 ? ['空气质量较差，建议佩戴口罩'] : []
      }
    }
  }

  function getWeatherIcon(status: string): Weather['icon'] {
    if (status.includes('雨')) return 'rain'
    if (status.includes('雾') || status.includes('霾')) return 'fog'
    if (status.includes('多云')) return 'cloudy'
    return 'sunny'
  }

  function calculateComfort(w: any): number {
    let score = 80
    if (w.temp < 10 || w.temp > 30) score -= 15
    if (w.windSpeed > 10) score -= 10
    return Math.max(30, Math.min(100, score))
  }

  // 语音播报功能
  let speechSynthesis: SpeechSynthesis | null = null

  function speakReport(text: string) {
    if (!speechSynthesis) {
      speechSynthesis = window.speechSynthesis
    }
    if (speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      speechSynthesis.speak(utterance)
    }
  }

  function speakWeatherReport() {
    const w = weather.value

    const temp = Math.round(w.temp)  // 温度取整

    const report = `${w.location || '达州'}，${w.condition}，${temp}度。`

    speakReport(report)
  }

  // 运行路线规划
  async function planRoute(destinationPOI?: POI | null): Promise<RouteResult | null> {
    isPlanning.value = true
    planningMessageShown.value = false

    if (destinationPOI) {
      selectedDestinationPOI.value = destinationPOI
    }

    try {
      pushTutorMessage('🧭 正在为您进行模型优质线路规划，请稍候...', 'system')

      // 确保动画至少显示1.5秒
      await new Promise(resolve => setTimeout(resolve, 1500))

      const result = runPlanner(
        pois.value,
        cognition.value,
        weather.value.comfort,
        timeBudget.value,
        fenceCenter.value
      )

      const startPoint = userLocation.value
        ? [userLocation.value.lng, userLocation.value.lat] as [number, number]
        : fenceCenter.value

      currentRoute.value = {
        waypoints: [startPoint, ...result.waypoints],
        stationOrder: result.stationOrder,
        totalTime: result.totalTime,
        totalScore: result.totalScore,
        estimatedDistance: result.estimatedDistance
      }

      currentStationIndex.value = 0

      if (result.stationOrder.length > 0) {
        const desc = generateRouteDescription(
          result.stationOrder.map(p => p.name),
          result.totalTime,
          result.totalScore
        )
        pushTutorMessage(desc, 'tutor')
      }

      // 播报天气和研学信息
      setTimeout(() => {
        speakWeatherReport()
      }, 1000)

      return result
    } catch (e) {
      console.error('规划失败:', e)
      pushTutorMessage('❌ 线路规划失败，请稍后重试', 'warning')
      return null
    } finally {
      isPlanning.value = false
    }
  }

  // 关闭站点
  async function closePoi(poiId: string) {
    const poi = pois.value.find(p => p.id === poiId)
    if (!poi) return

    // 标记为关闭
    poi.isClosed = true

    // 重新规划
    const result = await planRoute()

    if (poi && result) {
      const msg = generateClosureMessage(
        poi.name,
        result.stationOrder.length > 0 ? result.stationOrder[0].name : undefined
      )
      pushTutorMessage(msg, 'system')
    }
  }

  // 关闭站点（别名，用于UI调用）
  async function closeStation(poiId: string) {
    await closePoi(poiId)
  }

  // 重置站点（恢复）
  function resetPoi(poiId: string) {
    const poi = pois.value.find(p => p.id === poiId)
    if (poi) {
      poi.isClosed = false
    }
  }

  // 设置目的地POI
  function setSelectedDestination(poi: POI | null) {
    selectedDestinationPOI.value = poi
  }

  // 提交认知诊断答案
  async function submitCognitiveAnswer(questionIndex: number, answer: string): Promise<CognitionScore | null> {
    try {
      const result = await evaluateCognitiveAnswer(questionIndex, answer)
      return result
    } catch (e) {
      console.error('评分失败:', e)
      return null
    }
  }

  // 完成认知诊断
  function completeCognition(scores: CognitionScore[]) {
    if (scores.length < 4) return

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

    cognition.value = {
      history: avg(scores.map(s => s.history)),
      logic: avg(scores.map(s => s.logic)),
      empathy: avg(scores.map(s => s.empathy)),
      attention: avg(scores.map(s => s.attention)),
      theta: 0,
      level: '',
      diagnosed: true
    }

    // 计算theta
    cognition.value.theta =
      (cognition.value.history * 0.3 +
        cognition.value.logic * 0.3 +
        cognition.value.empathy * 0.2 +
        cognition.value.attention * 0.2 - 0.5) * 2

    // 确定等级
    if (cognition.value.theta > 0.5) {
      cognition.value.level = '优秀'
    } else if (cognition.value.theta > 0) {
      cognition.value.level = '良好'
    } else if (cognition.value.theta > -0.5) {
      cognition.value.level = '一般'
    } else {
      cognition.value.level = '需加强'
    }

    showCognitionModal.value = false

    const encouragement = generateEncouragement(cognition.value.theta)
    pushTutorMessage(`你好！我已了解你的特质。你的认知等级为"${cognition.value.level}"。${encouragement}`, 'tutor')

    // 自动规划路线
    setTimeout(() => {
      planRoute()
    }, 1500)
  }

  // 评估任务回答
  async function evaluateAnswer(poiId: string, answer: string): Promise<CognitionScore | null> {
    const poi = pois.value.find(p => p.id === poiId)
    if (!poi) return null

    try {
      const result = await evaluateTaskAnswer(poi, answer)

      // 更新认知画像（指数移动平均）
      const alpha = 0.2
      cognition.value.history = cognition.value.history * (1 - alpha) + result.history * alpha
      cognition.value.logic = cognition.value.logic * (1 - alpha) + result.logic * alpha
      cognition.value.empathy = cognition.value.empathy * (1 - alpha) + result.empathy * alpha
      cognition.value.attention = cognition.value.attention * (1 - alpha) + result.attention * alpha

      // 重新计算theta
      cognition.value.theta =
        (cognition.value.history * 0.3 +
          cognition.value.logic * 0.3 +
          cognition.value.empathy * 0.2 +
          cognition.value.attention * 0.2 - 0.5) * 2

      pushTutorMessage(result.comment, 'tutor')

      return result
    } catch (e) {
      console.error('评估失败:', e)
      return null
    }
  }

  // 获取任务问题
  function getTaskQuestion(poiId: string): string {
    const poi = pois.value.find(p => p.id === poiId)
    if (!poi) return '请完成这个任务'
    return generateTaskQuestion(poi)
  }

  // 推送导师消息
  function pushTutorMessage(text: string, type: TutorMessage['type'] = 'tutor') {
    const msg: TutorMessage = {
      id: ++messageId,
      text,
      type,
      timestamp: Date.now()
    }
    tutorMessages.value.push(msg)

    // 保持最多20条消息
    if (tutorMessages.value.length > 20) {
      tutorMessages.value.shift()
    }
  }

  // 清除消息
  function clearMessages() {
    tutorMessages.value = []
  }

  // 返回围栏中心
  function returnToSafety() {
    userLocation.value = {
      lng: fenceCenter.value[0],
      lat: fenceCenter.value[1]
    }
    showFenceAlert.value = false
    pushTutorMessage('已安全返回研学区域，继续你的研学之旅吧！', 'system')
  }

  // 初始化
  function init() {
    // 跳过认知诊断，直接初始化
    cognition.value = {
      history: 0.6,
      logic: 0.65,
      empathy: 0.7,
      attention: 0.6,
      theta: 0.2,
      level: '良好',
      diagnosed: true
    }

    // 获取天气
    fetchWeather()
    setInterval(fetchWeather, 30000)

    // 初始化定位
    userLocation.value = {
      lng: fenceCenter.value[0],
      lat: fenceCenter.value[1]
    }

    // 欢迎消息
    pushTutorMessage('欢迎来到研景！点击任意景点可查看详情并规划路线。', 'tutor')
  }

  return {
    // 状态
    userLocation,
    fenceCenter,
    fenceRadius,
    isLocating,
    locationError,
    weather,
    cognition,
    pois,
    currentRoute,
    showCognitionModal,
    showFenceAlert,
    showRouteDrawer,
    isPlanning,
    currentStationIndex,
    timeBudget,
    selectedDestinationPOI,
    tutorMessages,
    // Getters
    isOutOfFence,
    distanceToFence,
    cognitiveMatch,
    safetyScore,
    remainingTime,
    currentStation,
    // Actions
    updateLocation,
    fetchWeather,
    planRoute,
    closePoi,
    resetPoi,
    submitCognitiveAnswer,
    completeCognition,
    evaluateAnswer,
    getTaskQuestion,
    pushTutorMessage,
    clearMessages,
    returnToSafety,
    init,
    setSelectedDestination,
    speakWeatherReport
  }
})

export default useYanJingStore
