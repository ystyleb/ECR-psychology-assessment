// 统一导出所有stores

export { useAssessmentStore } from './assessment'
export { usePaymentStore } from './payment'
export { useUIStore } from './ui'
export { useUserStore } from './user'

// 导出store类型（如果需要）
export type { AssessmentStore } from './assessment'
export type { PaymentStore } from './payment'
export type { UIStore } from './ui'
export type { UserStore } from './user'

// 为了类型推导，我们需要定义这些类型
import type { useAssessmentStore } from './assessment'
import type { usePaymentStore } from './payment'
import type { useUIStore } from './ui'
import type { useUserStore } from './user'

export type AssessmentStore = ReturnType<typeof useAssessmentStore>
export type PaymentStore = ReturnType<typeof usePaymentStore>
export type UIStore = ReturnType<typeof useUIStore>
export type UserStore = ReturnType<typeof useUserStore>

// 全局store初始化函数
export const initializeStores = () => {
  const assessmentStore = useAssessmentStore()
  const uiStore = useUIStore()
  const userStore = useUserStore()

  // 初始化各个store
  assessmentStore.init()
  uiStore.init()
  userStore.init()

  return {
    assessmentStore,
    uiStore,
    userStore
  }
}
