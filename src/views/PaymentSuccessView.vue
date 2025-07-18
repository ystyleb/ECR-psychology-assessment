<template>
  <div
    class="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4"
  >
    <div class="max-w-md mx-auto text-center">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div
          class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <i class="fas fa-check text-green-600 text-3xl"></i>
        </div>

        <h1 class="text-2xl font-bold text-gray-800 mb-4">支付成功！</h1>
        <p class="text-gray-600 mb-8">感谢您的购买，详细报告已为您解锁</p>

        <div class="space-y-4">
          <router-link
            :to="`/report/${assessmentId}`"
            class="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            查看详细报告
          </router-link>

          <router-link
            to="/"
            class="block w-full bg-gray-100 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all duration-300"
          >
            返回首页
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const assessmentId = ref('')

onMounted(() => {
  // 从URL参数或localStorage获取assessmentId
  assessmentId.value = (route.query.assessment_id as string) || 'default'
})
</script>
