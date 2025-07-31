import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { 
  ConditionalLogger, 
  FeatureService, 
  useFeatureFlag, 
  logger, 
  features 
} from '@/services/featureService'

// Mock 功能开关配置
vi.mock('@/config/features', () => ({
  isFeatureEnabled: vi.fn(),
  getFeatureFlagsStatus: vi.fn(() => ({
    enableDebugMode: true,
    enableConsoleLogging: true,
    enablePerformanceMonitoring: true,
    enableTestFeatures: false
  }))
}))

// Mock console 方法
const mockConsole = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  table: vi.fn(),
  time: vi.fn(),
  timeEnd: vi.fn(),
  group: vi.fn(),
  groupEnd: vi.fn(),
  log: vi.fn()
}

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => 100)
}

describe('功能开关服务测试', () => {
  let originalConsole: any
  let originalPerformance: any
  
  beforeEach(() => {
    // 保存原始对象
    originalConsole = { ...console }
    originalPerformance = global.performance
    
    // 替换为 mock 对象
    Object.assign(console, mockConsole)
    global.performance = mockPerformance as any
    
    // 清理所有 mock 调用记录
    vi.clearAllMocks()
  })

  afterEach(() => {
    // 恢复原始对象
    Object.assign(console, originalConsole)
    global.performance = originalPerformance
  })

  describe('ConditionalLogger 条件日志测试', () => {
    beforeEach(() => {
      const { isFeatureEnabled } = await import('@/config/features')
      vi.mocked(isFeatureEnabled).mockImplementation((feature) => {
        const enabledFeatures = {
          enableConsoleLogging: true,
          enableDebugMode: true,
          enablePerformanceMonitoring: true
        }
        return enabledFeatures[feature] || false
      })
    })

    it('启用控制台日志时应该输出 debug 信息', () => {
      ConditionalLogger.debug('测试调试信息', { data: 'test' })
      
      expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG]', '测试调试信息', { data: 'test' })
    })

    it('启用控制台日志时应该输出 info 信息', () => {
      ConditionalLogger.info('测试信息')
      
      expect(mockConsole.info).toHaveBeenCalledWith('[INFO]', '测试信息')
    })

    it('启用控制台日志时应该输出 warn 信息', () => {
      ConditionalLogger.warn('警告信息')
      
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN]', '警告信息')
    })

    it('启用控制台日志时应该输出 error 信息', () => {
      ConditionalLogger.error('错误信息')
      
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR]', '错误信息')
    })

    it('关闭控制台日志时不应该输出任何信息', async () => {
      const { isFeatureEnabled } = await import('@/config/features')
      vi.mocked(isFeatureEnabled).mockReturnValue(false)

      ConditionalLogger.debug('不应该输出的调试信息')
      ConditionalLogger.info('不应该输出的信息')
      ConditionalLogger.warn('不应该输出的警告')
      ConditionalLogger.error('不应该输出的错误')

      expect(mockConsole.debug).not.toHaveBeenCalled()
      expect(mockConsole.info).not.toHaveBeenCalled()
      expect(mockConsole.warn).not.toHaveBeenCalled()
      expect(mockConsole.error).not.toHaveBeenCalled()
    })

    it('应该正确输出表格数据', () => {
      const testData = { name: '测试', value: 123 }
      ConditionalLogger.table(testData, '测试表格')

      expect(mockConsole.group).toHaveBeenCalledWith('[TABLE] 测试表格')
      expect(mockConsole.table).toHaveBeenCalledWith(testData)
      expect(mockConsole.groupEnd).toHaveBeenCalled()
    })

    it('不提供标签时应该直接输出表格', () => {
      const testData = { name: '测试' }
      ConditionalLogger.table(testData)

      expect(mockConsole.group).not.toHaveBeenCalled()
      expect(mockConsole.table).toHaveBeenCalledWith(testData)
      expect(mockConsole.groupEnd).not.toHaveBeenCalled()
    })
  })

  describe('性能监控测试', () => {
    beforeEach(() => {
      const { isFeatureEnabled } = await import('@/config/features')
      vi.mocked(isFeatureEnabled).mockImplementation((feature) => {
        return feature === 'enablePerformanceMonitoring'
      })
      
      mockPerformance.now.mockReturnValueOnce(100).mockReturnValueOnce(200)
    })

    it('启用性能监控时应该记录同步函数执行时间', () => {
      const testFn = vi.fn(() => 'result')
      
      const result = ConditionalLogger.performance('测试函数', testFn)
      
      expect(testFn).toHaveBeenCalled()
      expect(result).toBe('result')
      expect(mockConsole.time).toHaveBeenCalledWith('[PERF] 测试函数')
      expect(mockConsole.timeEnd).toHaveBeenCalledWith('[PERF] 测试函数')
    })

    it('启用性能监控时应该记录异步函数执行时间', async () => {
      const testAsyncFn = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return 'async result'
      })
      
      const result = await ConditionalLogger.performance('异步测试函数', testAsyncFn)
      
      expect(testAsyncFn).toHaveBeenCalled()
      expect(result).toBe('async result')
      expect(mockConsole.time).toHaveBeenCalledWith('[PERF] 异步测试函数')
      expect(mockConsole.timeEnd).toHaveBeenCalledWith('[PERF] 异步测试函数')
    })

    it('关闭性能监控时应该正常执行函数但不记录性能', async () => {
      const { isFeatureEnabled } = await import('@/config/features')
      vi.mocked(isFeatureEnabled).mockReturnValue(false)
      
      const testFn = vi.fn(() => 'result')
      
      const result = ConditionalLogger.performance('测试函数', testFn)
      
      expect(testFn).toHaveBeenCalled()
      expect(result).toBe('result')
      expect(mockConsole.time).not.toHaveBeenCalled()
      expect(mockConsole.timeEnd).not.toHaveBeenCalled()
    })
  })

  describe('FeatureService 功能服务测试', () => {
    beforeEach(() => {
      const { isFeatureEnabled, getFeatureFlagsStatus } = await import('@/config/features')
      
      vi.mocked(isFeatureEnabled).mockImplementation((feature) => {
        const enabledFeatures = {
          enableDebugMode: true,
          enableTestFeatures: false,
          enablePayment: true,
          enableStripePayment: true
        }
        return enabledFeatures[feature] || false
      })

      vi.mocked(getFeatureFlagsStatus).mockReturnValue({
        enableDebugMode: true,
        enableTestFeatures: false,
        enablePayment: true,
        enableStripePayment: true
      })
    })

    it('isEnabled 应该正确返回功能状态', () => {
      expect(FeatureService.isEnabled('enableDebugMode')).toBe(true)
      expect(FeatureService.isEnabled('enableTestFeatures')).toBe(false)
    })

    it('getAllFlags 应该返回所有功能状态', () => {
      const flags = FeatureService.getAllFlags()
      
      expect(flags).toEqual({
        enableDebugMode: true,
        enableTestFeatures: false,
        enablePayment: true,
        enableStripePayment: true
      })
    })

    it('debugInfo 应该在启用调试模式时输出调试信息', () => {
      FeatureService.debugInfo()
      
      expect(mockConsole.group).toHaveBeenCalledWith('🔧 Feature Flags Debug Info')
      expect(mockConsole.log).toHaveBeenCalledWith('Environment:', undefined)
      expect(mockConsole.table).toHaveBeenCalled()
      expect(mockConsole.groupEnd).toHaveBeenCalled()
    })

    it('when 应该在功能启用时执行回调', () => {
      const callback = vi.fn()
      
      FeatureService.when('enableDebugMode', callback)
      expect(callback).toHaveBeenCalled()
      
      FeatureService.when('enableTestFeatures', callback)
      expect(callback).toHaveBeenCalledTimes(1) // 不应该再次调用
    })

    it('whenAsync 应该在功能启用时执行异步回调', async () => {
      const asyncCallback = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })
      
      await FeatureService.whenAsync('enableDebugMode', asyncCallback)
      expect(asyncCallback).toHaveBeenCalled()
      
      await FeatureService.whenAsync('enableTestFeatures', asyncCallback)
      expect(asyncCallback).toHaveBeenCalledTimes(1) // 不应该再次调用
    })

    it('shouldRender 应该正确返回是否应该渲染', () => {
      expect(FeatureService.shouldRender('enableDebugMode')).toBe(true)
      expect(FeatureService.shouldRender('enableTestFeatures')).toBe(false)
    })

    it('allEnabled 应该正确检查所有功能是否启用', () => {
      expect(FeatureService.allEnabled('enablePayment', 'enableStripePayment')).toBe(true)
      expect(FeatureService.allEnabled('enablePayment', 'enableTestFeatures')).toBe(false)
    })

    it('anyEnabled 应该正确检查是否有任一功能启用', () => {
      expect(FeatureService.anyEnabled('enablePayment', 'enableTestFeatures')).toBe(true)
      expect(FeatureService.anyEnabled('enableTestFeatures')).toBe(false)
    })
  })

  describe('useFeatureFlag 组合式函数测试', () => {
    it('应该返回正确的功能状态和辅助方法', async () => {
      const { isFeatureEnabled } = await import('@/config/features')
      vi.mocked(isFeatureEnabled).mockReturnValue(true)
      
      const { enabled, isEnabled, when } = useFeatureFlag('enableDebugMode')
      
      expect(enabled).toBe(true)
      expect(isEnabled()).toBe(true)
      
      const callback = vi.fn()
      when(callback)
      expect(callback).toHaveBeenCalled()
    })

    it('功能关闭时不应该执行回调', async () => {
      const { isFeatureEnabled } = await import('@/config/features')
      vi.mocked(isFeatureEnabled).mockReturnValue(false)
      
      const { enabled, when } = useFeatureFlag('enableTestFeatures')
      
      expect(enabled).toBe(false)
      
      const callback = vi.fn()
      when(callback)
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('导出对象测试', () => {
    it('logger 应该是 ConditionalLogger 的引用', () => {
      expect(logger).toBe(ConditionalLogger)
    })

    it('features 应该是 FeatureService 的引用', () => {
      expect(features).toBe(FeatureService)
    })
  })
})