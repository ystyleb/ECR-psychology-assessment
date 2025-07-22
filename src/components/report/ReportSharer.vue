<template>
  <div class="report-sharer">
    <!-- 分享按钮 -->
    <button
      @click="showShareModal = true"
      class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      <i class="fas fa-share"></i>
      <span>分享报告</span>
    </button>

    <!-- 分享模态框 -->
    <div
      v-if="showShareModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeModal"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800">分享报告</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- 分享选项 -->
          <div class="space-y-4">
            <!-- 链接分享 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">分享链接</h4>
              <div class="flex items-center space-x-2">
                <input
                  ref="linkInput"
                  :value="shareUrl"
                  readonly
                  class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                />
                <button
                  @click="copyLink"
                  class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i class="fas fa-copy"></i>
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">复制链接分享给朋友</p>
            </div>

            <!-- 社交媒体分享 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-700 mb-3">社交媒体</h4>
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="shareToWeChat"
                  class="flex items-center justify-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <i class="fab fa-weixin"></i>
                  <span class="text-sm">微信</span>
                </button>

                <button
                  @click="shareToWeibo"
                  class="flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <i class="fab fa-weibo"></i>
                  <span class="text-sm">微博</span>
                </button>

                <button
                  @click="shareToQQ"
                  class="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <i class="fab fa-qq"></i>
                  <span class="text-sm">QQ</span>
                </button>

                <button
                  @click="shareToTwitter"
                  class="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  <i class="fab fa-twitter"></i>
                  <span class="text-sm">Twitter</span>
                </button>
              </div>
            </div>

            <!-- 二维码分享 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-700 mb-3">二维码分享</h4>
              <div class="flex items-center justify-center">
                <div
                  ref="qrCodeContainer"
                  class="w-32 h-32 bg-white border border-gray-200 rounded-lg flex items-center justify-center"
                >
                  <canvas ref="qrCanvas" class="w-full h-full"></canvas>
                </div>
              </div>
              <p class="text-xs text-gray-500 text-center mt-2">扫描二维码查看报告</p>
            </div>

            <!-- 隐私设置 -->
            <div class="bg-yellow-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-yellow-700 mb-2">隐私提醒</h4>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input v-model="shareSettings.includePersonalData" type="checkbox" class="mr-2" />
                  <span class="text-sm text-yellow-700">包含个人数据</span>
                </label>
                <label class="flex items-center">
                  <input v-model="shareSettings.allowPublicAccess" type="checkbox" class="mr-2" />
                  <span class="text-sm text-yellow-700">允许公开访问</span>
                </label>
              </div>
              <p class="text-xs text-yellow-600 mt-2">
                请注意保护您的隐私，谨慎分享包含个人信息的报告
              </p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center justify-end space-x-3 mt-6">
            <button
              @click="closeModal"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <div
      v-if="showSuccessMessage"
      class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
    >
      <i class="fas fa-check mr-2"></i>
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { DetailedReportData } from '@/types'

interface Props {
  report: DetailedReportData
  baseUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  baseUrl: window.location.origin
})

const emit = defineEmits<{
  share: [platform: string, url: string]
}>()

// 响应式状态
const showShareModal = ref(false)
const showSuccessMessage = ref(false)
const successMessage = ref('')
const linkInput = ref<HTMLInputElement>()
const qrCanvas = ref<HTMLCanvasElement>()

const shareSettings = ref({
  includePersonalData: false,
  allowPublicAccess: false
})

// 计算属性
const shareUrl = computed(() => {
  const baseUrl = props.baseUrl
  const reportPath = `/report/${props.report.assessmentId}/detailed`
  return `${baseUrl}${reportPath}`
})

const shareText = computed(() => {
  const attachmentType = props.report.attachmentDescription.title
  return `我刚完成了ECR依恋测评，结果是${attachmentType}。快来看看我的详细报告！`
})

// 生命周期
onMounted(() => {
  generateQRCode()
})

// 方法
const closeModal = () => {
  showShareModal.value = false
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    showSuccess('链接已复制到剪贴板')
  } catch (error) {
    // 降级方案
    if (linkInput.value) {
      linkInput.value.select()
      document.execCommand('copy')
      showSuccess('链接已复制到剪贴板')
    }
  }
}

const shareToWeChat = () => {
  // 微信分享通常需要微信SDK
  showSuccess('请复制链接手动分享到微信')
  copyLink()
  emit('share', 'wechat', shareUrl.value)
}

const shareToWeibo = () => {
  const url = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl.value)}&title=${encodeURIComponent(shareText.value)}`
  window.open(url, '_blank')
  emit('share', 'weibo', shareUrl.value)
}

const shareToQQ = () => {
  const url = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl.value)}&title=${encodeURIComponent(shareText.value)}`
  window.open(url, '_blank')
  emit('share', 'qq', shareUrl.value)
}

const shareToTwitter = () => {
  const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareText.value)}`
  window.open(url, '_blank')
  emit('share', 'twitter', shareUrl.value)
}

const generateQRCode = async () => {
  if (!qrCanvas.value) return

  try {
    // 这里可以使用 qrcode 库生成二维码
    // 为了简化，这里只是显示一个占位符
    const ctx = qrCanvas.value.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, 128, 128)
      ctx.fillStyle = '#6b7280'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('二维码', 64, 64)
    }
  } catch (error) {
    console.error('Failed to generate QR code:', error)
  }
}

const showSuccess = (message: string) => {
  successMessage.value = message
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

// 原生分享API支持检测
const supportsNativeShare = computed(() => {
  return 'share' in navigator
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const nativeShare = async () => {
  if (!supportsNativeShare.value) return

  try {
    await navigator.share({
      title: 'ECR依恋测评报告',
      text: shareText.value,
      url: shareUrl.value
    })
    emit('share', 'native', shareUrl.value)
  } catch (error) {
    console.error('Native share failed:', error)
  }
}
</script>

<style scoped>
.report-sharer {
  @apply relative;
}

/* 成功消息动画 */
.success-message-enter-active,
.success-message-leave-active {
  transition: all 0.3s ease;
}

.success-message-enter-from,
.success-message-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
