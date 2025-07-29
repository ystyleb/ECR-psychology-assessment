/**
 * 生产环境开发者工具禁用脚本
 * 仅在生产环境中激活，多重防护机制
 */

export function disableDevTools() {
  if (!import.meta.env.PROD) {
    return // 仅在生产环境激活
  }

  // 1. 禁用Vue DevTools
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__ = undefined
    // @ts-ignore
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__ = {
      Vue: () => {},
      emit: () => {},
      on: () => {},
      once: () => {},
      off: () => {},
      appRecords: []
    }
  }

  // 2. 禁用控制台方法
  const noop = () => {}
  const consoleKeys = ['log', 'debug', 'info', 'warn', 'error', 'assert', 'clear', 'count', 'countReset', 'group', 'groupEnd', 'time', 'timeEnd', 'timeLog', 'trace', 'dir', 'dirxml', 'table']
  
  consoleKeys.forEach(key => {
    // @ts-ignore
    if (window.console[key]) {
      // @ts-ignore
      window.console[key] = noop
    }
  })

  // 3. 禁用右键菜单
  document.addEventListener('contextmenu', e => {
    e.preventDefault()
    return false
  })

  // 4. 禁用开发者工具快捷键
  document.addEventListener('keydown', e => {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && e.key === 'U')) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  })

  // 5. 检测开发者工具打开状态
  let devtools = {
    open: false,
    orientation: null as string | null
  }

  const threshold = 160

  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true
        // 清空页面内容并显示警告
        document.body.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: white;
            z-index: 999999;
          ">
            <div style="
              background: rgba(255,255,255,0.1);
              padding: 40px;
              border-radius: 20px;
              text-align: center;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255,255,255,0.2);
            ">
              <h1 style="margin-bottom: 20px; font-size: 28px;">🔒 访问受限</h1>
              <p style="margin-bottom: 15px; font-size: 18px;">检测到开发者工具已打开</p>
              <p style="margin-bottom: 30px; font-size: 16px; opacity: 0.9;">请关闭开发者工具后刷新页面继续访问</p>
              <button onclick="location.reload()" style="
                background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                color: white;
                font-size: 16px;
                cursor: pointer;
                transition: transform 0.2s;
              " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                刷新页面
              </button>
            </div>
          </div>
        `
      }
    } else {
      devtools.open = false
    }
  }, 500)

  // 6. 防止通过console执行代码
  Object.defineProperty(window, 'console', {
    value: console,
    writable: false,
    configurable: false
  })

  // 7. 清除定时器引用（防止通过控制台清除检测）
  const originalSetInterval = window.setInterval
  const originalSetTimeout = window.setTimeout
  const originalRequestAnimationFrame = window.requestAnimationFrame

  // 禁用debugger语句
  window.eval = function() {
    throw new Error('eval is disabled')
  }

  // 8. 检测异常调试行为
  let start = +new Date()
  let isDebugging = false
  
  setInterval(() => {
    const check = +new Date() - start
    if (check > 100 && !isDebugging) {
      isDebugging = true
      // 可以在这里添加更多反调试逻辑
    }
    start = +new Date()
  }, 1)
}

export default disableDevTools