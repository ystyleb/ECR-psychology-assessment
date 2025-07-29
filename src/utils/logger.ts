/**
 * 日志工具类
 * 在生产环境中自动禁用日志输出
 */

const isDev = import.meta.env.DEV

export const logger = {
  log: (message?: any, ...optionalParams: any[]) => {
    if (isDev) {
      console.log(message, ...optionalParams)
    }
  },
  
  warn: (message?: any, ...optionalParams: any[]) => {
    if (isDev) {
      console.warn(message, ...optionalParams)
    }
  },
  
  error: (message?: any, ...optionalParams: any[]) => {
    if (isDev) {
      console.error(message, ...optionalParams)
    }
  },
  
  info: (message?: any, ...optionalParams: any[]) => {
    if (isDev) {
      console.info(message, ...optionalParams)
    }
  },
  
  debug: (message?: any, ...optionalParams: any[]) => {
    if (isDev) {
      console.debug(message, ...optionalParams)
    }
  }
}

// 默认导出
export default logger