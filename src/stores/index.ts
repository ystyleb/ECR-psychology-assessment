// 统一导出store（现在使用单一统一store）
// 为了兼容性，重新导出统一store

import { useAppStore } from '@/store'

// 主要导出
export { useAppStore }

// 兼容性别名
export const useAssessmentStore = useAppStore
export const usePaymentStore = useAppStore
export const useUIStore = useAppStore
export const useUserStore = useAppStore

// 类型导出
export type AppStore = ReturnType<typeof useAppStore>
export type AssessmentStore = AppStore
export type PaymentStore = AppStore
export type UIStore = AppStore
export type UserStore = AppStore

// 全局store初始化函数
export const initializeStores = () => {
  const appStore = useAppStore()
  
  // 初始化统一store
  appStore.init()

  return {
    appStore,
    assessmentStore: appStore,
    uiStore: appStore,
    userStore: appStore
  }
}
