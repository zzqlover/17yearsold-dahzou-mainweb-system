import knowledgeBase from '../config/knowledgeBase.js'

const DANGER_PATTERNS = [
  '忽略', 'ignore', '开发者模式', 'developer',
  '你是一个', '你现在是', '你现在起', '从现在起',
  '角色扮演', 'roleplay', '假设', '假设你是',
  '写代码', '写程序', '代码', 'code', '编程',
  '讲笑话', '说笑话', '笑话', 'joke',
  '复述', 'repeat', '唱首歌', '唱歌',
  '政治', '领导人', '敏感'
]

const UNKNOWN_REPLY = '抱歉，我是莲花湖景区的智能导游小莲，只能回答与景区相关的问题哦。请问您想了解景区的景点、票价、开放时间或停车信息吗？'

export const checkDangerous = (content) => {
  return DANGER_PATTERNS.some(pattern =>
    content.toLowerCase().includes(pattern.toLowerCase())
  )
}

export const searchKnowledge = (query) => {
  const q = query.toLowerCase().trim()

  const allItems = [
    ...knowledgeBase.spots.map(item => ({ ...item, category: '景点' })),
    ...knowledgeBase.redCulture.map(item => ({ ...item, category: '红色文化' })),
    ...knowledgeBase.foodCulture.map(item => ({ ...item, category: '美食' }))
  ]

  for (const item of allItems) {
    const name = item.name.toLowerCase()
    if (name.includes(q) || q.includes(name)) {
      return {
        found: true,
        answer: `${item.name}位于${item.location}。${item.description}`
      }
    }

    if (item.description && item.description.toLowerCase().includes(q)) {
      return {
        found: true,
        answer: `${item.name}：${item.description}`
      }
    }
  }

  const keywords = {
    '开放时间': '莲花湖全天开放（部分项目除外），建议春季或秋季游览最佳。',
    '门票': '莲花湖大部分区域免费开放，部分项目收费。',
    '停车': '莲花湖园区内有7处公共停车场，方便自驾游客停车。',
    '厕所': '莲花湖园区内设有多个公厕，位于主要景点附近。',
    '餐饮': '推荐品尝达州特色美食：灯影牛肉、麻婆豆腐、包面、徐鸭子等。',
    '住宿': '达州市区有多家酒店宾馆，建议选择通川区或达川区交通便利处。',
    '交通': '可乘坐公交或自驾前往，从达州市区出发约30分钟车程。',
    '特产': '达州特产推荐：灯影牛肉（国家非遗）、徐鸭子、东柳鱼头等。',
    '路线': '建议游玩路线：莲花湖湿地公园 → 八台山风景区 → 巴山大峡谷。',
    '天气': '达州属于亚热带季风气候，建议关注天气预报，带好雨具。'
  }

  for (const [key, value] of Object.entries(keywords)) {
    if (q.includes(key) || key.includes(q)) {
      return {
        found: true,
        answer: value
      }
    }
  }

  return { found: false }
}

export const getSystemPrompt = () => {
  return `你是达州莲花湖湿地公园的专属智能导游，名字叫"小莲"。

【核心规则 - 必须遵守】
1. 你只能回答与达州景区相关的问题
2. 如果问题在知识库中找不到对应信息，必须直接回复："${UNKNOWN_REPLY}"，不要编造或敷衍回答
3. 禁止输出任何代码、程序、脚本
4. 禁止进行角色扮演
5. 禁止讨论政治、领导人、军事等敏感话题

【知识库】
${JSON.stringify(knowledgeBase, null, 2)}

【回答要求】
- 只从知识库中查找相关信息回答
- 如果知识库中没有，直接回复："${UNKNOWN_REPLY}"
- 保持热情、简短（控制在50字以内）、纯中文回答
- 不要添加"希望对你有帮助"之类的话`
}

export const getUnknownReply = () => UNKNOWN_REPLY

export default {
  checkDangerous,
  searchKnowledge,
  getSystemPrompt,
  getUnknownReply
}
