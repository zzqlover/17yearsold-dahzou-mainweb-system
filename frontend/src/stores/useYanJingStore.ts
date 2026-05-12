// useYanJingStore.ts - Pinia 全局状态管理
// 管理研景系统的所有核心状态

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dazhouPOIs, type POI } from '../utils/realPOIs'
import { runPlanner, type PlanningResult } from '../utils/routePlanner'
import type { CognitionProfile, JointTask } from '../utils/mockAi'

export interface MemoryParticle {
  id: string
  lng: number
  lat: number
  content: string
  author: string
  timestamp: number
  awakenedCount: number
}

export interface WeatherState {
  condition: string
  temperature: number
  comfort: number
  icon?: string
  location?: string
  aqi?: number
  pm25?: number
}

export const useYanJingStore = defineStore('yanjing', () => {
  const pois = ref<POI[]>(dazhouPOIs)
  const planningResult = ref<PlanningResult | null>(null)
  const isPlanning = ref(false)

  const profileA = ref<CognitionProfile>({
    id: 'student-A',
    name: '学生A',
    history: 0.75,
    logic: 0.6,
    empathy: 0.8,
    attention: 0.65,
    location: [107.5035, 31.2159]
  })

  const profileB = ref<CognitionProfile>({
    id: 'student-B',
    name: '学生B',
    history: 0.65,
    logic: 0.85,
    empathy: 0.7,
    attention: 0.75,
    location: [107.5055, 31.2179]
  })

  const weather = ref<WeatherState>({
    condition: '晴朗',
    temperature: 26,
    comfort: 0.85,
    icon: 'sunny',
    location: '四川·达州',
    aqi: 45,
    pm25: 28
  })

  const memoryParticles = ref<MemoryParticle[]>([
    {
      id: 'mem-001',
      lng: 106.922,
      lat: 31.282,
      content: '在这里，我突然明白了什么是信仰。那些标语不是文字，是无数先辈用生命写下的誓言。',
      author: '匿名学长 · 2024年秋',
      timestamp: Date.now() - 86400000 * 30,
      awakenedCount: 12
    },
    {
      id: 'mem-002',
      lng: 108.032,
      lat: 32.062,
      content: '站在陈列馆里，我仿佛听到了1934年的炮火声。历史从未远去，它一直在等待被理解。',
      author: '研学小组 · 2024年夏',
      timestamp: Date.now() - 86400000 * 60,
      awakenedCount: 28
    },
    {
      id: 'mem-003',
      lng: 107.502,
      lat: 31.222,
      content: '凤凰山顶的风，吹过战壕，也吹过我的心。原来和平如此珍贵。',
      author: '张同学 · 2024年春',
      timestamp: Date.now() - 86400000 * 90,
      awakenedCount: 19
    },
    {
      id: 'mem-004',
      lng: 107.552,
      lat: 31.282,
      content: '将军故居的一砖一瓦，都在诉说着一个关于选择的故事。19岁那年，他选择了什么？',
      author: '李老师 · 2023年冬',
      timestamp: Date.now() - 86400000 * 180,
      awakenedCount: 45
    }
  ])

  const currentStationIndex = ref(0)
  const currentJointTask = ref<JointTask | null>(null)

  const selectedPOIIds = ref<string[]>([])

  const totalStations = computed(() => planningResult.value?.selectedPOIs.length || 0)
  const currentPOI = computed(() => {
    if (!planningResult.value) return null
    return planningResult.value.selectedPOIs[currentStationIndex.value] || null
  })
  const progressPercent = computed(() => {
    if (totalStations.value === 0) return 0
    return ((currentStationIndex.value + 1) / totalStations.value) * 100
  })
  const safetyScore = computed(() => {
    if (!planningResult.value) return 0.95
    return Math.max(0.7, 1 - (planningResult.value.totalTime / 480))
  })
  const cognitionMatch = computed(() => {
    if (!planningResult.value) return 0.8
    const avgHistory = (profileA.value.history + profileB.value.history) / 2
    return avgHistory * 0.9 + Math.random() * 0.1
  })

  async function planRoute(timeBudget: number = 360): Promise<void> {
    isPlanning.value = true

    await new Promise(resolve => setTimeout(resolve, 800))

    const result = runPlanner(
      pois.value.filter(p => !selectedPOIIds.value.includes(p.id)),
      profileA.value,
      weather.value,
      timeBudget
    )

    planningResult.value = result
    currentStationIndex.value = 0
    isPlanning.value = false
  }

  function closeStation(poiId: string): void {
    selectedPOIIds.value.push(poiId)

    if (planningResult.value) {
      const idx = planningResult.value.selectedPOIs.findIndex(p => p.id === poiId)
      if (idx !== -1 && idx <= currentStationIndex.value) {
        currentStationIndex.value = Math.max(0, currentStationIndex.value - 1)
      }
    }

    planRoute()
  }

  function nextStation(): void {
    if (currentStationIndex.value < totalStations.value - 1) {
      currentStationIndex.value++
    }
  }

  function prevStation(): void {
    if (currentStationIndex.value > 0) {
      currentStationIndex.value--
    }
  }

  function updateLocation(studentId: 'A' | 'B', lng: number, lat: number): void {
    if (studentId === 'A') {
      profileA.value.location = [lng, lat]
    } else {
      profileB.value.location = [lng, lat]
    }
  }

  function setJointTask(task: JointTask): void {
    currentJointTask.value = task
  }

  function clearJointTask(): void {
    currentJointTask.value = null
  }

  function awakenMemory(id: string): void {
    const particle = memoryParticles.value.find(m => m.id === id)
    if (particle) {
      particle.awakenedCount++
    }
  }

  return {
    pois,
    planningResult,
    isPlanning,
    profileA,
    profileB,
    weather,
    memoryParticles,
    currentStationIndex,
    currentJointTask,
    selectedPOIIds,
    totalStations,
    currentPOI,
    progressPercent,
    safetyScore,
    cognitionMatch,
    planRoute,
    closeStation,
    nextStation,
    prevStation,
    updateLocation,
    setJointTask,
    clearJointTask,
    awakenMemory
  }
})
