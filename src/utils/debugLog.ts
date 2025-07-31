/**
 * 统一的调试日志工具
 * 根据功能开关控制是否输出调试信息
 */

import { isFeatureEnabled } from '@/config/features'

export const debugLog = {
  /**
   * 调试信息日志
   */
  log(...args: unknown[]) {
    if (isFeatureEnabled('enableDebugMode') || isFeatureEnabled('enableConsoleLogging')) {
      console.log(...args)
    }
  },

  /**
   * 信息日志
   */
  info(...args: unknown[]) {
    if (isFeatureEnabled('enableDebugMode') || isFeatureEnabled('enableConsoleLogging')) {
      console.info(...args)
    }
  },

  /**
   * 警告日志（总是显示）
   */
  warn(...args: unknown[]) {
    console.warn(...args)
  },

  /**
   * 错误日志（总是显示）
   */
  error(...args: unknown[]) {
    console.error(...args)
  },

  /**
   * 调试信息日志（仅在启用调试模式时显示）
   */
  debug(...args: unknown[]) {
    if (isFeatureEnabled('enableDebugMode')) {
      console.debug(...args)
    }
  },

  /**
   * 分组开始
   */
  group(label: string) {
    if (isFeatureEnabled('enableDebugMode') || isFeatureEnabled('enableConsoleLogging')) {
      console.group(label)
    }
  },

  /**
   * 分组结束
   */
  groupEnd() {
    if (isFeatureEnabled('enableDebugMode') || isFeatureEnabled('enableConsoleLogging')) {
      console.groupEnd()
    }
  },

  /**
   * 表格显示
   */
  table(data: unknown) {
    if (isFeatureEnabled('enableDebugMode') || isFeatureEnabled('enableConsoleLogging')) {
      console.table(data)
    }
  }
}

export default debugLog