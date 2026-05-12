// 研景系统 - 智能路径规划算法
// 基于贪心+动态规划的多约束路线规划算法

export interface POI {
  id: string
  name: string
  image?: string
  lng: number
  lat: number
  type: string
  timeCost: number // 分钟
  weatherSensitive: boolean
  eduTags: {
    history: number
    logic: number
    empathy: number
    attention: number
  }
  isClosed?: boolean
}

export interface Cognition {
  history: number
  logic: number
  empathy: number
  attention: number
}

export interface RouteResult {
  waypoints: [number, number][] // 路线坐标点
  stationOrder: POI[] // 排序后的站点列表
  totalTime: number // 总耗时（分钟）
  totalScore: number // 总教育收益
  estimatedDistance: number // 预估距离（米）
}

// 计算两点间直线距离（米）
function haversineDistance(p1: [number, number], p2: [number, number]): number {
  const R = 6371000 // 地球半径（米）
  const dLat = ((p2[1] - p1[1]) * Math.PI) / 180
  const dLng = ((p2[0] - p1[0]) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[1] * Math.PI) / 180) *
      Math.cos((p2[1] * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 估算移动时间（分钟）
// 基于距离按 50km/h 车速 + 10min 缓冲计算
function estimateTravelTime(distanceMeters: number): number {
  const speedKmH = 50
  const baseMinutes = (distanceMeters / 1000 / speedKmH) * 60
  return Math.ceil(baseMinutes + 10) // 加上10分钟缓冲
}

// 计算单个站点的教育收益分数
function calculateEduScore(poi: POI, cognition: Cognition): number {
  // 认知标签与POI教育标签的点积
  const tagScore =
    poi.eduTags.history * cognition.history +
    poi.eduTags.logic * cognition.logic +
    poi.eduTags.empathy * cognition.empathy +
    poi.eduTags.attention * cognition.attention

  // 类型匹配奖励（根据认知特点匹配）
  let typeBonus = 0
  if (cognition.history > 0.7 && poi.type === 'red') {
    typeBonus += 0.15 // 历史强者偏好红色景点
  }
  if (cognition.empathy > 0.7 && poi.type === 'culture') {
    typeBonus += 0.1 // 共情强者偏好文化景点
  }
  if (cognition.attention > 0.7 && poi.type === 'nature') {
    typeBonus += 0.1 // 注意力强者偏好自然景点
  }

  return tagScore + typeBonus
}

// 核心规划算法 - 贪心+约束检查
export function runPlanner(
  pois: POI[],
  cognition: Cognition,
  weatherComfort: number,
  timeBudget: number = 360,
  startPoint: [number, number] = [107.5035, 31.2159]
): RouteResult {
  // ========== 第一步：过滤 ==========
  let availablePOIs = pois.filter(poi => !poi.isClosed)

  // 天气敏感过滤
  if (weatherComfort < 50) {
    availablePOIs = availablePOIs.filter(poi => !poi.weatherSensitive)
  }

  if (availablePOIs.length === 0) {
    return { waypoints: [], stationOrder: [], totalTime: 0, totalScore: 0, estimatedDistance: 0 }
  }

  // ========== 第二步：计算教育收益 ==========
  const scoredPOIs = availablePOIs.map(poi => ({
    ...poi,
    eduScore:
      poi.eduTags.history * cognition.history * 0.3 +
      poi.eduTags.logic * cognition.logic * 0.3 +
      poi.eduTags.empathy * cognition.empathy * 0.2 +
      poi.eduTags.attention * cognition.attention * 0.2
  }))

  // ========== 第三步：贪心选择 ==========
  const selected: POI[] = []
  let remainingTime = timeBudget
  let currentPos = startPoint
  let totalScore = 0
  let totalTime = 0
  let totalDist = 0

  const sorted = [...scoredPOIs].sort((a, b) => b.eduScore - a.eduScore)

  for (const poi of sorted) {
    const dist = haversineDistance(currentPos, [poi.lng, poi.lat])
    const travelTime = estimateTravelTime(dist)
    const totalPoiTime = poi.timeCost + travelTime

    if (totalPoiTime <= remainingTime) {
      if (selected.length > 0) {
        totalDist += dist
        totalTime += travelTime
      }
      totalTime += poi.timeCost
      totalScore += poi.eduScore
      remainingTime -= totalPoiTime
      selected.push(poi)
      currentPos = [poi.lng, poi.lat]
    }
  }

  return {
    waypoints: selected.map(p => [p.lng, p.lat] as [number, number]),
    stationOrder: selected,
    totalTime,
    totalScore: selected.length > 0 ? totalScore / selected.length : 0,
    estimatedDistance: totalDist
  }
}

// 快速重规划（当某个站点关闭时）
export function quickReplan(
  currentRoute: POI[],
  closedPoiId: string,
  pois: POI[],
  cognition: Cognition,
  weatherComfort: number,
  timeBudget: number
): RouteResult {
  // 过滤掉关闭的站点
  const closedIdx = currentRoute.findIndex(p => p.id === closedPoiId)
  let newStartPoint = [107.5035, 31.2159]

  // 确定新的起点
  if (closedIdx > 0) {
    newStartPoint = [currentRoute[closedIdx - 1].lng, currentRoute[closedIdx - 1].lat]
  }

  // 过滤后的POI列表
  const filteredPOIs = pois.filter(p => !p.isClosed && p.id !== closedPoiId)

  // 重新规划
  return runPlanner(filteredPOIs, cognition, weatherComfort, timeBudget, newStartPoint)
}

// 计算路线总距离
export function calculateTotalDistance(waypoints: [number, number][]): number {
  let total = 0
  for (let i = 0; i < waypoints.length - 1; i++) {
    total += haversineDistance(waypoints[i], waypoints[i + 1])
  }
  return total
}

// 格式化时间显示
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}

// 格式化距离显示
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}米`
  }
  return `${(meters / 1000).toFixed(1)}公里`
}