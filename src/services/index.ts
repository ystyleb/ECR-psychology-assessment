// 统一导出所有服务

import logger from '@/utils/logger'

// 导出服务实例
export { default as storageService } from './storageService'
export { default as calculationService } from './calculationService'
export { default as assessmentService } from './assessmentService'
export { default as paymentService } from './paymentService'

// 导出服务类型
export type { StorageService } from './storageService'
export type { CalculationService } from './calculationService'
export type { AssessmentService } from './assessmentService'
export type { PaymentService } from './paymentService'

// 服务工厂类
import { storageService } from './storageService'
import { calculationService } from './calculationService'
import { assessmentService } from './assessmentService'
import { paymentService } from './paymentService'

export class ServiceFactory {
  static createStorageService() {
    return storageService
  }

  static createCalculationService() {
    return calculationService
  }

  static createAssessmentService() {
    return assessmentService
  }

  static createPaymentService() {
    return paymentService
  }

  // 获取所有服务的实例
  static getAllServices() {
    return {
      storage: storageService,
      calculation: calculationService,
      assessment: assessmentService,
      payment: paymentService
    }
  }

  // 初始化所有服务
  static async initializeServices() {
    try {
      // 清理过期数据
      storageService.cleanupExpiredData()

      // 清理过期支付会话
      await paymentService.cleanupExpiredSessions()

      logger.log('All services initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize services:', error)
    }
  }
}

// 服务状态检查
export const checkServiceHealth = async () => {
  const health = {
    storage: false,
    calculation: false,
    assessment: false,
    payment: false
  }

  try {
    // 检查存储服务
    const testKey = `health_check_${Date.now()}`
    storageService.setItem(testKey, 'test')
    const testValue = storageService.getItem(testKey)
    storageService.removeItem(testKey)
    health.storage = testValue === 'test'

    // 检查计算服务
    const testResponses = new Array(36).fill(4)
    const scores = calculationService.calculateAnxiousScore(testResponses)
    health.calculation = typeof scores === 'number'

    // 检查测评服务
    const questions = await assessmentService.getQuestions()
    health.assessment = Array.isArray(questions)

    // 检查支付服务
    const sessions = await paymentService.getOrderHistory()
    health.payment = Array.isArray(sessions)
  } catch (error) {
    logger.error('Service health check failed:', error)
  }

  return health
}

// 服务配置
export const serviceConfig = {
  storage: {
    encryptionEnabled: true,
    compressionEnabled: false,
    maxStorageSize: 5 * 1024 * 1024 // 5MB
  },
  assessment: {
    autoSave: true,
    validationEnabled: true,
    cacheQuestions: true
  },
  payment: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    retryAttempts: 3,
    cleanupInterval: 60 * 60 * 1000 // 1 hour
  },
  calculation: {
    precision: 1, // 小数点后位数
    validationStrict: true,
    cacheResults: false
  }
}

// 服务事件总线（简化版）
class ServiceEventBus {
  private listeners: Map<string, Function[]> = new Map()

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event: string, data?: unknown) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          logger.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }
}

export const serviceEventBus = new ServiceEventBus()

// 服务监控
export const startServiceMonitoring = () => {
  // 定期健康检查
  setInterval(
    async () => {
      const health = await checkServiceHealth()
      serviceEventBus.emit('health-check', health)

      const unhealthyServices = Object.entries(health)
        .filter(([_, healthy]) => !healthy)
        .map(([service]) => service)

      if (unhealthyServices.length > 0) {
        logger.warn('Unhealthy services detected:', unhealthyServices)
        serviceEventBus.emit('service-unhealthy', unhealthyServices)
      }
    },
    5 * 60 * 1000
  ) // 每5分钟检查一次

  // 定期清理
  setInterval(() => {
    storageService.cleanupExpiredData()
    serviceEventBus.emit('cleanup-completed')
  }, serviceConfig.payment.cleanupInterval)
}

// 默认导出服务工厂
export default ServiceFactory
