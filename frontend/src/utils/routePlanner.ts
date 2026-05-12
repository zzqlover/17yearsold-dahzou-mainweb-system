// routePlanner.ts - 约束规划算法（贪心 + 约束检查）
// 核心思路：基于多维度评分函数，在时间预算约束下选择最优景点序列

import type { POI } from './realPOIs'

export interface PlanningResult {
  selectedPOIs: POI[]          // 选中的景点序列
  totalScore: number           // 综合得分
  totalTime: number            // 总耗时（分钟）
  totalDistance: number        // 预估总距离（米）
  route: [number, number][]    // 路线坐标点（起点 + 途经点）
}

interface CognitionProfile {
  history: number    // 历史兴趣 (0-1)
  logic: number      // 逻辑思维 (0-1)
  empathy: number    // 共情能力 (0-1)
  attention: number  // 注意力水平 (0-1)
}

interface WeatherCondition {
  condition: string   // 'sunny' | 'cloudy' | 'rainy' | 'storm'
  temperature: number // 温度（摄氏度）
  comfort: number     // 舒适度指数 (0-1, 1最舒适)
}

/**
 * Haversine公式：计算两点间球面距离（米）
 */
function haversineDistance(lng1: number, lat1: number, lng2: number, lat2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 估算两点间移动时间（分钟）
 * 假设平均车速40km/h，城市道路考虑红绿灯等因素
 */
function estimateTravelTime(distanceMeters: number): number {
  const avgSpeedKmh = 40
  return (distanceMeters / 1000) / avgSpeedKmh * 60
}

/**
 * 计算单个景点的综合得分
 * 考虑因素：
 * 1. 与用户认知画像的匹配度（加权点积）
 * 2. 天气适应性惩罚
 * 3. 教育价值权重
 */
function calculatePOIScore(poi: POI, profile: CognitionProfile, weather: WeatherCondition): number {
  let score = 0

  score += poi.eduTags.history * profile.history * 0.3
  score += poi.eduTags.logic * profile.logic * 0.25
  score += poi.eduTags.empathy * profile.empathy * 0.25
  score += poi.eduTags.attention * profile.attention * 0.2

  if (poi.weatherSensitive && weather.condition === 'rainy') {
    score *= 0.5
  }
  if (poi.weatherSensitive && weather.condition === 'storm') {
    score *= 0.2
  }

  if (weather.comfort < 0.4 && poi.type === 'nature') {
    score *= 0.7
  }

  return score
}

/**
 * 主规划函数：贪心选择 + 时间预算约束
 *
 * @param pois - 可选景点列表
 * @param profile - 用户认知画像
 * @param weather - 当前天气条件
 * @param timeBudget - 时间预算（分钟），默认360分钟（6小时）
 * @param startPoint - 出发点坐标，默认达州市中心
 * @returns 规划结果对象
 */
export function runPlanner(
  pois: POI[],
  profile: CognitionProfile,
  weather: WeatherCondition,
  timeBudget: number = 360,
  startPoint: [number, number] = [107.5035, 31.2159]
): PlanningResult {
  const available = [...pois].map(poi => ({
    ...poi,
    score: calculatePOIScore(poi, profile, weather)
  })).sort((a, b) => b.score - a.score)

  const selected: POI[] = []
  let remainingTime = timeBudget
  let totalScore = 0
  let totalDistance = 0
  let currentPos: [number, number] = [...startPoint]

  for (const poi of available) {
    const distance = haversineDistance(currentPos[0], currentPos[1], poi.lng, poi.lat)
    const travelTime = estimateTravelTime(distance)
    const totalTimeForThisPOI = poi.timeCost + travelTime

    if (totalTimeForThisPOI <= remainingTime) {
      if (selected.length > 0) {
        totalDistance += distance
        totalScore += distance * 0.001
      }

      totalScore += poi.score * 100
      remainingTime -= totalTimeForThisPOI
      selected.push(poi)
      currentPos = [poi.lng, poi.lat]

      if (selected.length >= 4) break
    }
  }

  const route: [number, number][] = [startPoint, ...selected.map(p => [p.lng, p.lat] as [number, number])]

  return {
    selectedPOIs: selected,
    totalScore: Math.round(totalScore),
    totalTime: timeBudget - remainingTime,
    totalDistance: Math.round(totalDistance),
    route
  }
}
