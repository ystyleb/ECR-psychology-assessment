import { describe, it, expect } from 'vitest'
import { calculationService } from '@/services/calculationService'
import type { AttachmentStyle } from '@/types'

describe('CalculationService', () => {
  describe('calculateAnxiousScore', () => {
    it('应该正确计算焦虑依恋得分', () => {
      // 创建36个回答的数组，所有值为4（中性）
      const responses = new Array(36).fill(4)

      const score = calculationService.calculateAnxiousScore(responses)
      expect(score).toBe(4.0)
    })

    it('应该正确处理反向计分题目', () => {
      // 创建36个回答的数组，所有值为7
      const responses = new Array(36).fill(7)

      // 焦虑维度中的反向计分题目：3, 15, 19, 25, 27, 29, 31, 33, 35
      // 这些题目的得分应该是 8-7=1
      // 其他焦虑题目得分为7
      // 焦虑题目：1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35 (18题)
      // 反向计分的焦虑题目：3, 15, 19, 25, 27, 29, 31, 33, 35 (9题)
      // 正向计分的焦虑题目：1, 5, 7, 9, 11, 13, 17, 21, 23 (9题)
      // 预期得分：(9*7 + 9*1) / 18 = 72/18 = 4.0

      const score = calculationService.calculateAnxiousScore(responses)
      expect(score).toBe(4.0)
    })

    it('应该处理部分缺失的回答', () => {
      const responses = new Array(36).fill(4)
      responses[0] = null // 题目1缺失（焦虑维度）
      responses[2] = null // 题目3缺失（焦虑维度，反向计分）

      // 剩余16个焦虑题目，都是4分
      const score = calculationService.calculateAnxiousScore(responses)
      expect(score).toBe(4.0)
    })

    it('应该在回答数组长度不正确时抛出错误', () => {
      const responses = new Array(35).fill(4)

      expect(() => calculationService.calculateAnxiousScore(responses)).toThrow(
        'Responses array must contain exactly 36 items'
      )
    })

    it('应该在没有有效回答时抛出错误', () => {
      const responses = new Array(36).fill(null)

      expect(() => calculationService.calculateAnxiousScore(responses)).toThrow(
        'No valid responses found for anxious attachment items'
      )
    })
  })

  describe('calculateAvoidantScore', () => {
    it('应该正确计算回避依恋得分', () => {
      const responses = new Array(36).fill(4)

      const score = calculationService.calculateAvoidantScore(responses)
      expect(score).toBe(4.0)
    })

    it('应该正确处理反向计分题目', () => {
      const responses = new Array(36).fill(7)

      // 回避维度中的反向计分题目：22 (1题)
      // 回避题目：2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36 (18题)
      // 预期得分：(17*7 + 1*1) / 18 = 120/18 = 6.7

      const score = calculationService.calculateAvoidantScore(responses)
      expect(score).toBeCloseTo(6.7, 1)
    })

    it('应该在回答数组长度不正确时抛出错误', () => {
      const responses = new Array(35).fill(4)

      expect(() => calculationService.calculateAvoidantScore(responses)).toThrow(
        'Responses array must contain exactly 36 items'
      )
    })
  })

  describe('determineAttachmentStyle', () => {
    it('应该正确识别安全型依恋', () => {
      const style = calculationService.determineAttachmentStyle(3.0, 3.0)
      expect(style).toBe('secure')
    })

    it('应该正确识别焦虑型依恋', () => {
      const style = calculationService.determineAttachmentStyle(5.0, 3.0)
      expect(style).toBe('anxious')
    })

    it('应该正确识别回避型依恋', () => {
      const style = calculationService.determineAttachmentStyle(3.0, 5.0)
      expect(style).toBe('avoidant')
    })

    it('应该正确识别混乱型依恋', () => {
      const style = calculationService.determineAttachmentStyle(5.0, 5.0)
      expect(style).toBe('disorganized')
    })

    it('应该在边界值处正确判断', () => {
      expect(calculationService.determineAttachmentStyle(3.9, 3.9)).toBe('secure')
      expect(calculationService.determineAttachmentStyle(4.0, 3.9)).toBe('anxious')
      expect(calculationService.determineAttachmentStyle(3.9, 4.0)).toBe('avoidant')
      expect(calculationService.determineAttachmentStyle(4.0, 4.0)).toBe('disorganized')
    })
  })

  describe('calculatePercentile', () => {
    it('应该为焦虑维度计算百分位数', () => {
      const percentile = calculationService.calculatePercentile(3.56, 'anxious') // 平均分
      expect(percentile).toBeCloseTo(50, 0) // 应该接近50%
    })

    it('应该为回避维度计算百分位数', () => {
      const percentile = calculationService.calculatePercentile(2.92, 'avoidant') // 平均分
      expect(percentile).toBeCloseTo(50, 0) // 应该接近50%
    })

    it('应该为高分计算较高的百分位数', () => {
      const percentile = calculationService.calculatePercentile(6.0, 'anxious')
      expect(percentile).toBeGreaterThan(80)
    })

    it('应该为低分计算较低的百分位数', () => {
      const percentile = calculationService.calculatePercentile(1.0, 'anxious')
      expect(percentile).toBeLessThan(20)
    })
  })

  describe('calculateReliability', () => {
    it('应该为有效数据计算信度', () => {
      const responses = new Array(36).fill(4)
      const reliability = calculationService.calculateReliability(responses)

      expect(reliability).toBeGreaterThan(0)
      expect(reliability).toBeLessThanOrEqual(1)
    })

    it('应该为数据不足返回0', () => {
      const responses = new Array(5).fill(4)
      const reliability = calculationService.calculateReliability(responses)

      expect(reliability).toBe(0)
    })

    it('应该过滤null和undefined值', () => {
      const responses = new Array(36).fill(4)
      responses[0] = null
      responses[1] = undefined

      const reliability = calculationService.calculateReliability(responses)
      expect(reliability).toBeGreaterThan(0)
    })
  })

  describe('generatePersonalityTraits', () => {
    it('应该为安全型依恋生成特征', () => {
      const traits = calculationService.generatePersonalityTraits('secure', {
        anxious: 3.0,
        avoidant: 3.0
      })

      expect(Array.isArray(traits)).toBe(true)
      expect(traits.length).toBeGreaterThan(0)
      expect(traits).toContain('在关系中感到安全和舒适')
    })

    it('应该为焦虑型依恋生成特征', () => {
      const traits = calculationService.generatePersonalityTraits('anxious', {
        anxious: 5.0,
        avoidant: 3.0
      })

      expect(Array.isArray(traits)).toBe(true)
      expect(traits.length).toBeGreaterThan(0)
      expect(traits).toContain('对关系高度敏感和关注')
    })

    it('应该为回避型依恋生成特征', () => {
      const traits = calculationService.generatePersonalityTraits('avoidant', {
        anxious: 3.0,
        avoidant: 5.0
      })

      expect(Array.isArray(traits)).toBe(true)
      expect(traits.length).toBeGreaterThan(0)
      expect(traits).toContain('重视独立性和自主性')
    })

    it('应该为混乱型依恋生成特征', () => {
      const traits = calculationService.generatePersonalityTraits('disorganized', {
        anxious: 5.0,
        avoidant: 5.0
      })

      expect(Array.isArray(traits)).toBe(true)
      expect(traits.length).toBeGreaterThan(0)
      expect(traits).toContain('在关系中体验到矛盾的情感')
    })
  })

  describe('generateGrowthSuggestions', () => {
    it('应该为每种依恋类型生成成长建议', () => {
      const styles: AttachmentStyle[] = ['secure', 'anxious', 'avoidant', 'disorganized']

      styles.forEach(style => {
        const suggestions = calculationService.generateGrowthSuggestions(style, {
          anxious: 4.0,
          avoidant: 4.0
        })

        expect(Array.isArray(suggestions)).toBe(true)
        expect(suggestions.length).toBeGreaterThan(0)
        expect(suggestions.every(s => typeof s === 'string')).toBe(true)
      })
    })

    it('应该为焦虑型提供情绪调节建议', () => {
      const suggestions = calculationService.generateGrowthSuggestions('anxious', {
        anxious: 5.0,
        avoidant: 3.0
      })

      expect(suggestions.some(s => s.includes('情绪调节'))).toBe(true)
    })

    it('应该为回避型提供情感表达建议', () => {
      const suggestions = calculationService.generateGrowthSuggestions('avoidant', {
        anxious: 3.0,
        avoidant: 5.0
      })

      expect(suggestions.some(s => s.includes('表达情感'))).toBe(true)
    })
  })

  describe('generateCompatibilityAnalysis', () => {
    it('应该为每种依恋类型生成兼容性分析', () => {
      const styles: AttachmentStyle[] = ['secure', 'anxious', 'avoidant', 'disorganized']

      styles.forEach(style => {
        const compatibility = calculationService.generateCompatibilityAnalysis(style)

        expect(Array.isArray(compatibility)).toBe(true)
        expect(compatibility.length).toBeGreaterThan(0)
        expect(compatibility.every(c => typeof c === 'string')).toBe(true)
      })
    })

    it('应该指出安全型与各类型兼容', () => {
      const compatibility = calculationService.generateCompatibilityAnalysis('secure')

      expect(compatibility.some(c => c.includes('各种依恋类型'))).toBe(true)
    })
  })

  describe('validateResponses', () => {
    it('应该验证有效的回答数组', () => {
      const responses = new Array(36).fill(4)
      const result = calculationService.validateResponses(responses)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝非数组输入', () => {
      const result = calculationService.validateResponses(
        'not an array' as unknown as (number | null)[]
      )

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Responses must be an array')
    })

    it('应该拒绝长度不正确的数组', () => {
      const responses = new Array(35).fill(4)
      const result = calculationService.validateResponses(responses)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Responses array must contain exactly 36 items')
    })

    it('应该拒绝超出范围的值', () => {
      const responses = new Array(36).fill(4)
      responses[0] = 8 // 超出范围
      responses[1] = 0 // 超出范围

      const result = calculationService.validateResponses(responses)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('must be between 1 and 7'))).toBe(true)
    })

    it('应该拒绝非数字值', () => {
      const responses = new Array(36).fill(4)
      responses[0] = 'not a number' as unknown as number

      const result = calculationService.validateResponses(responses)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('must be a number'))).toBe(true)
    })

    it('应该要求足够的有效回答', () => {
      const responses = new Array(36).fill(null)
      // 只填入25个有效回答（少于30个）
      for (let i = 0; i < 25; i++) {
        responses[i] = 4
      }

      const result = calculationService.validateResponses(responses)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'At least 30 valid responses are required for reliable calculation'
      )
    })

    it('应该允许null和undefined值', () => {
      const responses = new Array(36).fill(4)
      responses[0] = null
      responses[1] = undefined

      const result = calculationService.validateResponses(responses)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('集成测试', () => {
    it('应该完成完整的计算流程', () => {
      // 创建一个真实的测评场景
      const responses = new Array(36).fill(null)

      // 焦虑维度题目给高分
      const anxiousItems = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]
      anxiousItems.forEach(item => {
        responses[item - 1] = 6 // 高焦虑
      })

      // 回避维度题目给低分
      const avoidantItems = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]
      avoidantItems.forEach(item => {
        responses[item - 1] = 2 // 低回避
      })

      // 验证数据
      const validation = calculationService.validateResponses(responses)
      expect(validation.valid).toBe(true)

      // 计算分数
      const anxiousScore = calculationService.calculateAnxiousScore(responses)
      const avoidantScore = calculationService.calculateAvoidantScore(responses)

      expect(anxiousScore).toBeCloseTo(4.0, 1) // 焦虑分数应该是4.0 (9*6 + 9*2)/18 = 4.0
      expect(avoidantScore).toBeCloseTo(2.2, 1) // 回避分数应该是2.2 (17*2 + 1*6)/18 = 2.2

      // 确定依恋类型
      const attachmentStyle = calculationService.determineAttachmentStyle(
        anxiousScore,
        avoidantScore
      )
      expect(attachmentStyle).toBe('anxious') // 焦虑4.0，回避2.2，焦虑>=4且回避<4，应该是焦虑型

      // 生成报告内容
      const traits = calculationService.generatePersonalityTraits(attachmentStyle, {
        anxious: anxiousScore,
        avoidant: avoidantScore
      })
      const suggestions = calculationService.generateGrowthSuggestions(attachmentStyle, {
        anxious: anxiousScore,
        avoidant: avoidantScore
      })
      const compatibility = calculationService.generateCompatibilityAnalysis(attachmentStyle)

      expect(traits.length).toBeGreaterThan(0)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(compatibility.length).toBeGreaterThan(0)

      // 计算百分位数
      const anxiousPercentile = calculationService.calculatePercentile(anxiousScore, 'anxious')
      const avoidantPercentile = calculationService.calculatePercentile(avoidantScore, 'avoidant')

      expect(anxiousPercentile).toBeGreaterThan(50) // 高于平均
      expect(avoidantPercentile).toBeLessThan(50) // 低于平均

      // 计算信度
      const reliability = calculationService.calculateReliability(responses)
      expect(reliability).toBeGreaterThan(0.5)
    })

    it('应该处理极端分数情况', () => {
      // 全部最高分
      const highResponses = new Array(36).fill(7)

      const highAnxious = calculationService.calculateAnxiousScore(highResponses)
      const highAvoidant = calculationService.calculateAvoidantScore(highResponses)
      const highStyle = calculationService.determineAttachmentStyle(highAnxious, highAvoidant)

      expect(highStyle).toBe('disorganized') // 高焦虑高回避

      // 全部最低分
      const lowResponses = new Array(36).fill(1)

      const lowAnxious = calculationService.calculateAnxiousScore(lowResponses)
      const lowAvoidant = calculationService.calculateAvoidantScore(lowResponses)
      const lowStyle = calculationService.determineAttachmentStyle(lowAnxious, lowAvoidant)

      expect(lowStyle).toBe('anxious') // 全部1分时：焦虑4.0(含反向计分)，回避1.3，为焦虑型
    })
  })
})
