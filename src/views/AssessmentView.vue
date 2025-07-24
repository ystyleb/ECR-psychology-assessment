<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- 页面头部 -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6"
        >
          <i class="fas fa-heart text-white text-2xl"></i>
        </div>
        <h1 class="text-4xl font-bold text-gray-800 mb-4">ECR亲密关系经历量表</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          了解您在亲密关系中的依恋模式，探索更健康的关系模式
        </p>
        <div class="mt-4 text-sm text-gray-500">
          基于 Fraley, Waller & Brennan (2000) 标准化量表
        </div>
      </div>

      <!-- 测评信息卡片 -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-lg p-6 text-center">
          <div
            class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <i class="fas fa-clock text-blue-600 text-xl"></i>
          </div>
          <h3 class="font-semibold text-gray-800 mb-2">测评时长</h3>
          <p class="text-gray-600">10-15分钟</p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6 text-center">
          <div
            class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <i class="fas fa-list-ol text-green-600 text-xl"></i>
          </div>
          <h3 class="font-semibold text-gray-800 mb-2">题目数量</h3>
          <p class="text-gray-600">36题</p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6 text-center">
          <div
            class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <i class="fas fa-chart-pie text-purple-600 text-xl"></i>
          </div>
          <h3 class="font-semibold text-gray-800 mb-2">结果类型</h3>
          <p class="text-gray-600">4种依恋类型</p>
        </div>
      </div>

      <!-- 主要说明卡片 -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">测评说明</h2>
          <div class="grid md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                如何作答
              </h3>
              <div class="space-y-3 text-gray-600">
                <p>• 请根据您在亲密关系中的真实感受作答</p>
                <p>• 使用7点量表：1分（非常不同意）到7分（非常同意）</p>
                <p>• 没有标准答案，请诚实表达您的想法</p>
                <p>• 如果没有恋爱经历，请想象理想的亲密关系</p>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-shield-alt text-green-500 mr-2"></i>
                隐私保护
              </h3>
              <div class="space-y-3 text-gray-600">
                <p>• 所有数据在本地处理，不会上传到服务器</p>
                <p>• 您可以随时删除测评记录</p>
                <p>• 结果仅供个人参考，严格保密</p>
                <p>• 符合相关隐私保护法规要求</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 依恋类型预览 -->
        <div class="border-t pt-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-6 text-center">您将了解的依恋类型</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 class="font-semibold text-green-800 mb-2">安全型依恋</h4>
              <p class="text-sm text-green-700">在关系中感到安全，能够有效沟通和信任他人</p>
            </div>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 class="font-semibold text-yellow-800 mb-2">焦虑型依恋</h4>
              <p class="text-sm text-yellow-700">对关系高度敏感，容易担心被抛弃或拒绝</p>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="font-semibold text-blue-800 mb-2">回避型依恋</h4>
              <p class="text-sm text-blue-700">重视独立性，在情感表达上较为保守</p>
            </div>
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 class="font-semibold text-purple-800 mb-2">混乱型依恋</h4>
              <p class="text-sm text-purple-700">在关系中体验矛盾情感，需要更多自我觉察</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 开始测评按钮 -->
      <div class="text-center mb-8">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">准备好开始了吗？</h3>
            <p class="text-gray-600">请确保您有足够的时间完成测评，中途可以暂停保存</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              @click="startAssessment"
              :disabled="loading"
              class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-play mr-2"></i>
              {{ loading ? '准备中...' : '开始测评' }}
            </button>

            <router-link
              to="/about"
              class="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center"
            >
              <i class="fas fa-info-circle mr-2"></i>
              了解更多关于ECR量表
            </router-link>
          </div>
        </div>
      </div>

      <!-- 免责声明和统计信息 -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 class="font-semibold text-yellow-800 mb-3 flex items-center">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            重要声明
          </h3>
          <div class="text-sm text-yellow-700 space-y-2">
            <p>• 本测评基于科学的心理学研究，结果仅供参考</p>
            <p>• 不能替代专业心理咨询或医疗诊断</p>
            <p>• 如有严重心理困扰，请寻求专业帮助</p>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 class="font-semibold text-blue-800 mb-3 flex items-center">
            <i class="fas fa-chart-bar mr-2"></i>
            测评统计
          </h3>
          <div class="text-sm text-blue-700 space-y-2">
            <p>• 已有 {{ stats.totalUsers }}+ 用户完成测评</p>
            <p>• 平均完成时间：{{ stats.avgTime }} 分钟</p>
            <p>• 测评准确率：{{ stats.accuracy }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useECR } from '@/store'

const router = useRouter()
const store = useECR()

const loading = ref(false)
const stats = ref({
  totalUsers: 1250,
  avgTime: 12,
  accuracy: 95
})

const startAssessment = async () => {
  try {
    loading.value = true
    store.showInfo('正在准备测评...')

    // 创建新的测评会话
    const assessmentId = await store.createNewAssessment()

    // 短暂延迟以显示加载状态
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 跳转到测评详情页面
    router.push(`/assessment/${assessmentId}`)

    store.showSuccess('测评已开始！')
  } catch (error) {
    console.error('Failed to start assessment:', error)
    store.showError('启动测评失败，请重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 页面加载时的初始化逻辑
  console.log('Assessment intro page loaded')
})
</script>
