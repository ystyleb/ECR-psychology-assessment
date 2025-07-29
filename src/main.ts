import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 导入全局样式
import './assets/styles/main.css'

// 导入开发者工具禁用脚本
import { disableDevTools } from './utils/devToolsDisabler'

// 生产环境激活开发者工具禁用
disableDevTools()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
