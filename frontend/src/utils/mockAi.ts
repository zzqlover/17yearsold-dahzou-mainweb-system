// mockAi.ts - 模拟 DeepSeek AI 与认知共振逻辑
// 预留真实API接口位置，注释说明如何替换

import type { POI } from './realPOIs'

export interface CognitionProfile {
  id: string
  name: string
  history: number
  logic: number
  empathy: number
  attention: number
  location?: [number, number]
}

export interface JointTask {
  id: string
  poiId: string
  poiName: string
  description: string
  forStudentA: string
  forStudentB: string
  discussionTopic: string
  timestamp: number
}

export interface AIMessage {
  role: 'system' | 'assistant' | 'user'
  content: string
  timestamp: number
}

const DEEPSEEK_API_URL = '/api/v1/chat'
const DEEPSEEK_API_KEY = ''

export async function callDeepSeek(
  messages: AIMessage[],
  systemPrompt: string = ''
): Promise<string> {
  try {
    const userMessage = messages.length > 0 ? messages[messages.length - 1].content : ''
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.response || data.message || '抱歉，暂时无法回答，请稍后再试。'
  } catch (error) {
    console.warn('[mockAi] API调用失败:', error)
    return '抱歉，暂时无法回答，请稍后再试。'
  }
}

function generateFallbackResponse(userMessage?: string): string {
  const responses = [
    `关于"${userMessage?.slice(0, 20) || ''}"这个问题，从达州红色文化的角度来看，我们可以这样理解：`,
    `这是一个很好的问题。在研景系统中，我们鼓励学生通过实地体验来获得答案。`,
    `根据你的当前位置和认知画像，我建议你先观察周围的环境，然后思考历史与现实的联系。`,
    `红色研学不仅是知识的获取，更是情感的共鸣。让我们一起来探索这段历史的深层含义吧。`
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

export function generateJointTask(
  poi: POI,
  profileA: CognitionProfile,
  profileB: CognitionProfile
): JointTask {
  const tasks: Record<string, () => JointTask> = {
    red: () => ({
      id: `joint-${Date.now()}`,
      poiId: poi.id,
      poiName: poi.name,
      description: `${profileA.name}与${profileB.name}在${poi.name}触发认知共振`,
      forStudentA: `请向${profileB.name}描述你眼前这幅标语的内容，注意观察每一个细节。`,
      forStudentB: `请闭上眼睛，根据${profileA.name}的描述，在脑海中构建画面，然后说出你的感受。`,
      discussionTopic: `两人交换心得：为什么同样的场景会给你们带来不同的感受？`,
      timestamp: Date.now()
    }),
    nature: () => ({
      id: `joint-${Date.now()}`,
      poiId: poi.id,
      poiName: poi.name,
      description: `${profileA.name}与${profileB.name}在${poi.name}触发自然共鸣`,
      forStudentA: `请选择一个角度拍摄这里的风景，并解释你为什么选择这个视角。`,
      forStudentB: `请用三个词形容眼前的景色，然后与${profileA.name}的照片进行对比讨论。`,
      discussionTopic: `自然景观如何影响人的情绪？结合今天的体验谈谈你们的理解。`,
      timestamp: Date.now()
    }),
    culture: () => ({
      id: `joint-${Date.now()}`,
      poiId: poi.id,
      poiName: poi.name,
      description: `${profileA.name}与${profileB.name}在${poi.name}触发文化共鸣`,
      forStudentA: `挑选一件你最感兴趣的展品，思考如果它是你的收藏品，你会如何介绍它？`,
      forStudentB: `倾听${profileA.name}的介绍，然后提出一个你一直想知道但没机会问的问题。`,
      discussionTopic: `文物背后的故事往往比文物本身更有价值。你们发现了什么？`,
      timestamp: Date.now()
    })
  }

  return (tasks[poi.type] || tasks.red)()
}

export function checkResonance(
  profileA: CognitionProfile,
  profileB: CognitionProfile,
  pois: POI[],
  thresholdMeters: number = 50
): { isResonating: boolean; targetPOI?: POI } | null {
  if (!profileA.location || !profileB.location) return null

  for (const poi of pois) {
    const distA = haversineDistance(profileA.location[0], profileA.location[1], poi.lng, poi.lat)
    const distB = haversineDistance(profileB.location[0], profileB.location[1], poi.lng, poi.lat)

    if (distA < thresholdMeters && distB < thresholdMeters) {
      return { isResonating: true, targetPOI: poi }
    }
  }

  return { isResonating: false }
}

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
