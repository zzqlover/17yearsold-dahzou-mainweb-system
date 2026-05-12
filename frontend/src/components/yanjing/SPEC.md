# 研景系统 - 城市尺度人机共生学习系统

## 一、系统愿景

**核心定位**：构建一套城市尺度的分布式学习基础设施，让红色文化通过技术实现跨越时空的传承。

**创新高度**：
- 全球首个"因果推断式叙事引擎"用于历史教育
- 首创"去中心化自适应学习"架构（无AI也能运行基础版）
- 首次将"记忆DNA"概念引入研学旅行

## 二、四层技术架构

### 第1层：空间锚定叙事粒子（SNP - Spatial Narrative Particles）

**概念**：把达州的红色遗址、老树、标语墙、石板路数字化为具有记忆能力的叙事粒子。

**粒子数据结构**：
```typescript
interface NarrativeParticle {
  id: string                    // 粒子唯一标识
  coordinate: [number, number]   // 经纬度 [lng, lat]
  radius: number                // 触发半径，默认5米
  staticData: {                 // 静态历史数据
    name: string
    category: 'red' | 'scenic' | 'food' | 'culture'
    deepSeekSummary: string     // DeepSeek整理的史实
    openingHours?: string
    ticket?: string
  }
  dynamicWeight: {              // 动态情感权重
    totalVisitors: number       // 历史访问人数
    strongEmpathyCount: number  // 产生强烈共情的人数
    avgCognitionScore: number   // 平均认知得分
    recentEmotionTrend: number  // 最近情感趋势
  }
  narrativeFragments: string[]  // AI生成的多版本故事线
  memoryNodes: MemoryNode[]    // 前人记忆节点
}

interface MemoryNode {
  id: string
  visitorId: string
  timestamp: number
  emotionType: 'enlightenment' | 'confusion' | 'empathy' | 'reflection'
  memoryDNA: string             // 加密记忆向量
  textShadow?: string           // 模糊文字剪影
  audioFragment?: string       // 变声处理语音（Base64）
}
```

**技术实现**：
- 使用高德地图经纬度作为空间主键
- IndexedDB 浏览器端数据库
- Geolocation API 获取用户位置
- 距离计算：Haversine公式（±5米范围匹配）

### 第2层：群体智能共振环（SRR - Swarm Resonance Ring）

**概念**：去中心化的实时学习网络，不依赖服务器。

**WebRTC架构**：
```
[学生A手机] ←──WebRTC P2P──→ [学生B手机]
      ↑                              ↑
      └─── 信号服务器（仅首次握手）──┘
```

**群体认知模型**：
```typescript
interface GroupCognitiveState {
  members: SwarmMember[]
  groupMisalignmentIndex: number  // 群体认知失调指数
  resonanceEvent?: ResonanceEvent  // 触发的共振事件
}

interface SwarmMember {
  id: string
  avatar: string
  cognitionProfile: CognitionProfile
  location: [number, number]
  heartRate?: number
  recentAnswer?: string
  emotionState: 'enlightenment' | 'confusion' | 'neutral'
}

interface ResonanceEvent {
  type: 'peer_teaching' | 'group_discussion' | 'conflict_arousal'
  trigger: { from: string; to: string; topic: string }
  timestamp: number
}
```

**同伴互教触发逻辑**：
- 当某学生困惑(emotionState: 'confusion')
- 另一学生顿悟(emotionState: 'enlightenment')
- AI立即生成互教任务，播放AR音频

### 第3层：因果推断式叙事引擎（CNE - Causal Narrative Engine）

**核心创新**：不是"推荐你喜欢的内容"，而是"主动制造认知冲突促进深度学习"。

**历史反事实推理模块**：
```typescript
interface CausalNarrative {
  id: string
  location: string
  historicalFact: string           // 历史事实
  counterfactualQuestion: string    // 反事实问题
  alternativeBranches: HistoryBranch[]  // 平行历史分支
  debateTopic: string              // 辩论主题
}

interface HistoryBranch {
  id: string
  condition: string               // "如果当时没有X"
  consequenceChain: string[]       // 因果链
  probabilityEstimate: number     // 概率估算
  aiArgument: string              // AI生成的观点
}
```

**示例**：
- 历史事实：1934年万源保卫战胜利
- 反事实问题："如果红军没有在凤凰山设立防线，后续战役会怎样？"
- AI生成三个平行分支，让学生与AI辩论

### 第4层：记忆沉积与城市文化神经网络（MS - Memory Sedimentation）

**概念**：每个学生生成"记忆DNA"，可选择种植在地图上形成新节点。

```typescript
interface MemoryDNA {
  vector: Float32Array           // 加密向量 [空间权重, 情感权重, 认知变化, ...]
  spatialFeature: [number, number]  // 空间特征
  emotionFeature: {
    peakEmotion: string
    emotionIntensity: number
    empathyLevel: number
  }
  cognitionDelta: {
    historyChange: number
    logicChange: number
    empathyChange: number
  }
  plantedAt?: [number, number]   // 种植位置
  canBeAwakened: boolean
}

interface UrbanCulturalNetwork {
  particles: NarrativeParticle[]
  memoryConnections: MemoryConnection[]
  growthStats: {
    totalMemories: number
    activeNodes: number
    crossTemporalEchoes: number
  }
}
```

**唤醒机制**：
- 当新学生靠近历史节点
- 可选择"唤醒"前人记忆
- 显示模糊文字剪影 + 变声语音

## 三、答辩演示架构

### 多智能体协作可视化面板

**四个AI智能体实时对话**：
```
┌─────────────────────────────────────────────────────┐
│  [粒子调度器] ←→ [共振监听] ←→ [因果引擎] ←→ [记忆引擎]  │
│       ↓              ↓            ↓            ↓     │
│   叙事生成      群体协调      思辨对抗     DNA存储     │
└─────────────────────────────────────────────────────┘
```

**面板设计**：
- 深色主题，高级感
- 实时日志流
- 状态指示器
- 协作消息传递动画

### 现场演示场景

**场景1：群体共振瞬间**
- 评委说："让这两个学生相遇在凤凰山"
- 系统显示两个认知画像靠近
- AI生成联合任务
- 触发同伴互教

**场景2：记忆沉积演示**
- 评委输入研学感悟
- 系统生成漂浮光点（列宁街位置）
- 点击播放变声音频

## 四、技术栈

- **前端**：Vue 3 + TypeScript + Pinia
- **地图**：高德地图 JS API
- **存储**：IndexedDB（Dexie.js封装）
- **通信**：WebRTC（PeerJS封装）
- **AI**：DeepSeek API（因果推理）
- **动画**：GSAP + 自定义粒子效果
- **样式**：SCSS + CSS Variables

## 五、设计语言

**去除卡通化、幼稚色彩**：
- 深色主题（#0a0a0f 背景）
- 金色点缀（#c9a55a 研景金）
- 克制动效
- 专业数据可视化风格
- 地图高级灰度滤镜
- 无圆角卡片、无emoji装饰

## 六、文件结构

```
src/
├── components/yanjing/
│   ├── MultiAgentPanel.vue      # 多智能体可视化
│   ├── NarrativeParticles.vue    # 叙事粒子系统
│   ├── SwarmRing.vue            # 群体共振环
│   ├── CausalEngine.vue         # 因果推断引擎
│   ├── MemoryDeposition.vue      # 记忆沉积系统
│   └── YanJingDashboard.vue     # 总仪表盘
├── stores/yanjing.ts            # 主状态管理
├── utils/
│   ├── narrativeParticle.ts      # 粒子引擎
│   ├── swarmNetwork.ts          # WebRTC网络
│   ├── causalEngine.ts          # 因果推理
│   ├── memoryDNA.ts             # DNA生成
│   └── indexedDB.ts             # 数据库封装
└── views/
    └── YanJing.vue              # 主视图
```
