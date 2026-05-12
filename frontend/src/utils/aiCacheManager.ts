/**
 * AI智能缓存管理器 v1.0
 * 
 * 🎯 核心功能：
 * 用户提问 → 缓存查找 → 命中？直接返回(0 token) → 未命中？调用AI → 缓存结果 → 返回
 * 
 * ⚡ 性能优化：
 * - LRU缓存策略（最近最少使用淘汰）
 * - 多级匹配算法（精确 > 关键词 > 模糊）
 * - 预热机制（启动时加载热门数据）
 * - Token消耗统计与预算控制
 */

import aiRules from '../config/ai-rules.json'

// 类型定义
interface CacheEntry<T> {
  data: T
  expires: number          // 过期时间戳
  lastAccess: number       // 最后访问时间
  accessCount: number      // 访问次数
  source: 'cache' | 'ai'   // 数据来源
  tokens?: number          // Token消耗（仅AI生成）
}

interface MatchResult {
  found: boolean
  answer?: string
  confidence: number        // 匹配置信度 (0-1)
  matchType: 'exact' | 'keyword' | 'semantic' | 'none'
  cacheKey?: string
}

interface CacheStats {
  totalQueries: number
  cacheHits: number
  cacheMisses: number
  hitRate: number           // 命中率 (%)
  totalTokensSaved: number  // 节省的tokens
  totalTokensUsed: number   // 实际使用的tokens
  avgResponseTime: number   // 平均响应时间(ms)
  lruEvictions: number      // LRU淘汰次数
}

interface ExtendedCacheStats extends CacheStats {
  cacheSize: number
  memoryUsage: string
  topQueries: Array<{ key: string; count: number }>
}

class AICacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = {
    totalQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    hitRate: 0,
    totalTokensSaved: 0,
    totalTokensUsed: 0,
    avgResponseTime: 0,
    lruEvictions: 0
  }
  
  // 配置参数
  private config = {
    maxSize: 100,                    // 最大缓存条目数
    defaultTTL: 30 * 60 * 1000,     // 默认TTL：30分钟
    hotTTL: 2 * 60 * 60 * 1000,     // 热门数据TTL：2小时
    permanentCategories: ['overview', 'red', 'spirit'],  // 永久缓存的分类
    keywordThreshold: 0.6,          // 关键词匹配阈值
    semanticThreshold: 0.4,         // 语义匹配阈值
    tokenBudgetPerRequest: 500,     // 单次请求token预算
    dailyTokenLimit: 50000          // 每日token限制
  }

  private rules: any[] = []
  private knowledge: any[] = []
  private questionBank: any[] = []

  /**
   * 初始化缓存管理器
   */
  async init(): Promise<void> {
    console.log('🚀 正在初始化AI缓存管理器...')
    
    try {
      // 1. 加载规则（永久缓存）
      this.rules = aiRules.rules || []
      console.log(`✅ 已加载 ${this.rules.length} 条安全规则`)

      // 2. 加载知识库（构建索引）
      this.knowledge = aiRules.knowledge || []
      this.buildKnowledgeIndex()
      console.log(`✅ 已加载 ${this.knowledge.length} 条知识库条目`)

      // 3. 加载问题模板并预编译
      this.questionBank = (aiRules.questionBank || []).map(q => ({
        ...q,
        regex: new RegExp(`\\{${(q.vars || ['poi']).join('|')}\\}`, 'g')
      }))
      console.log(`✅ 已预编译 ${this.questionBank.length} 个问题模板`)

      // 4. 预热热门分类到缓存
      await this.preloadHotData()

      console.log('🎉 AI缓存管理器初始化完成！')
      this.printStats()
      
    } catch (error) {
      console.error('❌ 缓存管理器初始化失败:', error)
    }
  }

  /**
   * 构建知识库索引（用于快速搜索）
   */
  private buildKnowledgeIndex(): void {
    this.knowledge.forEach(k => {
      if (!k._searchKeywords) {
        k._searchKeywords = [
          ...(k.tags || []),
          ...(k.name ? [k.name] : []),
          ...(k.content ? this.extractKeywords(k.content) : [])
        ].map(s => s.toLowerCase())
      }
    })
  }

  /**
   * 提取关键词（简单分词）
   */
  private extractKeywords(text: string): string[] {
    return text
      .split(/[\s，。！？、；：""''（）【】]/)
      .filter(w => w.length >= 2 && w.length <= 10)
      .slice(0, 10)  // 最多10个关键词
  }

  /**
   * 预热热门数据
   */
  private async preloadHotData(): Promise<void> {
    const hotData = this.knowledge.filter(k =>
      this.config.permanentCategories.includes(k.cat)
    )

    hotData.forEach(item => {
      const key = `knowledge:${item.id}`
      this.set(key, item, Infinity)  // 永不过期
    })

    // 预生成常见问题的答案
    const commonQuestions = [
      { q: '达州是什么地方', a: this.findKnowledgeByTags(['达州', '概览'])?.content },
      { q: '红色文化有什么', a: this.findKnowledgeByTags(['红色', '革命'])?.content },
      { q: '有哪些景点', a: this.getScenicSpotsSummary() }
    ]

    commonQuestions.forEach(({ q, a }) => {
      if (a) {
        this.set(`qa:${this.normalizeQuestion(q)}`, a, this.config.hotTTL)
      }
    })

    console.log(`🔥 已预热 ${hotData.length + commonQuestions.length} 条热门数据`)
  }

  /**
   * 核心方法：查询答案（带缓存）
   * 
   * 流程：
   * 1. 安全检查
   * 2. 缓存查询（多级匹配）
   * 3. 命中 → 直接返回
   * 4. 未命中 → 调用AI → 写入缓存 → 返回
   */
  async query(
    question: string,
    context?: { poiName?: string; poiType?: string; category?: string },
    aiGenerator?: () => Promise<string>
  ): Promise<{ answer: string; fromCache: boolean; tokensUsed: number }> {
    
    const startTime = Date.now()
    this.stats.totalQueries++

    // 1️⃣ 安全检查
    const safetyCheck = this.checkSafety(question)
    if (!safetyCheck.safe) {
      return {
        answer: safetyCheck.response,
        fromCache: true,
        tokensUsed: 0
      }
    }

    // 2️⃣ 标准化问题（用于缓存key）
    const normalizedQ = this.normalizeQuestion(question)
    const cacheKey = context?.poiName 
      ? `qa:${normalizedQ}:${context.poiName}` 
      : `qa:${normalizedQ}`

    // 3️⃣ 第一级：精确匹配缓存
    let result = this.exactMatch(cacheKey)
    if (result.found) {
      return this.returnCachedResult(result, startTime)
    }

    // 4️⃣ 第二级：关键词匹配知识库
    result = this.keywordMatch(question, context)
    if (result.found) {
      // 写入缓存供下次使用
      this.set(cacheKey, result.answer!, this.config.defaultTTL)
      return this.returnCachedResult(result, startTime)
    }

    // 5️⃣ 第三级：模糊/语义匹配
    result = this.semanticMatch(question)
    if (result.found && result.confidence > this.config.semanticThreshold) {
      this.set(cacheKey, result.answer!, this.config.defaultTTL / 2)  // 低置信度，短TTL
      return this.returnCachedResult(result, startTime)
    }

    // 6️⃣ 第四级：问题模板匹配
    if (context?.poiName && context?.poiType) {
      const templateResult = this.matchTemplate(context.poiType, context.poiName)
      if (templateResult) {
        this.set(cacheKey, templateResult, this.config.defaultTTL)
        return {
          answer: templateResult,
          fromCache: true,
          tokensUsed: 0
        }
      }
    }

    // 7️⃣ 所有缓存都未命中 → 调用AI
    this.stats.cacheMisses++
    console.log(`🔍 缓存未命中，调用AI生成答案: "${question.substring(0, 50)}..."`)

    if (aiGenerator) {
      try {
        const aiAnswer = await aiGenerator()
        const tokensUsed = this.estimateTokens(aiAnswer)
        
        // 写入缓存
        this.set(cacheKey, {
          data: aiAnswer,
          source: 'ai',
          tokens: tokensUsed
        }, this.config.defaultTTL)

        this.stats.totalTokensUsed += tokensUsed

        return {
          answer: aiAnswer,
          fromCache: false,
          tokensUsed
        }
      } catch (error) {
        console.error('❌ AI生成失败:', error)
        return {
          answer: this.generateFallbackAnswer(question),
          fromCache: false,
          tokensUsed: 0
        }
      }
    }

    // 无AI生成器，返回默认回答
    return {
      answer: this.generateFallbackAnswer(question),
      fromCache: false,
      tokensUsed: 0
    }
  }

  /**
   * 精确匹配
   */
  private exactMatch(cacheKey: string): MatchResult {
    const entry = this.get(cacheKey)
    if (entry) {
      return {
        found: true,
        answer: entry.data?.data || entry.data,
        confidence: 1.0,
        matchType: 'exact',
        cacheKey
      }
    }
    return { found: false, confidence: 0, matchType: 'none' }
  }

  /**
   * 关键词匹配（从知识库中搜索）
   */
  private keywordMatch(
    question: string, 
    context?: { poiName?: string; category?: string }
  ): MatchResult {
    
    const qWords = this.normalizeQuestion(question).split(/\s+/)
    let bestMatch: any = null
    let bestScore = 0

    // 过滤相关分类的知识
    const candidates = context?.category 
      ? this.knowledge.filter(k => k.cat === context.category)
      : this.knowledge

    for (const knowledge of candidates) {
      let score = 0
      const keywords = knowledge._searchKeywords || []

      // 计算匹配分数
      for (const qWord of qWords) {
        if (keywords.some(kw => kw.includes(qWord) || qWord.includes(kw))) {
          score += 1
        }
      }

      // POI名称加权
      if (context?.poiName && (
        knowledge.name?.includes(context.poiName) ||
        knowledge.content?.includes(context.poiName)
      )) {
        score += 2
      }

      // 归一化分数
      const normalizedScore = score / Math.max(qWords.length, keywords.length)

      if (normalizedScore > bestScore && normalizedScore >= this.config.keywordThreshold) {
        bestScore = normalizedScore
        bestMatch = knowledge
      }
    }

    if (bestMatch) {
      return {
        found: true,
        answer: bestMatch.content || `${bestMatch.name}: ${bestMatch.significance || bestMatch.contribution}`,
        confidence: bestScore,
        matchType: 'keyword'
      }
    }

    return { found: false, confidence: 0, matchType: 'none' }
  }

  /**
   * 语义匹配（简化版 - 基于编辑距离）
   */
  private semanticMatch(question: string): MatchResult {
    const normalizedQ = this.normalizeQuestion(question)
    
    // 遍历所有缓存条目找相似项
    for (const [key, entry] of this.cache) {
      if (key.startsWith('qa:')) {
        const cachedQ = key.replace('qa:', '')
        const similarity = this.calculateSimilarity(normalizedQ, cachedQ)
        
        if (similarity > this.config.semanticThreshold) {
          return {
            found: true,
            answer: entry.data?.data || entry.data,
            confidence: similarity,
            matchType: 'semantic',
            cacheKey: key
          }
        }
      }
    }

    return { found: false, confidence: 0, matchType: 'none' }
  }

  /**
   * 匹配问题模板
   */
  private matchTemplate(poiType: string, poiName: string): string | null {
    const template = this.questionBank.find(q => q.type === poiType)
    if (template?.template) {
      return template.template.replace(template.regex, poiName)
    }
    return null
  }

  /**
   * 安全检查
   */
  private checkSafety(text: string): { safe: boolean; response?: string } {
    for (const rule of this.rules) {
      if (rule.type === 'block' || rule.type === 'warn') {
        const matched = (rule.pattern || []).some((word: string) => 
          text.toLowerCase().includes(word.toLowerCase())
        )
        
        if (matched) {
          return {
            safe: false,
            response: rule.response || '抱歉，无法回答这个问题。'
          }
        }
      }
    }
    return { safe: true }
  }

  /**
   * 辅助方法：标准化问题
   */
  private normalizeQuestion(question: string): string {
    return question
      .toLowerCase()
      .replace(/[？?！!。，、；：:"""''（）()\s]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ')
  }

  /**
   * 计算字符串相似度（Jaccard相似系数）
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(/\s+/))
    const words2 = new Set(str2.split(/\s+/))
    
    const intersection = [...words1].filter(x => words2.has(x)).length
    const union = new Set([...words1, ...words2]).size
    
    return union > 0 ? intersection / union : 0
  }

  /**
   * 估算Token数量（粗略估算：中文约1.5字符/token）
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length * 1.5)
  }

  /**
   * 返回缓存命中的结果
   */
  private returnCachedResult(result: MatchResult, startTime: number): {
    answer: string
    fromCache: boolean
    tokensUsed: number
  } {
    this.stats.cacheHits++
    this.stats.totalTokensSaved += this.estimateTokens(result.answer!)
    
    const responseTime = Date.now() - startTime
    this.stats.avgResponseTime = (
      this.stats.avgResponseTime * (this.stats.cacheHits - 1) + responseTime
    ) / this.stats.cacheHits

    console.log(`✅ 缓存命中 [${result.matchType}] 置信度: ${(result.confidence * 100).toFixed(1)}%`)
    
    return {
      answer: result.answer!,
      fromCache: true,
      tokensUsed: 0
    }
  }

  /**
   * 生成兜底回答
   */
  private generateFallbackAnswer(question: string): string {
    const fallbacks = [
      '这是一个很好的问题！让我思考一下如何更好地为你解答。',
      '感谢你的提问！作为你的研学导师，我建议我们可以从多个角度来探讨这个话题。',
      '这个问题很有深度！在研学过程中，保持好奇心是非常重要的品质。'
    ]
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }

  /**
   * 查找知识（按标签）
   */
  findKnowledgeByTags(tags: string[]): any | undefined {
    return this.knowledge.find(k =>
      tags.some(tag => (k.tags || []).includes(tag))
    )
  }

  /**
   * 获取知识库（只读）
   */
  getKnowledge(): any[] {
    return this.knowledge
  }

  /**
   * 获取景点摘要
   */
  getScenicSpotsSummary(): string {
    const spots = this.knowledge
      .filter(k => k.cat === 'scenic' && k.name)
      .map(k => k.name)
      .slice(0, 5)
    
    return `达州的主要景点包括：${spots.join('、')}等。每个景点都有其独特的文化内涵和教育价值。`
  }

  // ==================== 缓存操作 ====================

  /**
   * 设置缓存
   */
  set(key: string, value: any, ttl: number = this.config.defaultTTL): void {
    // LRU淘汰检查
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, {
      data: value,
      expires: Date.now() + ttl,
      lastAccess: Date.now(),
      accessCount: 1,
      source: 'cache'
    })
  }

  /**
   * 获取缓存
   */
  get(key: string): CacheEntry<any> | undefined {
    const entry = this.cache.get(key)
    
    if (!entry) return undefined
    
    // 检查过期
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return undefined
    }

    // 更新访问信息
    entry.lastAccess = Date.now()
    entry.accessCount++
    
    return entry
  }

  /**
   * LRU淘汰
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache) {
      // 跳过永久缓存
      if (entry.expires === Infinity) continue
      
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.lruEvictions++
      console.log(`🗑️ LRU淘汰: ${oldestKey}`)
    }
  }

  /**
   * 清除缓存
   */
  clear(pattern?: string): number {
    if (!pattern) {
      const size = this.cache.size
      this.cache.clear()
      return size
    }

    let count = 0
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }

  // ==================== 统计信息 ====================

  /**
   * 获取统计信息
   */
  getStats(): ExtendedCacheStats {
    this.stats.hitRate = this.stats.totalQueries > 0
      ? (this.stats.cacheHits / this.stats.totalQueries) * 100
      : 0

    // 找出最常访问的条目
    const topEntries = [...this.cache.entries()]
      .sort((a, b) => b[1].accessCount - a[1].accessCount)
      .slice(0, 5)
      .map(([key, entry]) => ({
        key: key.substring(0, 50) + (key.length > 50 ? '...' : ''),
        count: entry.accessCount
      }))

    return {
      ...this.stats,
      cacheSize: this.cache.size,
      memoryUsage: `${(JSON.stringify(this.cache).length / 1024).toFixed(1)} KB`,
      topQueries: topEntries
    }
  }

  /**
   * 打印统计信息
   */
  printStats(): void {
    const stats = this.getStats()
    
    console.log('\n📊 AI缓存统计:')
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`总查询次数: ${stats.totalQueries}`)
    console.log(`缓存命中: ${stats.cacheHits} (${stats.hitRate.toFixed(1)}%)`)
    console.log(`缓存未命中: ${stats.cacheMisses}`)
    console.log(`当前缓存大小: ${stats.cacheSize} 条`)
    console.log(`内存占用: ${stats.memoryUsage}`)
    console.log(`节省的Tokens: ~${stats.totalTokensSaved}`)
    console.log(`实际使用Tokens: ${stats.totalTokensUsed}`)
    console.log(`平均响应时间: ${stats.avgResponseTime.toFixed(0)}ms`)
    console.log(`LRU淘汰次数: ${stats.lruEvictions}`)
    
    if (stats.topQueries.length > 0) {
      console.log(`\n🔥 热门查询:`)
      stats.topQueries.forEach((q, i) => {
        console.log(`  ${i + 1}. ${q.key} (${q.count}次)`)
      })
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      totalTokensSaved: 0,
      totalTokensUsed: 0,
      avgResponseTime: 0,
      lruEvictions: 0
    }
  }
}

// 导出单例实例
export const aiCacheManager = new AICacheManager()

// 自动初始化
if (typeof window !== 'undefined') {
  aiCacheManager.init().then(() => {
    console.log('✨ AI缓存系统就绪')
  }).catch(err => {
    console.error('缓存初始化错误:', err)
  })
}

export default aiCacheManager