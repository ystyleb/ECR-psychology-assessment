import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Theme,
  Language,
  DeviceType,
  Notification,
  NotificationType,
  LoadingState
} from '@/types'

export const useUIStore = defineStore('ui', () => {
  // 状态
  const theme = ref<Theme>('light')
  const language = ref<Language>('zh-CN')
  const deviceType = ref<DeviceType>('desktop')
  const sidebarCollapsed = ref(false)
  const loading = ref<LoadingState>('idle')
  const notifications = ref<Notification[]>([])
  const modals = ref<Record<string, boolean>>({})
  const drawers = ref<Record<string, boolean>>({})

  // 计算属性
  const isDarkMode = computed(() => theme.value === 'dark')
  const isMobile = computed(() => deviceType.value === 'mobile')
  const isTablet = computed(() => deviceType.value === 'tablet')
  const isDesktop = computed(() => deviceType.value === 'desktop')
  const isLoading = computed(() => loading.value === 'loading')
  const hasNotifications = computed(() => notifications.value.length > 0)
  const unreadNotifications = computed(() => notifications.value.filter(n => !n.read).length)

  // 主题管理
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('ecr_theme', newTheme)
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('ecr_theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }

  // 语言管理
  const setLanguage = (newLanguage: Language) => {
    language.value = newLanguage
    document.documentElement.setAttribute('lang', newLanguage)
    localStorage.setItem('ecr_language', newLanguage)
  }

  const initLanguage = () => {
    const savedLanguage = localStorage.getItem('ecr_language') as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }

  // 设备类型检测
  const detectDeviceType = () => {
    const width = window.innerWidth
    if (width < 768) {
      deviceType.value = 'mobile'
    } else if (width < 1024) {
      deviceType.value = 'tablet'
    } else {
      deviceType.value = 'desktop'
    }
  }

  // 侧边栏管理
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }

  // 加载状态管理
  const setLoading = (state: LoadingState) => {
    loading.value = state
  }

  const startLoading = () => setLoading('loading')
  const stopLoading = () => setLoading('idle')
  const setLoadingSuccess = () => setLoading('success')
  const setLoadingError = () => setLoading('error')

  // 通知管理
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateNotificationId(),
      createdAt: new Date(),
      read: false
    }

    notifications.value.unshift(newNotification)

    // 自动移除非持久化通知
    if (!notification.persistent && notification.duration !== 0) {
      const duration = notification.duration || 5000
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, duration)
    }

    return newNotification.id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const markNotificationAsRead = (id: string) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
  }

  const showToast = (message: string, type: NotificationType = 'info', duration = 3000) => {
    return addNotification({
      type,
      title: message,
      duration,
      persistent: false
    })
  }

  const showSuccess = (message: string) => showToast(message, 'success')
  const showError = (message: string) => showToast(message, 'error', 5000)
  const showWarning = (message: string) => showToast(message, 'warning')
  const showInfo = (message: string) => showToast(message, 'info')

  // 模态框管理
  const openModal = (modalId: string) => {
    modals.value[modalId] = true
  }

  const closeModal = (modalId: string) => {
    modals.value[modalId] = false
  }

  const isModalOpen = (modalId: string) => {
    return modals.value[modalId] || false
  }

  // 抽屉管理
  const openDrawer = (drawerId: string) => {
    drawers.value[drawerId] = true
  }

  const closeDrawer = (drawerId: string) => {
    drawers.value[drawerId] = false
  }

  const isDrawerOpen = (drawerId: string) => {
    return drawers.value[drawerId] || false
  }

  // 工具函数
  const generateNotificationId = () => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 初始化
  const init = () => {
    initTheme()
    initLanguage()
    detectDeviceType()

    // 监听窗口大小变化
    window.addEventListener('resize', detectDeviceType)

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('ecr_theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  return {
    // 状态
    theme,
    language,
    deviceType,
    sidebarCollapsed,
    loading,
    notifications,
    modals,
    drawers,

    // 计算属性
    isDarkMode,
    isMobile,
    isTablet,
    isDesktop,
    isLoading,
    hasNotifications,
    unreadNotifications,

    // 主题管理
    setTheme,
    toggleTheme,

    // 语言管理
    setLanguage,

    // 设备类型
    detectDeviceType,

    // 侧边栏管理
    toggleSidebar,
    setSidebarCollapsed,

    // 加载状态管理
    setLoading,
    startLoading,
    stopLoading,
    setLoadingSuccess,
    setLoadingError,

    // 通知管理
    addNotification,
    removeNotification,
    markNotificationAsRead,
    clearAllNotifications,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // 模态框管理
    openModal,
    closeModal,
    isModalOpen,

    // 抽屉管理
    openDrawer,
    closeDrawer,
    isDrawerOpen,

    // 初始化
    init
  }
})

// 扩展Notification接口以包含read属性
interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  createdAt: Date
  read: boolean
}
