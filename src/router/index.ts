import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAppStore } from '@/store'
import { canAccessBasicReport, canAccessDetailedReport } from '@/utils/reportAccess'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'ECR心理测评系统'
      }
    },
    {
      path: '/assessment',
      name: 'assessment',
      component: () => import('../views/AssessmentView.vue'),
      meta: {
        title: '开始测评'
      }
    },
    {
      path: '/assessment/:id',
      name: 'assessment-detail',
      component: () => import('../views/AssessmentDetailView.vue'),
      meta: {
        title: '测评进行中'
      }
    },
    {
      path: '/report/:id',
      name: 'report',
      component: () => import('../views/ReportView.vue'),
      meta: {
        title: '测评报告',
        requiresAssessment: true
      }
    },
    {
      path: '/report/:id/detailed',
      name: 'detailed-report',
      component: () => import('../views/DetailedReportView.vue'),
      meta: {
        title: '详细报告',
        requiresAssessment: true,
        requiresPayment: true
      }
    },
    {
      path: '/payment/success',
      name: 'payment-success',
      component: () => import('../views/PaymentSuccessView.vue'),
      meta: {
        title: '支付成功'
      }
    },
    {
      path: '/payment/cancel',
      name: 'payment-cancel',
      component: () => import('../views/PaymentCancelView.vue'),
      meta: {
        title: '支付取消'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: '关于我们'
      }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/PrivacyView.vue'),
      meta: {
        title: '隐私政策'
      }
    },
    {
      path: '/404',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: {
        title: '页面未找到'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ]
})

// 路由守卫
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // 验证测评详情页面的访问权限
  if (to.name === 'assessment-detail') {
    const assessmentId = to.params.id as string
    console.log('🛡️ Router Guard: Checking assessment-detail access for ID:', assessmentId)
    
    const appStore = useAppStore()
    const hasAssessment = appStore.hasAssessment(assessmentId)
    
    console.log('🛡️ Router Guard: hasAssessment result:', hasAssessment)
    console.log('🛡️ Router Guard: Current assessment in store:', appStore.currentAssessment)

    if (!hasAssessment) {
      console.log('🛡️ Router Guard: Assessment not found, redirecting to /assessment')
      // 如果测评不存在，重定向到测评开始页面
      next({ name: 'assessment' })
      return
    } else {
      console.log('🛡️ Router Guard: Assessment found, allowing access')
    }
  }

  // 验证报告页面的访问权限
  if (to.name === 'report') {
    const assessmentId = to.params.id as string

    if (!(await canAccessBasicReport(assessmentId))) {
      // 如果无法访问基础报告，重定向到测评页面
      next({ name: 'assessment' })
      return
    }
  }

  // 验证详细报告页面的访问权限
  if (to.name === 'detailed-report') {
    const assessmentId = to.params.id as string

    if (!(await canAccessBasicReport(assessmentId))) {
      // 如果无法访问基础报告，重定向到测评页面
      next({ name: 'assessment' })
      return
    }

    if (!(await canAccessDetailedReport(assessmentId))) {
      // 如果无法访问详细报告，重定向到基础报告页面
      next({ name: 'report', params: { id: assessmentId } })
      return
    }
  }

  next()
})

// 路由后置守卫 - 页面加载完成后的处理
router.afterEach((to: RouteLocationNormalized) => {
  // 页面切换时滚动到顶部
  window.scrollTo(0, 0)

  // 可以在这里添加页面访问统计等逻辑
  console.log(`Navigated to: ${to.path}`)
})

export default router
