/**
 * 全局日志包装器
 * 用于在项目中替换直接的 console 调用
 * 根据功能开关控制日志输出
 */

import { logger } from '@/services/featureService';

// 重新导出 logger 方法，便于全局使用
export const {
  debug,
  info,
  warn,
  error,
  table,
  performance
} = logger;

/**
 * 默认导出 logger 对象
 * 使用方式：
 * import log from '@/utils/logger'
 * log.debug('调试信息')
 */
export default logger;