import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { reportService } from '@/services/reportService'
import type { BasicResult, AttachmentScores } from '@/types'

// 模拟 reportCacheService
vi.mock('@/services/reportCacheService', () => ({
  reportCacheService: {
    cacheBasicReport: vi.fn(),
    cacheDetailedReport: vi.fn(),
    getFromMemoryCache: vi.fn(() => null),
    getFromPersistentCache: vi.fn(() => null),
    saveToPersistentCache: vi.fn(),
    clearCache: vi.fn(),
    getCacheStats: vi.fn(() => ({ memorySize: 0, persistentSize: 0 })),
    getCachedBasicReport: vi.fn(() => null),
    getCachedDetailedReport: vi.fn(() => null)
  }
}))

// 模拟 performanceTimer
vi.mock('@/utils/performance', () => ({
  performanceTimer: {
    start: vi.fn(),
    end: vi.fn(() => 1.0)
  }
}))

// 模拟localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

// 替换全局localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('ReportService', () => {
  // 在每个测试前清空localStorage
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // 测试数据
  const mockAssessmentId = 'test_assessment_123'
  const mockBasicResult: BasicResult = {
    attachmentStyle: 'secure',
    anxious: 2.5,
    avoidant: 2.8
  }
  const mockScores: AttachmentScores = {
    anxious: 2.5,
    avoidant: 2.8,
    secure: 4.7
  }
  const mockReliability = 0.85

  describe('generateBasicReport', () => {
    it('应该生成有效的基础报告', () => {
      const report = reportService.generateBasicReport(
        mockAssessmentId,
        mockBasicResult,
        mockScores,
        mockReliability
      )

      // 验证报告基本属性
      expect(report).toBeDefined()
      expect(report.assessmentId).toBe(mockAssessmentId)
      expect(report.type).toBe('basic')
      expect(report.status).toBe('ready')
      expect(report.basicResult).toEqual(mockBasicResult)
      expect(report.reliability).toBe(mockReliability)

      // 验证依恋类型描述
      expect(report.attachmentDescription).toBeDefined()
      expect(report.attachmentDescription.name).toBe('安全型依恋')
      expect(report.attachmentDescription.characteristics).toBeDefined()
      expect(report.attachmentDescription.strengths).toBeDefined()
      expect(report.attachmentDescription.challenges).toBeDefined()

      // 验证百分位数
      expect(report.percentiles).toBeDefined()
      expect(report.percentiles.anxious).toBeGreaterThanOrEqual(0)
      expect(report.percentiles.anxious).toBeLessThanOrEqual(100)
      expect(report.percentiles.avoidant).toBeGreaterThanOrEqual(0)
      expect(report.percentiles.avoidant).toBeLessThanOrEqual(100)
      expect(report.percentiles.secure).toBeGreaterThanOrEqual(0)
      expect(report.percentiles.secure).toBeLessThanOrEqual(100)
    })

    it('应该为不同的依恋类型生成正确的描述', () => {
      // 测试安全型
      const secureReport = reportService.generateBasicReport(
        mockAssessmentId,
        { ...mockBasicResult, attachmentStyle: 'secure' },
        mockScores,
        mockReliability
      )
      expect(secureReport.attachmentDescription.name).toContain('安全型')

      // 测试焦虑型
      const anxiousReport = reportService.generateBasicReport(
        mockAssessmentId,
        { ...mockBasicResult, attachmentStyle: 'anxious' },
        mockScores,
        mockReliability
      )
      expect(anxiousReport.attachmentDescription.name).toContain('焦虑型')

      // 测试回避型
      const avoidantReport = reportService.generateBasicReport(
        mockAssessmentId,
        { ...mockBasicResult, attachmentStyle: 'avoidant' },
        mockScores,
        mockReliability
      )
      expect(avoidantReport.attachmentDescription.name).toContain('回避型')

      // 测试混乱型
      const disorganizedReport = reportService.generateBasicReport(
        mockAssessmentId,
        { ...mockBasicResult, attachmentStyle: 'disorganized' },
        mockScores,
        mockReliability
      )
      expect(disorganizedReport.attachmentDescription.name).toContain('混乱型')
    })

    it('应该正确计算百分位数', () => {
      // 测试高分
      const highScoreReport = reportService.generateBasicReport(
        mockAssessmentId,
        mockBasicResult,
        { anxious: 6.5, avoidant: 6.8, secure: 1.5 },
        mockReliability
      )
      expect(highScoreReport.percentiles.anxious).toBeGreaterThan(90) // 高焦虑分数应该有高百分位
      expect(highScoreReport.percentiles.avoidant).toBeGreaterThan(90) // 高回避分数应该有高百分位
      expect(highScoreReport.percentiles.secure).toBeLessThan(10) // 低安全分数应该有低百分位

      // 测试低分 - 使用更极端的低分以确保百分位数小于10
      const lowScoreReport = reportService.generateBasicReport(
        mockAssessmentId,
        mockBasicResult,
        { anxious: 1.0, avoidant: 1.0, secure: 6.5 },
        mockReliability
      )
      expect(lowScoreReport.percentiles.anxious).toBeLessThan(15) // 低焦虑分数应该有低百分位
      expect(lowScoreReport.percentiles.avoidant).toBeLessThan(15) // 低回避分数应该有低百分位
      expect(lowScoreReport.percentiles.secure).toBeGreaterThan(85) // 高安全分数应该有高百分位
    })

    it('应该将报告保存到localStorage', () => {
      const report = reportService.generateBasicReport(
        mockAssessmentId,
        mockBasicResult,
        mockScores,
        mockReliability
      )

      // 验证报告已保存
      const savedReport = reportService.getReportByAssessmentId(mockAssessmentId)
      expect(savedReport).toBeDefined()
      expect(savedReport?.id).toBe(report.id)
    })
  })

  describe('generateDetailedReport', () => {
    it('应该基于基础报告生成详细报告', () => {
      // 先生成基础报告
      const basicReport = reportService.generateBasicReport(
        mockAssessmentId,
        mockBasicResult,
        mockScores,
        mockReliability
      )

      // 生成详细报告
      const detailedReport = reportService.generateDetailedReport(basicReport)

      // 验证详细报告
      expect(detailedReport).toBeDefined()
      expect(detailedReport.id).toBe(basicReport.id)
      expect(detailedReport.type).toBe('detailed')
      expect(detailedReport.assessmentId).toBe(mockAssessmentId)

      // 验证详细内容
      expect(detailedReport.detailedContent).toBeDefined()
      expect(detailedReport.detailedContent.personalityTraits).toBeDefined()
      expect(detailedReport.detailedContent.relationshipPatterns).toBeDefined()
      expect(detailedReport.detailedContent.growthSuggestions).toBeDefined()
      expect(detailedReport.detailedContent.strengthsAndChallenges).toBeDefined()
      expect(detailedReport.detailedContent.compatibilityAnalysis).toBeDefined()

      // 验证可视化图表
      expect(detailedReport.visualizations).toBeDefined()
      expect(detailedReport.visualizations.length).toBeGreaterThan(0)

      // 验证洞察和建议
      expect(detailedReport.insights).toBeDefined()
      expect(detailedReport.recommendations).toBeDefined()

      // 验证访问信息
      expect(detailedReport.accessInfo).toBeDefined()
      expect(detailedReport.accessInfo.isUnlocked).toBe(false)
    })

    it('应该根据选项生成不同内容的详细报告', () => {
      const basicReport = reportService.generateBasicReport(
        mockAssessmentId,
        mockBasicResult,
        mockScores,
        mockReliability
      )

      const detailedReport = reportService.generateDetailedReport(basicReport)

      expect(detailedReport).toBeDefined()
      expect(detailedReport.type).toBe('detailed')
      expect(detailedReport.detailedContent).toBeDefined()
      expect(detailedReport.detailedContent.personalityTraits).toBeInstanceOf(Array)
      expect(detailedReport.detailedContent.relationshipPatterns).toBeInstanceOf(Array)
      expect(detailedReport.detailedContent.growthSuggestions).toBeInstanceOf(Array)
      expect(detailedReport.detailedContent.strengthsAndChallenges).toBeDefined()
      expect(detailedReport.detailedContent.compatibilityAnalysis).toBeInstanceOf(Array)
      expect(detailedReport.visualizations).toBeInstanceOf(Array)
      expect(detailedReport.visualizations.length).toBeGreaterThan(0)
    })

    it('应该生成正确的可视化图表', () => {
      const basicReport = reportService.generateBasicReport(
        mockAssessmentId,
        mockBasicResult,
        mockScores,
        mockReliability
      )

      const detailedReport = reportService.generateDetailedReport(basicReport)

      expect(detailedReport.visualizations).toHaveLength(2)

      const radarChart = detailedReport.visualizations.find(v => v.type === 'radar')
      const barChart = detailedReport.visualizations.find(v => v.type === 'bar')

      expect(radarChart).toBeDefined()
      expect(radarChart?.title).toBe('依恋维度分析')
      expect(radarChart?.data).toHaveLength(3)

      expect(barChart).toBeDefined()
      expect(barChart?.title).toBe('百分位数对比')
      expect(barChart?.data).toHaveLength(3)
    })
  })

  describe('getReport', () => {
    it('应该能够保存和获取报告', () => {
      const report = reportService.generateBasicReport(
        mockAssessmentId,
        mockBasicResult,
        mockScores,
        mockReliability
      )

      // 通过ID获取报告
      const retrievedReport = reportService.getReport(report.id)
      expect(retrievedReport).toBeDefined()
      expect(retrievedReport?.id).toBe(report.id)
    })

    it('应该能够通过assessmentId获取报告', () => {
      const report = reportService.generateBasicReport(
        mockAssessmentId,
        mockBasicResult,
        mockScores,
        mockReliability
      )

      const retrievedReport = reportService.getReport(report.id)
      expect(retrievedReport).toEqual(report)
    })

    it('应该在报告不存在时返回null', () => {
      const nonExistentReport = reportService.getReport('non-existent-id')
      expect(nonExistentReport).toBeNull()
    })
  })

  describe('getReportByAssessmentId', () => {
    it('应该能够通过评估ID获取报告', () => {
      // const report =
      reportService.generateBasicReport(
        mockAssessmentId,
        mockBasicResult,
        mockScores,
        mockReliability
      )

      // 通过assessmentId获取报告
      const retrievedReport = reportService.getReportByAssessmentId(mockAssessmentId)
      expect(retrievedReport).toBeDefined()
      expect(retrievedReport?.assessmentId).toBe(mockAssessmentId)
    })

    it('对于不存在的报告应该返回null', () => {
      const nonExistentReport = reportService.getReport('non_existent_id')
      expect(nonExistentReport).toBeNull()

      const nonExistentAssessmentReport = reportService.getReportByAssessmentId('non_existent_id')
      expect(nonExistentAssessmentReport).toBeNull()
    })

    it('应该在评估不存在时返回null', () => {
      const nonExistentReport = reportService.getReportByAssessmentId('non-existent-assessment')
      expect(nonExistentReport).toBeNull()
    })
  })

  describe('不同依恋类型的报告生成', () => {
    const testCases = [
      { style: 'secure' as const, anxious: 2.5, avoidant: 2.0 },
      { style: 'anxious' as const, anxious: 5.5, avoidant: 2.0 },
      { style: 'avoidant' as const, anxious: 2.0, avoidant: 5.5 },
      { style: 'disorganized' as const, anxious: 5.5, avoidant: 5.5 }
    ]

    testCases.forEach(({ style, anxious, avoidant }) => {
      it(`应该为${style}类型生成正确的报告`, () => {
        const basicResult: BasicResult = {
          anxious,
          avoidant,
          attachmentStyle: style
        }

        const scores: AttachmentScores = {
          anxious,
          avoidant,
          secure: 7 - Math.max(anxious, avoidant)
        }

        const report = reportService.generateBasicReport(`test-${style}`, basicResult, scores, 0.85)

        expect(report.basicResult.attachmentStyle).toBe(style)
        expect(report.attachmentDescription.name).toContain(
          style === 'secure'
            ? '安全型'
            : style === 'anxious'
              ? '焦虑型'
              : style === 'avoidant'
                ? '回避型'
                : '混乱型'
        )

        // 生成详细报告
        const detailedReport = reportService.generateDetailedReport(report)
        expect(detailedReport.detailedContent.personalityTraits.length).toBeGreaterThan(0)
        expect(detailedReport.detailedContent.growthSuggestions.length).toBeGreaterThan(0)
      })
    })
  })
})
