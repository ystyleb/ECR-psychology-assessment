<template>
  <div class="report-exporter">
    <!-- 导出按钮 -->
    <div class="flex items-center space-x-2">
      <button
        @click="showExportModal = true"
        class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i class="fas fa-download"></i>
        <span>导出报告</span>
      </button>
    </div>

    <!-- 导出模态框 -->
    <div
      v-if="showExportModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeModal"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800">导出报告</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- 导出格式选择 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择格式</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input v-model="exportFormat" type="radio" value="pdf" class="mr-2" />
                <span class="text-sm text-gray-700">PDF文档</span>
              </label>
              <label class="flex items-center">
                <input v-model="exportFormat" type="radio" value="image" class="mr-2" />
                <span class="text-sm text-gray-700">图片格式</span>
              </label>
              <label class="flex items-center">
                <input v-model="exportFormat" type="radio" value="json" class="mr-2" />
                <span class="text-sm text-gray-700">数据文件(JSON)</span>
              </label>
            </div>
          </div>

          <!-- 导出选项 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">导出选项</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input v-model="includeCharts" type="checkbox" class="mr-2" />
                <span class="text-sm text-gray-700">包含图表</span>
              </label>
              <label class="flex items-center">
                <input v-model="includePersonalInfo" type="checkbox" class="mr-2" />
                <span class="text-sm text-gray-700">包含个人信息</span>
              </label>
              <label class="flex items-center">
                <input v-model="addWatermark" type="checkbox" class="mr-2" />
                <span class="text-sm text-gray-700">添加水印</span>
              </label>
            </div>
          </div>

          <!-- 个人信息输入 -->
          <div v-if="includePersonalInfo" class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">个人信息</label>
            <div class="space-y-3">
              <input
                v-model="personalInfo.name"
                type="text"
                placeholder="姓名（可选）"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                v-model="personalInfo.email"
                type="email"
                placeholder="邮箱（可选）"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- 导出按钮 -->
          <div class="flex items-center justify-end space-x-3">
            <button
              @click="closeModal"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              @click="handleExport"
              :disabled="isExporting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isExporting" class="flex items-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                导出中...
              </span>
              <span v-else>确认导出</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DetailedReportData, ReportExportOptions } from '@/types'
import logger from '@/utils/logger'

interface Props {
  report: DetailedReportData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  export: [options: ReportExportOptions, personalInfo?: { name?: string; email?: string }]
}>()

// 响应式状态
const showExportModal = ref(false)
const isExporting = ref(false)
const exportFormat = ref<'pdf' | 'image' | 'json'>('pdf')
const includeCharts = ref(true)
const includePersonalInfo = ref(false)
const addWatermark = ref(true)
const personalInfo = ref({
  name: '',
  email: ''
})

// 方法
const closeModal = () => {
  showExportModal.value = false
  resetForm()
}

const resetForm = () => {
  exportFormat.value = 'pdf'
  includeCharts.value = true
  includePersonalInfo.value = false
  addWatermark.value = true
  personalInfo.value = {
    name: '',
    email: ''
  }
}

const handleExport = async () => {
  try {
    isExporting.value = true

    const exportOptions: ReportExportOptions = {
      format: exportFormat.value,
      includeCharts: includeCharts.value,
      includePersonalInfo: includePersonalInfo.value,
      watermark: addWatermark.value ? 'ECR心理测评系统' : undefined
    }

    const personalData = includePersonalInfo.value
      ? {
          name: personalInfo.value.name || undefined,
          email: personalInfo.value.email || undefined
        }
      : undefined

    emit('export', exportOptions, personalData)

    // 模拟导出过程
    await new Promise(resolve => setTimeout(resolve, 2000))

    closeModal()
  } catch (error) {
    logger.error('Export failed:', error)
  } finally {
    isExporting.value = false
  }
}

// 导出功能实现
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const exportToPDF = async () => {
  // 这里可以使用 jsPDF 或其他PDF生成库
  logger.log('Exporting to PDF...')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const exportToImage = async () => {
  // 这里可以使用 html2canvas 生成图片
  logger.log('Exporting to Image...')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const exportToJSON = async () => {
  const data = {
    report: props.report,
    exportedAt: new Date().toISOString(),
    format: 'json'
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ecr-report-${props.report.id}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.report-exporter {
  @apply relative;
}

/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition: transform 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  transform: scale(0.9) translateY(-20px);
}
</style>
