import Dexie, { type Table } from 'dexie'

export interface NarrativeParticle {
  id: string
  coordinate: [number, number]
  radius: number
  staticData: {
    name: string
    category: 'red' | 'scenic' | 'food' | 'culture'
    deepSeekSummary: string
    openingHours?: string
    ticket?: string
    historicalStory?: string
  }
  dynamicWeight: {
    totalVisitors: number
    strongEmpathyCount: number
    avgCognitionScore: number
    recentEmotionTrend: number
    lastUpdated: number
  }
  narrativeFragments: string[]
  memoryNodes: MemoryNode[]
}

export interface MemoryNode {
  id: string
  visitorId: string
  visitorName: string
  timestamp: number
  emotionType: 'enlightenment' | 'confusion' | 'empathy' | 'reflection'
  memoryDNA: string
  textShadow?: string
  audioFragment?: string
  cognitiveInsight?: string
}

export interface SwarmerProfile {
  id: string
  name: string
  avatar: string
  cognitionProfile: CognitionProfile
  location: [number, number]
  heartRate?: number
  emotionState: 'enlightenment' | 'confusion' | 'neutral'
  isOnline: boolean
  lastHeartbeat: number
}

export interface CognitionProfile {
  history: number
  logic: number
  empathy: number
  attention: number
  theta: number
  level: string
}

export interface CausalNarrative {
  id: string
  location: string
  locationId: string
  historicalFact: string
  counterfactualQuestion: string
  alternativeBranches: HistoryBranch[]
  debateTopic: string
  isActive: boolean
}

export interface HistoryBranch {
  id: string
  condition: string
  consequenceChain: string[]
  probabilityEstimate: number
  aiArgument: string
}

export interface ResonanceEvent {
  id: string
  type: 'peer_teaching' | 'group_discussion' | 'conflict_arousal'
  trigger: {
    from: string
    fromName: string
    to: string
    toName: string
    topic: string
  }
  timestamp: number
  resolved: boolean
}

export interface MemoryDNA {
  id: string
  visitorId: string
  visitorName: string
  timestamp: number
  vector: number[]
  spatialFeature: [number, number]
  emotionFeature: {
    peakEmotion: string
    emotionIntensity: number
    empathyLevel: number
  }
  cognitionDelta: {
    historyChange: number
    logicChange: number
    empathyChange: number
    attentionChange: number
  }
  plantedAt?: [number, number]
  canBeAwakened: boolean
  awakenedCount: number
}

class YanJingDB extends Dexie {
  particles!: Table<NarrativeParticle>
  swarmers!: Table<SwarmerProfile>
  causalNarratives!: Table<CausalNarrative>
  resonanceEvents!: Table<ResonanceEvent>
  memoryDNAs!: Table<MemoryDNA>

  constructor() {
    super('YanJingDB')

    this.version(1).stores({
      particles: 'id, coordinate[0], coordinate[1], staticData.category',
      swarmers: 'id, emotionState, isOnline',
      causalNarratives: 'id, locationId, isActive',
      resonanceEvents: 'id, timestamp, type',
      memoryDNAs: 'id, visitorId, plantedAt[0], plantedAt[1], canBeAwakened'
    })
  }
}

export const db = new YanJingDB()

export class NarrativeParticleEngine {
  private currentLocation: [number, number] = [107.5035, 31.2159]
  private nearbyParticles: NarrativeParticle[] = []
  private listeners: Set<(particles: NarrativeParticle[]) => void> = new Set()

  constructor() {
    this.initDefaultParticles()
  }

  private async initDefaultParticles() {
    const count = await db.particles.count()
    if (count === 0) {
      await db.particles.bulkAdd(DEFAULT_PARTICLES)
    }
  }

  updateLocation(lng: number, lat: number) {
    this.currentLocation = [lng, lat]
    this.findNearbyParticles()
  }

  async findNearbyParticles(): Promise<NarrativeParticle[]> {
    const [lng, lat] = this.currentLocation
    const allParticles = await db.particles.toArray()

    this.nearbyParticles = allParticles.filter(p => {
      const distance = this.haversineDistance(
        lng, lat,
        p.coordinate[0], p.coordinate[1]
      )
      return distance <= p.radius + 5
    })

    this.notifyListeners()
    return this.nearbyParticles
  }

  private haversineDistance(lng1: number, lat1: number, lng2: number, lat2: number): number {
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

  subscribe(callback: (particles: NarrativeParticle[]) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.nearbyParticles))
  }

  async getParticleById(id: string): Promise<NarrativeParticle | undefined> {
    return db.particles.get(id)
  }

  async addMemoryNode(particleId: string, node: MemoryNode) {
    const particle = await db.particles.get(particleId)
    if (particle) {
      particle.memoryNodes.push(node)
      particle.dynamicWeight.totalVisitors++
      if (node.emotionType === 'enlightenment' || node.emotionType === 'empathy') {
        particle.dynamicWeight.strongEmpathyCount++
      }
      particle.dynamicWeight.lastUpdated = Date.now()
      await db.particles.put(particle)
      this.findNearbyParticles()
    }
  }

  async updateParticleEmotion(particleId: string, cognitionScore: number) {
    const particle = await db.particles.get(particleId)
    if (particle) {
      const oldAvg = particle.dynamicWeight.avgCognitionScore
      const oldCount = particle.dynamicWeight.totalVisitors
      particle.dynamicWeight.avgCognitionScore =
        (oldAvg * oldCount + cognitionScore) / (oldCount + 1)
      await db.particles.put(particle)
    }
  }

  getNearbyParticles(): NarrativeParticle[] {
    return this.nearbyParticles
  }
}

const DEFAULT_PARTICLES: NarrativeParticle[] = [
  {
    id: 'particle-lenian',
    coordinate: [107.5055, 31.2229],
    radius: 10,
    staticData: {
      name: '列宁街苏维埃旧址',
      category: 'red',
      deepSeekSummary: '列宁街是川东苏维埃政权的重要历史见证，1933年红军在此建立苏维埃政府，保留了大量革命标语和历史遗迹。',
      openingHours: '全天开放',
      ticket: '免费',
      historicalStory: '1934年，红四方面军在列宁街建立了达县苏维埃政府，这是川东地区第一个苏维埃政权，为后续的万源保卫战提供了重要的后勤保障。'
    },
    dynamicWeight: {
      totalVisitors: 0,
      strongEmpathyCount: 0,
      avgCognitionScore: 0,
      recentEmotionTrend: 0,
      lastUpdated: Date.now()
    },
    narrativeFragments: [
      '1933年的一个清晨，红军战士们在列宁街的墙面上写下了第一条革命标语...',
      '如果你站在列宁街的石板路上，闭上眼睛，仿佛能听到1934年那激动人心的口号声...',
      '一位老红军回忆，当年在这条街上，他第一次听到了"苏维埃"这个词，心中燃起了希望...'
    ],
    memoryNodes: []
  },
  {
    id: 'particle-hongjun',
    coordinate: [107.5085, 31.2129],
    radius: 15,
    staticData: {
      name: '红军纪念馆',
      category: 'red',
      deepSeekSummary: '纪念红四方面军在万源保卫战中的英勇事迹，馆内展示了大量珍贵革命文物和历史照片。',
      openingHours: '9:00-17:00',
      ticket: '凭身份证免费参观',
      historicalStory: '1934年5月至7月，中国工农红军第四方面军在四川省万源县进行了著名的万源保卫战，这是红军历史上最大规模的阵地防御战之一。'
    },
    dynamicWeight: {
      totalVisitors: 0,
      strongEmpathyCount: 0,
      avgCognitionScore: 0,
      recentEmotionTrend: 0,
      lastUpdated: Date.now()
    },
    narrativeFragments: [
      '站在纪念馆前，你是否能感受到1934年那场血与火的洗礼...',
      '每一件文物背后，都是一个鲜活的生命，一段不该被遗忘的历史...',
      '当年红军战士的平均年龄只有19岁，他们用青春和热血书写了共和国的序章...'
    ],
    memoryNodes: []
  },
  {
    id: 'particle-zhangaiping',
    coordinate: [107.5005, 31.2189],
    radius: 10,
    staticData: {
      name: '张爱萍故居',
      category: 'red',
      deepSeekSummary: '开国上将张爱萍的出生地，展示其革命生涯和卓越贡献。故居保持了清末民居风格，是重要的革命传统教育基地。',
      openingHours: '9:00-18:00',
      ticket: '免费',
      historicalStory: '张爱萍上将是中国人民解放军高级将领，参加过长征、抗日战争、解放战争和抗美援朝战争，为新中国的国防现代化建设做出了重要贡献。'
    },
    dynamicWeight: {
      totalVisitors: 0,
      strongEmpathyCount: 0,
      avgCognitionScore: 0,
      recentEmotionTrend: 0,
      lastUpdated: Date.now()
    },
    narrativeFragments: [
      '在这座古老的宅院里，走出了一位共和国的将军...',
      '张爱萍将军常说："为有牺牲多壮志，敢教日月换新天"...',
      '每一块砖瓦都见证了一个从乡村少年到开国将领的传奇人生...'
    ],
    memoryNodes: []
  },
  {
    id: 'particle-bayan',
    coordinate: [108.5185, 31.7189],
    radius: 50,
    staticData: {
      name: '巴山大峡谷',
      category: 'scenic',
      deepSeekSummary: '典型峡谷地貌，自然风光秀丽，红色文化深厚。是国家地质公园，也是重要的红色研学基地。',
      openingHours: '8:00-18:00',
      ticket: '门票+交通车110元',
      historicalStory: '这里是红军当年进行游击战的重要区域，峡谷的险峻地形为红军提供了天然的掩护。'
    },
    dynamicWeight: {
      totalVisitors: 0,
      strongEmpathyCount: 0,
      avgCognitionScore: 0,
      recentEmotionTrend: 0,
      lastUpdated: Date.now()
    },
    narrativeFragments: [
      '大自然的鬼斧神工与革命先辈的鲜血共同铸就了这片土地...',
      '站在峡谷之巅，你是否能感受到当年红军战士的豪迈气概...',
      '山水之间，红色文化的种子悄然生根发芽...'
    ],
    memoryNodes: []
  },
  {
    id: 'particle-fenghuang',
    coordinate: [107.4515, 31.2289],
    radius: 20,
    staticData: {
      name: '凤凰山红军战斗遗址',
      category: 'red',
      deepSeekSummary: '1934年红军在此与敌军展开激烈战斗，是万源保卫战的重要组成部分。山顶至今保留有战壕遗迹。',
      openingHours: '全天开放',
      ticket: '免费',
      historicalStory: '1934年6月，敌军向万源发动全面进攻，红军战士在凤凰山构筑工事，进行了顽强的防御战。'
    },
    dynamicWeight: {
      totalVisitors: 0,
      strongEmpathyCount: 0,
      avgCognitionScore: 0,
      recentEmotionTrend: 0,
      lastUpdated: Date.now()
    },
    narrativeFragments: [
      '凤凰山的战壕依然在诉说着那段峥嵘岁月...',
      '如果你俯身细看，或许还能发现当年子弹留下的痕迹...',
      '这座山见证了红军以少胜多的军事奇迹，也见证了革命先辈的英勇无畏...'
    ],
    memoryNodes: []
  }
]

export const narrativeEngine = new NarrativeParticleEngine()
