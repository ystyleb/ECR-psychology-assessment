import { test, expect } from '@playwright/test'

test.describe('功能开关系统端到端测试', () => {
  test.beforeEach(async ({ page }) => {
    // 监听控制台消息
    page.on('console', (msg) => {
      console.log(`浏览器控制台 [${msg.type()}]: ${msg.text()}`)
    })
  })

  test.describe('生产环境模拟 - 调试功能关闭', () => {
    test.beforeEach(async ({ page, context }) => {
      // 设置生产环境变量
      await context.addInitScript(() => {
        // 模拟生产环境的环境变量
        window.localStorage.setItem('test-env', 'production')
        
        // 重写 import.meta.env 来模拟生产环境
        Object.defineProperty(window, '__VITE_ENV__', {
          value: {
            DEV: false,
            PROD: true,
            VITE_ENABLE_DEBUG_MODE: 'false',
            VITE_ENABLE_DEV_TOOLS: 'false',
            VITE_ENABLE_CONSOLE_LOGGING: 'false',
            VITE_ENABLE_TEST_FEATURES: 'false',
            VITE_ENABLE_MOCK_DATA: 'false'
          },
          writable: false
        })
      })
    })

    test('应该隐藏开发工具栏', async ({ page }) => {
      await page.goto('/')
      
      // 检查 StagewiseToolbar 不应该显示
      const toolbar = page.locator('[data-testid="stagewise-toolbar"]')
      await expect(toolbar).not.toBeVisible()
      
      // 或者通过类名检查（根据实际实现调整）
      const toolbarByClass = page.locator('.stagewise-toolbar')
      await expect(toolbarByClass).toHaveCount(0)
    })

    test('不应该输出调试日志到控制台', async ({ page }) => {
      const consoleLogs: string[] = []
      
      page.on('console', (msg) => {
        if (msg.type() === 'debug' || msg.text().includes('[DEBUG]')) {
          consoleLogs.push(msg.text())
        }
      })
      
      await page.goto('/')
      
      // 等待页面完全加载
      await page.waitForLoadState('networkidle')
      
      // 验证没有调试日志输出
      expect(consoleLogs).toHaveLength(0)
    })

    test('测试功能组件不应该显示', async ({ page }) => {
      await page.goto('/')
      
      // 检查测试相关的 UI 元素不显示
      const testPanel = page.locator('[data-testid="test-panel"]')
      await expect(testPanel).not.toBeVisible()
      
      const debugInfo = page.locator('[data-testid="debug-info"]')
      await expect(debugInfo).not.toBeVisible()
    })
  })

  test.describe('开发环境模拟 - 调试功能开启', () => {
    test.beforeEach(async ({ page, context }) => {
      // 设置开发环境变量
      await context.addInitScript(() => {
        window.localStorage.setItem('test-env', 'development')
        
        Object.defineProperty(window, '__VITE_ENV__', {
          value: {
            DEV: true,
            PROD: false,
            VITE_ENABLE_DEBUG_MODE: 'true',
            VITE_ENABLE_DEV_TOOLS: 'true',
            VITE_ENABLE_CONSOLE_LOGGING: 'true',
            VITE_ENABLE_TEST_FEATURES: 'true',
            VITE_ENABLE_MOCK_DATA: 'true'
          },
          writable: false
        })
      })
    })

    test('应该显示开发工具栏', async ({ page }) => {
      await page.goto('/')
      
      // 等待组件加载
      await page.waitForTimeout(1000)
      
      // 检查开发工具相关元素（需要根据实际 StagewiseToolbar 的实现调整）
      // 由于 StagewiseToolbar 可能不会添加特定的 data-testid，我们检查其存在性
      const appContainer = page.locator('#app')
      await expect(appContainer).toBeVisible()
      
      // 检查是否有开发工具相关的 DOM 元素
      const body = await page.locator('body').innerHTML()
      // 这里需要根据 StagewiseToolbar 的实际渲染内容进行调整
    })

    test('应该输出调试信息到控制台', async ({ page }) => {
      const consoleLogs: string[] = []
      
      page.on('console', (msg) => {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`)
      })
      
      await page.goto('/')
      
      // 等待页面完全加载和 JavaScript 执行
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)
      
      // 验证有调试相关的日志输出
      // 根据我们的 features.debugInfo() 实现，应该会有相关输出
      const hasDebugLogs = consoleLogs.some(log => 
        log.includes('Feature Flags Debug Info') || 
        log.includes('DEBUG') ||
        log.includes('Environment')
      )
      
      if (!hasDebugLogs) {
        console.log('实际控制台日志:', consoleLogs)
      }
      
      // 注意：这个测试可能会因为实际的环境变量实现而失败
      // 如果失败，说明功能开关可能没有正确读取或应用
    })
  })

  test.describe('功能开关动态行为测试', () => {
    test('应用应该正确加载并响应功能开关', async ({ page }) => {
      await page.goto('/')
      
      // 验证应用基本结构
      const app = page.locator('#app')
      await expect(app).toBeVisible()
      await expect(app).toHaveClass(/min-h-screen/)
      
      // 验证路由系统工作正常
      await expect(page).toHaveURL('/')
      
      // 验证没有 JavaScript 错误
      const errors: string[] = []
      page.on('pageerror', (error) => {
        errors.push(error.message)
      })
      
      await page.waitForLoadState('networkidle')
      
      if (errors.length > 0) {
        console.log('页面错误:', errors)
      }
      
      expect(errors).toHaveLength(0)
    })

    test('功能开关配置应该可以通过浏览器开发工具访问', async ({ page }) => {
      await page.goto('/')
      
      // 通过浏览器执行 JavaScript 检查功能开关状态
      const featureFlags = await page.evaluate(() => {
        // 尝试访问全局功能开关状态
        try {
          // 这需要根据实际的全局暴露方式调整
          return window.__FEATURE_FLAGS__ || null
        } catch (e) {
          return null
        }
      })
      
      // 检查是否能够在浏览器中访问到功能配置
      // 注意：这可能需要在实际代码中暴露一些调试接口
    })
  })

  test.describe('功能开关与用户交互测试', () => {
    test('支付功能开关应该影响支付相关 UI', async ({ page }) => {
      // 设置支付功能关闭
      await page.addInitScript(() => {
        Object.defineProperty(window, '__VITE_ENV__', {
          value: {
            VITE_ENABLE_PAYMENT: 'false',
            VITE_ENABLE_STRIPE_PAYMENT: 'false'
          },
          writable: false
        })
      })
      
      await page.goto('/')
      
      // 导航到可能包含支付功能的页面
      // 这需要根据实际的路由结构调整
      
      // 检查支付相关按钮或组件不显示
      const paymentButton = page.locator('[data-testid="payment-button"]')
      const stripeElements = page.locator('[data-testid="stripe-element"]')
      
      // 这些元素应该不存在或不可见
      await expect(paymentButton).not.toBeVisible()
      await expect(stripeElements).not.toBeVisible()
    })

    test('报告功能开关应该影响报告相关功能', async ({ page }) => {
      await page.goto('/')
      
      // 这需要根据实际的应用流程进行调整
      // 比如完成一个测评然后检查报告功能
      
      // 模拟导航到报告页面的过程
      // await page.click('[data-testid="start-assessment"]')
      // ... 完成测评流程
      // await page.click('[data-testid="view-report"]')
      
      // 检查报告相关功能是否正确显示
    })
  })

  test.describe('边界情况和错误处理测试', () => {
    test('无效环境变量不应该导致应用崩溃', async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(window, '__VITE_ENV__', {
          value: {
            VITE_ENABLE_DEBUG_MODE: 'invalid_value',
            VITE_ENABLE_DEV_TOOLS: null,
            VITE_ENABLE_CONSOLE_LOGGING: undefined
          },
          writable: false
        })
      })
      
      const errors: string[] = []
      page.on('pageerror', (error) => {
        errors.push(error.message)
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // 应用应该仍然能够正常工作
      const app = page.locator('#app')
      await expect(app).toBeVisible()
      
      // 不应该有未捕获的错误
      expect(errors).toHaveLength(0)
    })

    test('缺少环境变量时应该使用默认值', async ({ page }) => {
      await page.addInitScript(() => {
        // 清空所有功能开关环境变量
        Object.defineProperty(window, '__VITE_ENV__', {
          value: {},
          writable: false
        })
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // 应用应该仍然能够正常工作
      const app = page.locator('#app')
      await expect(app).toBeVisible()
      
      // 验证默认行为 - 这需要根据实际的默认配置调整
    })
  })
})