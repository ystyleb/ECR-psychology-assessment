// ECR-R量表计算服务
import type { AttachmentStyle, CalculationService } from '@/types'

interface AttachmentScores {
  anxious: number
  avoidant: number
}

class ECRCalculationService implements CalculationService {
  // ECR-R量表的题目配置
  private readonly anxiousItems = [
    1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35
  ]
  private readonly avoidantItems = [
    2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36
  ]
  private readonly reverseItems = [3, 15, 19, 22, 25, 27, 29, 31, 33, 35] // 需要反向计分的题目

  // 计算焦虑依恋得分
  calculateAnxiousScore(responses: number[]): number {
    if (responses.length !== 36) {
      throw new Error('Responses array must contain exactly 36 items')
    }

    let sum = 0
    let validCount = 0

    this.anxiousItems.forEach(itemNumber => {
      const index = itemNumber - 1 // 转换为数组索引
      const response = responses[index]

      if (response !== null && response !== undefined) {
        let score = response

        // 反向计分
        if (this.reverseItems.includes(itemNumber)) {
          score = 8 - response
        }

        sum += score
        validCount++
      }
    })

    if (validCount === 0) {
      throw new Error('No valid responses found for anxious attachment items')
    }

    // 返回平均分，保留一位小数
    return Number((sum / validCount).toFixed(1))
  }

  // 计算回避依恋得分
  calculateAvoidantScore(responses: number[]): number {
    if (responses.length !== 36) {
      throw new Error('Responses array must contain exactly 36 items')
    }

    let sum = 0
    let validCount = 0

    this.avoidantItems.forEach(itemNumber => {
      const index = itemNumber - 1 // 转换为数组索引
      const response = responses[index]

      if (response !== null && response !== undefined) {
        let score = response

        // 反向计分
        if (this.reverseItems.includes(itemNumber)) {
          score = 8 - response
        }

        sum += score
        validCount++
      }
    })

    if (validCount === 0) {
      throw new Error('No valid responses found for avoidant attachment items')
    }

    // 返回平均分，保留一位小数
    return Number((sum / validCount).toFixed(1))
  }

  // 确定依恋类型
  determineAttachmentStyle(anxious: number, avoidant: number): AttachmentStyle {
    // 使用标准的四分类方法
    if (anxious < 4 && avoidant < 4) {
      return 'secure'
    } else if (anxious >= 4 && avoidant < 4) {
      return 'anxious'
    } else if (anxious < 4 && avoidant >= 4) {
      return 'avoidant'
    } else {
      return 'disorganized'
    }
  }

  // 计算百分位数（相对于常模）
  calculatePercentile(score: number, dimension: 'anxious' | 'avoidant'): number {
    // 这里使用简化的常模数据，实际项目中应该使用真实的常模
    const norms = {
      anxious: { mean: 3.56, sd: 1.12 },
      avoidant: { mean: 2.92, sd: 1.25 }
    }

    const norm = norms[dimension]
    const zScore = (score - norm.mean) / norm.sd

    // 简化的百分位计算（正态分布近似）
    const percentile = this.normalCDF(zScore) * 100
    return Math.round(percentile)
  }

  // 计算信度（内部一致性）
  calculateReliability(responses: number[]): number {
    // 简化的Cronbach's Alpha计算
    // 实际项目中应该使用更精确的算法
    const validResponses = responses.filter(r => r !== null && r !== undefined)

    if (validResponses.length < 10) {
      return 0 // 数据不足
    }

    // 计算方差
    const mean = validResponses.reduce((sum, r) => sum + r, 0) / validResponses.length
    const variance =
      validResponses.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / validResponses.length

    // 简化的信度估计
    const reliability = Math.min(0.95, 0.7 + variance / 10)
    return Number(reliability.toFixed(2))
  }

  // 生成个性特征描述
  generatePersonalityTraits(attachmentStyle: AttachmentStyle, _scores: AttachmentScores): string[] {
    const traits: Record<AttachmentStyle, string[]> = {
      secure: [
        '在关系中感到安全和舒适',
        '能够有效表达情感需求',
        '信任伴侣并支持其独立性',
        '具有良好的情绪调节能力',
        '在冲突中寻求建设性解决方案'
      ],
      anxious: [
        '对关系高度敏感和关注',
        '容易担心被抛弃或拒绝',
        '需要频繁的关爱确认',
        '情绪波动较大',
        '倾向于过度分析伴侣的行为'
      ],
      avoidant: [
        '重视独立性和自主性',
        '在情感表达上较为保守',
        '倾向于避免过度亲密',
        '更喜欢理性而非情感化的交流',
        '在压力下倾向于独自处理问题'
      ],
      disorganized: [
        '在关系中体验到矛盾的情感',
        '既渴望亲密又害怕受伤',
        '情绪和行为模式不够稳定',
        '可能在不同情境下表现出不同的依恋行为',
        '需要更多的自我觉察和情绪管理'
      ]
    }

    return traits[attachmentStyle] || []
  }

  // 生成成长建议
  generateGrowthSuggestions(attachmentStyle: AttachmentStyle, _scores: AttachmentScores): string[] {
    const suggestions: Record<AttachmentStyle, string[]> = {
      secure: [
        '继续保持开放和诚实的沟通',
        '在关系中保持适度的独立性',
        '支持伴侣的个人成长',
        '在冲突时保持冷静和理解',
        '分享您的关系智慧帮助他人'
      ],
      anxious: [
        '练习自我安抚和情绪调节技巧',
        '培养独立的兴趣爱好和社交圈',
        '学会识别和挑战负面思维模式',
        '与伴侣建立清晰的沟通边界',
        '考虑寻求专业心理咨询支持'
      ],
      avoidant: [
        '练习表达情感和需求',
        '逐步增加与伴侣的情感分享',
        '学会接受和给予支持',
        '探索对亲密关系的恐惧来源',
        '培养情感敏感性和共情能力'
      ],
      disorganized: [
        '寻求专业心理咨询师的帮助',
        '学习情绪识别和管理技巧',
        '探索早期依恋经历的影响',
        '建立稳定的自我关怀习惯',
        '在安全的关系中练习信任'
      ]
    }

    return suggestions[attachmentStyle] || []
  }

  // 生成兼容性分析
  generateCompatibilityAnalysis(attachmentStyle: AttachmentStyle): string[] {
    const compatibility: Record<AttachmentStyle, string[]> = {
      secure: [
        '与各种依恋类型都能建立良好关系',
        '能够帮助不安全依恋的伴侣获得安全感',
        '在关系中起到稳定和支持的作用'
      ],
      anxious: [
        '与安全型伴侣关系最为和谐',
        '需要避免与回避型形成追逐-逃避模式',
        '与同样焦虑型的伴侣可能产生情绪放大效应'
      ],
      avoidant: [
        '与安全型伴侣能够逐步建立信任',
        '与焦虑型伴侣容易产生冲突模式',
        '与同样回避型的伴侣可能缺乏情感连接'
      ],
      disorganized: [
        '最需要安全型伴侣的稳定支持',
        '在关系中需要更多的耐心和理解',
        '建议在个人成长后再建立长期关系'
      ]
    }

    return compatibility[attachmentStyle] || []
  }

  // 正态分布累积分布函数（简化版）
  private normalCDF(z: number): number {
    // 使用近似公式计算标准正态分布的累积概率
    const t = 1 / (1 + 0.2316419 * Math.abs(z))
    const d = 0.3989423 * Math.exp((-z * z) / 2)
    const prob =
      d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))

    return z > 0 ? 1 - prob : prob
  }

  // 验证响应数据的完整性
  validateResponses(responses: number[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!Array.isArray(responses)) {
      errors.push('Responses must be an array')
      return { valid: false, errors }
    }

    if (responses.length !== 36) {
      errors.push('Responses array must contain exactly 36 items')
    }

    responses.forEach((response, index) => {
      if (response !== null && response !== undefined) {
        if (typeof response !== 'number') {
          errors.push(`Response at index ${index} must be a number`)
        } else if (response < 1 || response > 7) {
          errors.push(`Response at index ${index} must be between 1 and 7`)
        }
      }
    })

    const validResponseCount = responses.filter(r => r !== null && r !== undefined).length
    if (validResponseCount < 30) {
      errors.push('At least 30 valid responses are required for reliable calculation')
    }

    return { valid: errors.length === 0, errors }
  }
}

// 创建单例实例
export const calculationService = new ECRCalculationService()

// 导出类型和实例
export type { CalculationService, AttachmentScores }
export default calculationService
