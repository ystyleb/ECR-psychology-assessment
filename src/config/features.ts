/**
 * 功能开关配置文件
 * 通过环境变量控制功能的启用/禁用，便于不同环境下的功能管理
 */

export interface FeatureFlags {
  // 调试和开发功能
  enableDebugMode: boolean;
  enableDevelopmentTools: boolean;
  enableConsoleLogging: boolean;
  enablePerformanceMonitoring: boolean;
  
  // 测试功能
  enableTestFeatures: boolean;
  enableMockData: boolean;
  enableBetaFeatures: boolean;
  
  // 支付功能
  enablePayment: boolean;
  enableStripePayment: boolean;
  
  // 报告功能
  enableDetailedReport: boolean;
  enableReportSharing: boolean;
  enableReportExport: boolean;
  
  // 监控和分析
  enableSentryLogging: boolean;
  enableUserTracking: boolean;
  enableAccessLogging: boolean;
}

/**
 * 从环境变量读取功能开关配置
 * 生产环境默认关闭调试和测试功能
 */
export const featureFlags: FeatureFlags = {
  // 调试功能 - 生产环境默认关闭
  enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  enableDevelopmentTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true',
  enableConsoleLogging: import.meta.env.VITE_ENABLE_CONSOLE_LOGGING === 'true',
  enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false',
  
  // 测试功能 - 生产环境默认关闭
  enableTestFeatures: import.meta.env.VITE_ENABLE_TEST_FEATURES === 'true',
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  enableBetaFeatures: import.meta.env.VITE_ENABLE_BETA_FEATURES === 'true',
  
  // 支付功能 - 默认开启
  enablePayment: import.meta.env.VITE_ENABLE_PAYMENT !== 'false',
  enableStripePayment: import.meta.env.VITE_ENABLE_STRIPE_PAYMENT !== 'false',
  
  // 报告功能 - 默认开启
  enableDetailedReport: import.meta.env.VITE_ENABLE_DETAILED_REPORT !== 'false',
  enableReportSharing: import.meta.env.VITE_ENABLE_REPORT_SHARING !== 'false',
  enableReportExport: import.meta.env.VITE_ENABLE_REPORT_EXPORT !== 'false',
  
  // 监控功能 - 默认开启
  enableSentryLogging: import.meta.env.VITE_ENABLE_SENTRY_LOGGING !== 'false',
  enableUserTracking: import.meta.env.VITE_ENABLE_USER_TRACKING !== 'false',
  enableAccessLogging: import.meta.env.VITE_ENABLE_ACCESS_LOGGING !== 'false',
};

/**
 * 开发环境特殊处理
 * 在开发模式下，默认开启调试功能
 */
if (import.meta.env.DEV) {
  // 开发环境下，如果没有明确设置，则默认开启调试功能
  if (import.meta.env.VITE_ENABLE_DEBUG_MODE === undefined) {
    (featureFlags as Record<string, unknown>).enableDebugMode = true;
  }
  if (import.meta.env.VITE_ENABLE_DEV_TOOLS === undefined) {
    (featureFlags as Record<string, unknown>).enableDevelopmentTools = true;
  }
  if (import.meta.env.VITE_ENABLE_CONSOLE_LOGGING === undefined) {
    (featureFlags as Record<string, unknown>).enableConsoleLogging = true;
  }
}

/**
 * 功能开关辅助函数
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return featureFlags[feature];
};

/**
 * 批量检查功能开关
 */
export const areAllFeaturesEnabled = (...features: (keyof FeatureFlags)[]): boolean => {
  return features.every(feature => featureFlags[feature]);
};

/**
 * 检查是否有任一功能开启
 */
export const isAnyFeatureEnabled = (...features: (keyof FeatureFlags)[]): boolean => {
  return features.some(feature => featureFlags[feature]);
};

/**
 * 获取当前环境的功能开关状态（调试用）
 */
export const getFeatureFlagsStatus = (): Record<string, boolean> => {
  if (isFeatureEnabled('enableDebugMode')) {
    console.table(featureFlags);
  }
  return { ...featureFlags };
};

/**
 * 环境类型检查
 */
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;