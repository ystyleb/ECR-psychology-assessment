import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserPreferences, BrowserInfo, DeviceType } from '@/types'

export const useUserStore = defineStore('user', () => {
  // 状态
  const preferences = ref<UserPreferences>({
    theme: 'light',
    language: 'zh-CN',
    notifications: true,
    autoSave: true,
    dataRetention: 30
  })

  const browserInfo = ref<BrowserInfo | null>(null)
  const sessionId = ref<string>('')
  const lastActiveAt = ref<Date>(new Date())
  const consentGiven = ref<boolean>(false)
  const privacyPolicyAccepted = ref<boolean>(false)

  // 计算属性
  const isFirstVisit = computed(() => !localStorage.getItem('ecr_user_preferences'))
  const sessionDuration = computed(() => {
    return Date.now() - (sessionId.value ? parseInt(sessionId.value.split('_')[1]) : Date.now())
  })

  // 用户偏好管理
  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    preferences.value = { ...preferences.value, ...newPreferences }
    savePreferences()
  }

  const resetPreferences = () => {
    preferences.value = {
      theme: 'light',
      language: 'zh-CN',
      notifications: true,
      autoSave: true,
      dataRetention: 30
    }
    savePreferences()
  }

  const savePreferences = () => {
    localStorage.setItem('ecr_user_preferences', JSON.stringify(preferences.value))
  }

  const loadPreferences = () => {
    const saved = localStorage.getItem('ecr_user_preferences')
    if (saved) {
      try {
        preferences.value = { ...preferences.value, ...JSON.parse(saved) }
      } catch (error) {
        console.error('Failed to load user preferences:', error)
      }
    }
  }

  // 浏览器信息检测
  const detectBrowserInfo = (): BrowserInfo => {
    const userAgent = navigator.userAgent
    const platform = navigator.platform

    // 简化的浏览器检测
    let browserName = 'Unknown'
    let browserVersion = 'Unknown'

    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome'
      const match = userAgent.match(/Chrome\/(\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox'
      const match = userAgent.match(/Firefox\/(\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
    } else if (userAgent.includes('Safari')) {
      browserName = 'Safari'
      const match = userAgent.match(/Version\/(\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge'
      const match = userAgent.match(/Edge\/(\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
    }

    // 操作系统检测
    let os = 'Unknown'
    if (platform.includes('Win')) os = 'Windows'
    else if (platform.includes('Mac')) os = 'macOS'
    else if (platform.includes('Linux')) os = 'Linux'
    else if (userAgent.includes('Android')) os = 'Android'
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS'

    // 设备类型检测
    let device: DeviceType = 'desktop'
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
      device = 'mobile'
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      device = 'tablet'
    }

    return {
      name: browserName,
      version: browserVersion,
      os,
      device,
      userAgent
    }
  }

  // 会话管理
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const startSession = () => {
    sessionId.value = generateSessionId()
    lastActiveAt.value = new Date()
    localStorage.setItem('ecr_session_id', sessionId.value)
  }

  const updateLastActive = () => {
    lastActiveAt.value = new Date()
  }

  const endSession = () => {
    localStorage.removeItem('ecr_session_id')
    sessionId.value = ''
  }

  // 隐私和同意管理
  const giveConsent = () => {
    consentGiven.value = true
    localStorage.setItem('ecr_consent_given', 'true')
  }

  const revokeConsent = () => {
    consentGiven.value = false
    localStorage.removeItem('ecr_consent_given')
    // 清除所有用户数据
    clearAllUserData()
  }

  const acceptPrivacyPolicy = () => {
    privacyPolicyAccepted.value = true
    localStorage.setItem('ecr_privacy_accepted', 'true')
  }

  const loadConsentStatus = () => {
    consentGiven.value = localStorage.getItem('ecr_consent_given') === 'true'
    privacyPolicyAccepted.value = localStorage.getItem('ecr_privacy_accepted') === 'true'
  }

  // 数据管理
  const exportUserData = () => {
    return {
      preferences: preferences.value,
      browserInfo: browserInfo.value,
      sessionInfo: {
        sessionId: sessionId.value,
        lastActiveAt: lastActiveAt.value,
        sessionDuration: sessionDuration.value
      },
      consent: {
        consentGiven: consentGiven.value,
        privacyPolicyAccepted: privacyPolicyAccepted.value
      },
      exportedAt: new Date()
    }
  }

  const clearAllUserData = () => {
    // 清除localStorage中的用户数据
    const keysToRemove = [
      'ecr_user_preferences',
      'ecr_session_id',
      'ecr_consent_given',
      'ecr_privacy_accepted',
      'ecr_assessments',
      'ecr_unlocked_reports',
      'ecr_theme',
      'ecr_language'
    ]

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    // 重置状态
    resetPreferences()
    endSession()
    consentGiven.value = false
    privacyPolicyAccepted.value = false
  }

  // 数据保留策略
  const cleanupOldData = () => {
    const retentionDays = preferences.value.dataRetention
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    // 这里可以实现清理逻辑
    // 例如删除超过保留期的测评数据
    console.log(`Cleaning up data older than ${retentionDays} days (before ${cutoffDate})`)
  }

  // 初始化
  const init = () => {
    loadPreferences()
    loadConsentStatus()
    browserInfo.value = detectBrowserInfo()

    // 恢复会话或创建新会话
    const savedSessionId = localStorage.getItem('ecr_session_id')
    if (savedSessionId) {
      sessionId.value = savedSessionId
    } else {
      startSession()
    }

    // 设置定期清理任务
    if (preferences.value.dataRetention > 0) {
      setInterval(cleanupOldData, 24 * 60 * 60 * 1000) // 每天检查一次
    }

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        updateLastActive()
      }
    })

    // 监听页面卸载
    window.addEventListener('beforeunload', () => {
      updateLastActive()
    })
  }

  return {
    // 状态
    preferences,
    browserInfo,
    sessionId,
    lastActiveAt,
    consentGiven,
    privacyPolicyAccepted,

    // 计算属性
    isFirstVisit,
    sessionDuration,

    // 偏好管理
    updatePreferences,
    resetPreferences,

    // 会话管理
    startSession,
    updateLastActive,
    endSession,

    // 隐私和同意
    giveConsent,
    revokeConsent,
    acceptPrivacyPolicy,

    // 数据管理
    exportUserData,
    clearAllUserData,
    cleanupOldData,

    // 初始化
    init
  }
})
