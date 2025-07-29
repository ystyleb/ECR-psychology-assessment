// 统一服务层 - 合并所有services为单一文件
import type { 
  AssessmentData, 
  AssessmentQuestion, 
  AttachmentStyle, 
  BasicResult, 
  PaymentSession,
  PaymentResult
} from '@/types'

// ECR题目数据（36题）
const ECR_QUESTIONS: AssessmentQuestion[] = [
  { id: 1, text: '我担心被抛弃', dimension: 'anxiety', reverse: false, order: 1 },
  { id: 2, text: '我发现很难依赖恋人', dimension: 'avoidance', reverse: false, order: 2 },
  { id: 3, text: '我经常担心恋人不再爱我', dimension: 'anxiety', reverse: false, order: 3 },
  { id: 4, text: '我发现恋人不愿意像我希望的那样亲近我', dimension: 'avoidance', reverse: false, order: 4 },
  { id: 5, text: '我担心独自一人', dimension: 'anxiety', reverse: false, order: 5 },
  { id: 6, text: '我感到与恋人亲近很舒服', dimension: 'avoidance', reverse: true, order: 6 },
  { id: 7, text: '我经常担心恋人对我的关心不如我对他们的关心', dimension: 'anxiety', reverse: false, order: 7 },
  { id: 8, text: '我发现很难允许自己依赖恋人', dimension: 'avoidance', reverse: false, order: 8 },
  { id: 9, text: '我很少担心被抛弃', dimension: 'anxiety', reverse: true, order: 9 },
  { id: 10, text: '我不喜欢向恋人表露我内心深处的感受', dimension: 'avoidance', reverse: false, order: 10 },
  { id: 11, text: '我经常希望恋人的感受能像我对他们的感受一样强烈', dimension: 'anxiety', reverse: false, order: 11 },
  { id: 12, text: '我想要与恋人非常亲近，这有时会把他们吓跑', dimension: 'avoidance', reverse: false, order: 12 },
  { id: 13, text: '我担心恋人不会像我爱他们那样爱我', dimension: 'anxiety', reverse: false, order: 13 },
  { id: 14, text: '我发现很难与恋人保持亲密', dimension: 'avoidance', reverse: false, order: 14 },
  { id: 15, text: '当恋人不在身边时我会感到轻松', dimension: 'anxiety', reverse: true, order: 15 },
  { id: 16, text: '我发现很难完全信任恋人', dimension: 'avoidance', reverse: false, order: 16 },
  { id: 17, text: '我担心我会被抛弃', dimension: 'anxiety', reverse: false, order: 17 },
  { id: 18, text: '我宁愿不向恋人表达自己的感受', dimension: 'avoidance', reverse: false, order: 18 },
  { id: 19, text: '我很少担心恋人会离开我', dimension: 'anxiety', reverse: true, order: 19 },
  { id: 20, text: '我发现很难依赖恋人', dimension: 'avoidance', reverse: false, order: 20 },
  { id: 21, text: '当我的恋人不赞成我时，我感觉很糟糕', dimension: 'anxiety', reverse: false, order: 21 },
  { id: 22, text: '我向恋人寻求很多安慰', dimension: 'avoidance', reverse: true, order: 22 },
  { id: 23, text: '当恋人离开一小段时间我会变得沮丧', dimension: 'anxiety', reverse: false, order: 23 },
  { id: 24, text: '我不喜欢向恋人敞开心扉', dimension: 'avoidance', reverse: false, order: 24 },
  { id: 25, text: '我告诉恋人几乎所有事情', dimension: 'avoidance', reverse: true, order: 25 },
  { id: 26, text: '我发现很难允许自己依赖恋人', dimension: 'avoidance', reverse: false, order: 26 },
  { id: 27, text: '当我需要恋人时，他们总是在身边', dimension: 'anxiety', reverse: true, order: 27 },
  { id: 28, text: '当恋人想要我更亲密时我会感到紧张', dimension: 'avoidance', reverse: false, order: 28 },
  { id: 29, text: '我担心独自生活', dimension: 'anxiety', reverse: false, order: 29 },
  { id: 30, text: '我感到与恋人亲近很容易', dimension: 'avoidance', reverse: true, order: 30 },
  { id: 31, text: '恋人想让我们更亲近，这让我很容易', dimension: 'avoidance', reverse: true, order: 31 },
  { id: 32, text: '我发现很难在情感上依赖恋人', dimension: 'avoidance', reverse: false, order: 32 },
  { id: 33, text: '我知道恋人会在我需要时出现在我身边', dimension: 'anxiety', reverse: true, order: 33 },
  { id: 34, text: '我想要与恋人融为一体', dimension: 'avoidance', reverse: false, order: 34 },
  { id: 35, text: '我发现恋人不想像我希望的那样亲近', dimension: 'anxiety', reverse: false, order: 35 },
  { id: 36, text: '我向恋人表达我的需要和感受是相对容易的', dimension: 'avoidance', reverse: true, order: 36 }
]

/**
 * 统一服务类 - 整合所有业务逻辑
 */
class ECRService {
  private readonly STORAGE_KEYS = {
    assessments: 'ecr_assessments',
    sessions: 'ecr_payment_sessions',
    tokens: 'ecr_access_tokens'
  }

  private readonly baseUrl = import.meta.env.VITE_API_BASE_URL || ''

  // 题目配置
  private readonly anxiousItems = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]
  private readonly avoidantItems = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]
  private readonly reverseItems = [6, 9, 15, 19, 22, 25, 27, 30, 31, 33, 36]

  // ===== 存储相关方法 =====
  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`存储失败:`, error)
    }
  }

  private removeItem(key: string): void {
    localStorage.removeItem(key)
  }

  // ===== 题目相关方法 =====
  async getQuestions(): Promise<AssessmentQuestion[]> {
    return ECR_QUESTIONS
  }

  getQuestionById(id: number): AssessmentQuestion | null {
    return ECR_QUESTIONS.find(q => q.id === id) || null
  }

  validateResponse(questionId: number, response: number): boolean {
    return response >= 1 && response <= 7 && questionId >= 1 && questionId <= 36
  }

  // ===== 计算相关方法 =====
  calculateAnxiousScore(responses: (number | null)[]): number {
    let sum = 0
    let count = 0

    this.anxiousItems.forEach(itemNum => {
      const response = responses[itemNum - 1]
      if (response !== null && response !== undefined) {
        let score = response
        if (this.reverseItems.includes(itemNum)) {
          score = 8 - response
        }
        sum += score
        count++
      }
    })

    return count > 0 ? Number((sum / count).toFixed(1)) : 0
  }

  calculateAvoidantScore(responses: (number | null)[]): number {
    let sum = 0
    let count = 0

    this.avoidantItems.forEach(itemNum => {
      const response = responses[itemNum - 1]
      if (response !== null && response !== undefined) {
        let score = response
        if (this.reverseItems.includes(itemNum)) {
          score = 8 - response
        }
        sum += score
        count++
      }
    })

    return count > 0 ? Number((sum / count).toFixed(1)) : 0
  }

  calculateAttachmentStyle(anxious: number, avoidant: number): AttachmentStyle {
    const midpoint = 4.0

    if (anxious < midpoint && avoidant < midpoint) {
      return 'secure'
    } else if (anxious >= midpoint && avoidant < midpoint) {
      return 'anxious'
    } else if (anxious < midpoint && avoidant >= midpoint) {
      return 'avoidant'
    } else {
      return 'disorganized'
    }
  }

  calculateResult(responses: (number | null)[]): BasicResult {
    const anxious = this.calculateAnxiousScore(responses)
    const avoidant = this.calculateAvoidantScore(responses)
    const style = this.calculateAttachmentStyle(anxious, avoidant)

    return {
      anxious,
      avoidant,
      style,
      timestamp: new Date(),
      completedAt: new Date()
    }
  }

  // ===== 测评相关方法 =====
  async createAssessment(): Promise<AssessmentData> {
    const assessment: AssessmentData = {
      id: `ecr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      responses: new Array(36).fill(null),
      createdAt: new Date(),
      basicResult: null
    }

    // 保存到本地存储
    const assessments = this.getItem<Record<string, AssessmentData>>(this.STORAGE_KEYS.assessments) || {}
    assessments[assessment.id] = assessment
    this.setItem(this.STORAGE_KEYS.assessments, assessments)

    return assessment
  }

  async getAssessment(id: string): Promise<AssessmentData | null> {
    const assessments = this.getItem<Record<string, AssessmentData>>(this.STORAGE_KEYS.assessments) || {}
    return assessments[id] || null
  }

  async updateAssessment(assessment: AssessmentData): Promise<void> {
    const assessments = this.getItem<Record<string, AssessmentData>>(this.STORAGE_KEYS.assessments) || {}
    
    // 如果完成但没有结果，计算结果
    const isCompleted = assessment.responses.every(r => r !== null)
    if (isCompleted && !assessment.basicResult) {
      assessment.basicResult = this.calculateResult(assessment.responses)
    }

    assessments[assessment.id] = assessment
    this.setItem(this.STORAGE_KEYS.assessments, assessments)
  }

  async deleteAssessment(id: string): Promise<void> {
    const assessments = this.getItem<Record<string, AssessmentData>>(this.STORAGE_KEYS.assessments) || {}
    delete assessments[id]
    this.setItem(this.STORAGE_KEYS.assessments, assessments)
  }

  hasAssessment(id: string): boolean {
    const assessments = this.getItem<Record<string, AssessmentData>>(this.STORAGE_KEYS.assessments) || {}
    return !!assessments[id]
  }

  // ===== 详细报告生成方法 =====
  generateDetailedReport(basicResult: BasicResult): DetailedReport {
    const { style, anxious, avoidant } = basicResult
    
    return {
      personalityTraits: this.generatePersonalityTraits(style, { anxious, avoidant }),
      relationshipPatterns: this.generateRelationshipPatterns(style, { anxious, avoidant }),
      growthSuggestions: this.generateGrowthSuggestions(style, { anxious, avoidant }),
      strengthsAndChallenges: this.generateStrengthsAndChallenges(style, { anxious, avoidant }),
      compatibilityAnalysis: this.generateCompatibilityAnalysis(style),
      generatedAt: new Date()
    }
  }

  private generatePersonalityTraits(style: AttachmentStyle, scores: { anxious: number; avoidant: number }): string[] {
    const traitMap = {
      secure: [
        '您善于建立和维持稳定的关系',
        '在面对冲突时能够冷静理性地处理',
        '能够平衡独立性和亲密感',
        '对伴侣表现出适度的信任和依赖',
        '情绪调节能力较强，很少出现极端情绪反应'
      ],
      anxious: [
        '您非常重视与他人的情感连接',
        '对伴侣的需求和感受非常敏感',
        '在关系中表现出强烈的忠诚度',
        '具有很强的共情能力',
        '愿意为了维持关系而做出妥协和改变'
      ],
      avoidant: [
        '您具有很强的独立性和自主性',
        '能够在压力下保持冷静和理性',
        '具有很好的问题解决能力',
        '不容易被他人的情绪所影响',
        '在决策时倾向于依靠自己的判断'
      ],
      disorganized: [
        '您具有很强的适应能力',
        '对复杂的情感体验有独特的理解',
        '能够从多个角度看待问题',
        '具有很强的情感感知能力',
        '对他人的痛苦和困难有深度的理解'
      ]
    }

    const baseTraits = traitMap[style] || traitMap.secure
    const modifiedTraits = [...baseTraits]

    // 根据具体得分调整特质描述
    if (scores.anxious > 5.0) {
      modifiedTraits.push('您对关系的投入程度很高，能够深度体验爱与被爱')
    }
    if (scores.avoidant > 5.0) {
      modifiedTraits.push('您具有很强的自我保护意识，善于维护个人边界')
    }

    return modifiedTraits.slice(0, 6) // 返回最多6个特质
  }

  private generateRelationshipPatterns(style: AttachmentStyle, scores: { anxious: number; avoidant: number }): string[] {
    const patternMap = {
      secure: [
        '您倾向于建立平等、互相尊重的关系',
        '在关系中能够有效沟通，表达自己的需求',
        '能够给予伴侣支持，同时也愿意接受帮助',
        '处理关系冲突时采用建设性的方式',
        '能够在关系中保持个人成长和发展'
      ],
      anxious: [
        '您渴望与伴侣建立深度的情感连接',
        '可能会频繁寻求伴侣的关注和确认',
        '在关系中倾向于优先考虑伴侣的需求',
        '对关系中的变化和不稳定因素比较敏感',
        '可能会通过过度付出来维持关系的稳定'
      ],
      avoidant: [
        '您偏好在关系中保持一定的独立空间',
        '倾向于通过理性分析来处理关系问题',
        '可能会在关系过于亲密时感到不适',
        '习惯于依靠自己解决问题，较少寻求帮助',
        '在表达深层情感时可能会感到困难'
      ],
      disorganized: [
        '您在亲密和距离之间可能会有矛盾的感受',
        '关系模式可能会因情境不同而有所变化',
        '对伴侣可能同时存在渴望和恐惧的情绪',
        '在关系稳定期和不稳定期表现差异较大',
        '需要更多时间来建立对关系的安全感'
      ]
    }

    return patternMap[style] || patternMap.secure
  }

  private generateGrowthSuggestions(style: AttachmentStyle, scores: { anxious: number; avoidant: number }): string[] {
    const suggestionMap = {
      secure: [
        '继续保持开放和诚实的沟通方式',
        '在支持伴侣的同时，也要关注自己的需求',
        '可以作为朋友圈中关系问题的咨询者',
        '尝试帮助伴侣建立更安全的依恋模式',
        '在新关系中保持耐心和理解'
      ],
      anxious: [
        '练习自我安抚技巧，如冥想、深呼吸或写日记',
        '学会识别并质疑消极的自动思维',
        '培养个人兴趣和独立活动，建立自我价值感',
        '与伴侣建立定期沟通的习惯，减少猜测和担忧',
        '寻求专业咨询师的帮助，学习更健康的依恋模式'
      ],
      avoidant: [
        '练习识别和表达自己的情感需求',
        '尝试与伴侣分享更多个人经历和感受',
        '学会在适当的时候寻求他人的支持和帮助',
        '练习在关系中的脆弱性，逐步建立更深的信任',
        '考虑参加夫妻治疗或个人治疗来改善亲密关系能力'
      ],
      disorganized: [
        '寻求专业心理咨询，探索早期依恋经历的影响',
        '学习情绪调节技巧，如正念冥想和认知行为策略',
        '建立稳定的日常例行公事，增加生活的可预测性',
        '与伴侣建立清晰的关系界限和期望',
        '参加支持小组，与有相似经历的人分享和学习'
      ]
    }

    const baseSuggestions = suggestionMap[style] || suggestionMap.secure
    const enhancedSuggestions = [...baseSuggestions]

    // 根据具体得分添加针对性建议
    if (scores.anxious > 4.5) {
      enhancedSuggestions.push('考虑学习依恋理论，了解自己的情感模式')
    }
    if (scores.avoidant > 4.5) {
      enhancedSuggestions.push('尝试每天与伴侣分享一件个人感受或经历')
    }

    return enhancedSuggestions.slice(0, 7) // 返回最多7个建议
  }

  private generateStrengthsAndChallenges(
    style: AttachmentStyle, 
    scores: { anxious: number; avoidant: number }
  ): { strengths: string[]; challenges: string[] } {
    const strengthsChallengesMap = {
      secure: {
        strengths: [
          '具有建立和维持健康关系的能力',
          '能够平衡个人需求和关系需求',
          '拥有良好的情绪调节能力',
          '在冲突中能够寻求双赢的解决方案',
          '能够给予和接受适当的支持'
        ],
        challenges: [
          '可能对其他依恋类型的人缺乏深度理解',
          '在面对极度不安全的伴侣时可能感到困惑',
          '可能会低估自己在关系中的积极影响'
        ]
      },
      anxious: {
        strengths: [
          '对伴侣的需求和情感非常敏感',
          '愿意为关系投入大量时间和精力',
          '具有很强的共情能力和情感表达能力',
          '能够深度体验爱与被爱的感觉',
          '对关系的忠诚度很高'
        ],
        challenges: [
          '可能会过度担心关系的稳定性',
          '容易将伴侣的行为解读为拒绝的信号',
          '可能会忽视自己的需求来满足伴侣',
          '在关系不确定时容易产生焦虑情绪',
          '可能会通过过度付出来寻求安全感'
        ]
      },
      avoidant: {
        strengths: [
          '具有很强的独立性和自主性',
          '能够在压力下保持冷静和理性',
          '具有良好的问题解决能力',
          '不容易被他人的情绪过度影响',
          '能够维护健康的个人边界'
        ],
        challenges: [
          '可能难以识别和表达深层情感',
          '在伴侣需要情感支持时可能显得疏远',
          '可能会低估亲密关系的重要性',
          '在关系深入时可能会感到不适',
          '可能会过度依赖自己而忽视他人的帮助'
        ]
      },
      disorganized: {
        strengths: [
          '具有很强的适应能力和灵活性',
          '对复杂的情感体验有独特的理解',
          '能够从多个角度看待关系问题',
          '具有很强的情感感知能力',
          '对他人的困难有深度的同理心'
        ],
        challenges: [
          '可能在亲密和距离之间摇摆不定',
          '情感反应可能会比较强烈和不可预测',
          '可能同时渴望和恐惧亲密关系',
          '在建立关系安全感方面需要更多时间',
          '可能会因为过去的经历而对现在的关系产生影响'
        ]
      }
    }

    return strengthsChallengesMap[style] || strengthsChallengesMap.secure
  }

  private generateCompatibilityAnalysis(style: AttachmentStyle): string[] {
    const compatibilityMap = {
      secure: [
        '与任何依恋类型的人都有较好的相容性',
        '能够帮助焦虑型伴侣建立更多安全感',
        '可以耐心地与回避型伴侣建立情感连接',
        '在与混乱型伴侣的关系中能够提供稳定感',
        '最理想的匹配是与另一个安全型的人建立关系'
      ],
      anxious: [
        '与安全型伴侣的匹配度最高，能够获得所需的安全感',
        '与回避型伴侣可能会形成追逐-疏远的循环模式',
        '与另一个焦虑型的人可能会产生过度情绪化的关系',
        '与混乱型伴侣的关系可能会比较复杂和不稳定',
        '需要选择能够理解和回应情感需求的伴侣'
      ],
      avoidant: [
        '与安全型伴侣的匹配度最高，能够学习更好的情感表达',
        '与焦虑型伴侣可能会感到被过度需要而产生压力',
        '与另一个回避型的人可能会缺乏足够的情感深度',
        '与混乱型伴侣的关系需要更多的耐心和理解',
        '适合与能够尊重个人空间同时提供温暖支持的伴侣在一起'
      ],
      disorganized: [
        '与安全型伴侣的匹配度最高，能够获得稳定的关系基础',
        '与焦虑型伴侣可能会相互触发不安全感',
        '与回避型伴侣可能会因为缺乏情感回应而感到困惑',
        '与另一个混乱型的人关系可能会非常动荡',
        '需要非常有耐心和理解力的伴侣来建立安全的关系'
      ]
    }

    return compatibilityMap[style] || compatibilityMap.secure
  }

  // ===== 支付相关方法 =====
  async createPaymentSession(assessmentId: string): Promise<PaymentSession> {
    // 开发环境模拟支付 - 临时禁用以测试真实Stripe
    if (false && import.meta.env.DEV) {
      console.log('🔧 Development mode: Creating mock payment session')
      
      // 模拟支付会话
      const mockSession = {
        id: `mock_session_${Date.now()}`,
        assessmentId,
        amount: 1990,
        currency: 'cny',
        status: 'pending' as const,
        stripeSessionId: `mock_stripe_${Date.now()}`,
        url: `${window.location.origin}/payment/success?session_id=mock_session&assessment_id=${assessmentId}`,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30分钟后过期
      } as PaymentSession
      
      // 保存会话信息
      const sessions = this.getItem<Record<string, any>>(this.STORAGE_KEYS.sessions) || {}
      sessions[assessmentId] = {
        sessionId: mockSession.id,
        status: 'pending',
        createdAt: new Date(),
        assessmentId
      }
      this.setItem(this.STORAGE_KEYS.sessions, sessions)
      
      console.log('🔧 Mock payment session created:', mockSession)
      return mockSession
    }
    
    // 生产环境实际支付
    try {
      console.log('🔧 Debug: baseUrl =', this.baseUrl)
      console.log('🔧 Debug: VITE_API_BASE_URL =', import.meta.env.VITE_API_BASE_URL)
      const successUrl = `${window.location.origin}/payment/success`
      const cancelUrl = `${window.location.origin}/payment/cancel`
      const requestUrl = `${this.baseUrl}/api/create-payment`
      console.log('🔧 Debug: requestUrl =', requestUrl)
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assessmentId,
          successUrl,
          cancelUrl
        })
      })

      if (!response.ok) {
        throw new Error('支付会话创建失败')
      }

      const data = await response.json()
      const session = data.session
      
      // 保存会话信息
      const sessions = this.getItem<Record<string, any>>(this.STORAGE_KEYS.sessions) || {}
      sessions[assessmentId] = {
        sessionId: session.id,
        status: 'pending',
        createdAt: new Date(),
        assessmentId
      }
      this.setItem(this.STORAGE_KEYS.sessions, sessions)

      return session
    } catch (error) {
      console.error('创建支付会话失败:', error)
      throw error
    }
  }

  async verifyPayment(sessionId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      const result = await response.json()
      
      if (result.success) {
        // 更新本地会话状态
        const sessions = this.getItem<Record<string, any>>(this.STORAGE_KEYS.sessions) || {}
        Object.keys(sessions).forEach(key => {
          if (sessions[key].sessionId === sessionId) {
            sessions[key].status = 'completed'
            sessions[key].paidAt = new Date()
          }
        })
        this.setItem(this.STORAGE_KEYS.sessions, sessions)
      }

      return result
    } catch (error) {
      console.error('支付验证失败:', error)
      return { success: false, error: '支付验证失败' }
    }
  }

  checkPaymentStatus(assessmentId: string): { isPaid: boolean; sessionId?: string } {
    const sessions = this.getItem<Record<string, any>>(this.STORAGE_KEYS.sessions) || {}
    const session = sessions[assessmentId]
    
    return {
      isPaid: session?.status === 'completed',
      sessionId: session?.sessionId
    }
  }

  // ===== 清理方法 =====
  cleanupExpiredData(): void {
    const now = Date.now()
    const expiryTime = 30 * 24 * 60 * 60 * 1000 // 30天

    // 清理过期测评
    const assessments = this.getItem<Record<string, AssessmentData>>(this.STORAGE_KEYS.assessments) || {}
    Object.keys(assessments).forEach(id => {
      const assessment = assessments[id]
      if (now - new Date(assessment.createdAt).getTime() > expiryTime) {
        delete assessments[id]
      }
    })
    this.setItem(this.STORAGE_KEYS.assessments, assessments)

    // 清理过期会话
    const sessions = this.getItem<Record<string, any>>(this.STORAGE_KEYS.sessions) || {}
    Object.keys(sessions).forEach(id => {
      const session = sessions[id]
      if (now - new Date(session.createdAt).getTime() > expiryTime) {
        delete sessions[id]
      }
    })
    this.setItem(this.STORAGE_KEYS.sessions, sessions)
  }
}

// 导出单一服务实例
export const ecrService = new ECRService()
export default ecrService