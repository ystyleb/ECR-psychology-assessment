/**
 * 功能开关服务
 * 提供统一的功能检查和调试工具
 */

import { isFeatureEnabled, getFeatureFlagsStatus, type FeatureFlags } from '@/config/features';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * 条件日志输出类
 * 根据功能开关控制日志是否输出
 */
export class ConditionalLogger {
  /**
   * 调试日志
   */
  static debug(...args: any[]): void {
    if (isFeatureEnabled('enableConsoleLogging') && isFeatureEnabled('enableDebugMode')) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * 信息日志
   */
  static info(...args: any[]): void {
    if (isFeatureEnabled('enableConsoleLogging')) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * 警告日志
   */
  static warn(...args: any[]): void {
    if (isFeatureEnabled('enableConsoleLogging')) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * 错误日志
   */
  static error(...args: any[]): void {
    if (isFeatureEnabled('enableConsoleLogging')) {
      console.error('[ERROR]', ...args);
    }
  }

  /**
   * 性能监控日志
   */
  static performance(label: string, fn: () => void | Promise<void>): void | Promise<void> {
    if (!isFeatureEnabled('enablePerformanceMonitoring')) {
      return typeof fn === 'function' ? fn() : undefined;
    }

    const startTime = performance.now();
    console.time(`[PERF] ${label}`);
    
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        console.timeEnd(`[PERF] ${label}`);
        const endTime = performance.now();
        console.debug(`[PERF] ${label} took ${endTime - startTime} milliseconds`);
      });
    } else {
      console.timeEnd(`[PERF] ${label}`);
      const endTime = performance.now();
      console.debug(`[PERF] ${label} took ${endTime - startTime} milliseconds`);
      return result;
    }
  }

  /**
   * 表格形式输出数据
   */
  static table(data: any, label?: string): void {
    if (isFeatureEnabled('enableConsoleLogging') && isFeatureEnabled('enableDebugMode')) {
      if (label) {
        console.group(`[TABLE] ${label}`);
      }
      console.table(data);
      if (label) {
        console.groupEnd();
      }
    }
  }
}

/**
 * 功能开关服务类
 */
export class FeatureService {
  /**
   * 检查功能是否启用
   */
  static isEnabled(feature: keyof FeatureFlags): boolean {
    return isFeatureEnabled(feature);
  }

  /**
   * 获取所有功能状态
   */
  static getAllFlags(): Record<string, boolean> {
    return getFeatureFlagsStatus();
  }

  /**
   * 调试信息输出
   */
  static debugInfo(): void {
    if (isFeatureEnabled('enableDebugMode')) {
      console.group('🔧 Feature Flags Debug Info');
      console.log('Environment:', import.meta.env.MODE);
      console.log('Build Mode:', import.meta.env.DEV ? 'Development' : 'Production');
      console.table(getFeatureFlagsStatus());
      console.groupEnd();
    }
  }

  /**
   * 条件执行函数
   */
  static when(feature: keyof FeatureFlags, callback: () => void): void {
    if (isFeatureEnabled(feature)) {
      callback();
    }
  }

  /**
   * 条件异步执行函数
   */
  static async whenAsync(feature: keyof FeatureFlags, callback: () => Promise<void>): Promise<void> {
    if (isFeatureEnabled(feature)) {
      await callback();
    }
  }

  /**
   * 功能门控组件渲染判断
   */
  static shouldRender(feature: keyof FeatureFlags): boolean {
    return isFeatureEnabled(feature);
  }

  /**
   * 多功能条件检查
   */
  static allEnabled(...features: (keyof FeatureFlags)[]): boolean {
    return features.every(feature => isFeatureEnabled(feature));
  }

  /**
   * 任一功能启用检查
   */
  static anyEnabled(...features: (keyof FeatureFlags)[]): boolean {
    return features.some(feature => isFeatureEnabled(feature));
  }
}

/**
 * 创建条件渲染的 Vue 组合式函数
 */
export const useFeatureFlag = (feature: keyof FeatureFlags) => {
  const enabled = isFeatureEnabled(feature);
  
  return {
    enabled,
    isEnabled: () => enabled,
    when: (callback: () => void) => {
      if (enabled) callback();
    }
  };
};

/**
 * 全局日志对象，替代直接使用 console
 */
export const logger = ConditionalLogger;

/**
 * 导出功能服务实例
 */
export const features = FeatureService;