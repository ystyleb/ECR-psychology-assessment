<template>
  <div class="recommendation-card" :class="cardClasses">
    <div class="card-header">
      <div class="priority-indicator" :class="priorityClasses">
        <component :is="priorityIcon" class="w-4 h-4" />
      </div>
      <div class="header-content">
        <h3 class="recommendation-title">{{ title }}</h3>
        <p class="recommendation-category">{{ category }}</p>
      </div>
      <div class="header-meta">
        <div v-if="difficulty" class="difficulty-badge" :class="difficultyClasses">
          {{ difficultyText }}
        </div>
        <div v-if="timeframe" class="timeframe">{{ timeframe }}</div>
      </div>
    </div>

    <div class="card-content">
      <!-- 建议描述 -->
      <div class="recommendation-description">
        <p class="description-text">{{ description }}</p>
      </div>

      <!-- 具体步骤 -->
      <div v-if="steps && steps.length > 0" class="steps-section">
        <h4 class="section-title">实施步骤</h4>
        <div class="steps-list">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="step-item"
            :class="{ 'completed': completedSteps.includes(index) }"
          >
            <div class="step-marker">
              <div v-if="completedSteps.includes(index)" class="step-check">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div v-else class="step-number">{{ index + 1 }}</div>
            </div>
            <div class="step-content">
              <p class="step-text">{{ step }}</p>
              <button 
                v-if="!completedSteps.includes(index)"
                @click="markStepCompleted(index)"
                class="mark-complete-btn"
              >
                标记完成
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 预期效果 -->
      <div v-if="expectedOutcome" class="outcome-section">
        <h4 class="section-title">预期效果</h4>
        <div class="outcome-content">
          <div class="outcome-icon">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="outcome-text">{{ expectedOutcome }}</p>
        </div>
      </div>

      <!-- 相关资源 -->
      <div v-if="resources && resources.length > 0" class="resources-section">
        <h4 class="section-title">推荐资源</h4>
        <div class="resources-list">
          <a 
            v-for="(resource, index) in resources" 
            :key="index"
            :href="resource.url"
            :target="resource.external ? '_blank' : '_self'"
            class="resource-item"
          >
            <div class="resource-icon">
              <component :is="getResourceIcon(resource.type)" class="w-4 h-4" />
            </div>
            <div class="resource-content">
              <span class="resource-title">{{ resource.title }}</span>
              <span class="resource-type">{{ resource.type }}</span>
            </div>
            <div class="resource-action">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </div>
          </a>
        </div>
      </div>

      <!-- 进度跟踪 -->
      <div v-if="showProgress && steps && steps.length > 0" class="progress-section">
        <h4 class="section-title">完成进度</h4>
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="progress-text">
          {{ completedSteps.length }} / {{ steps.length }} 已完成 ({{ progressPercentage }}%)
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="feedback-section">
        <span class="feedback-label">这个建议有用吗？</span>
        <div class="feedback-buttons">
          <button 
            @click="handleFeedback(true)"
            class="feedback-btn"
            :class="{ 'active': feedback === true }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
          </button>
          <button 
            @click="handleFeedback(false)"
            class="feedback-btn"
            :class="{ 'active': feedback === false }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="action-buttons">
        <button 
          v-if="showBookmark"
          @click="handleBookmark"
          class="action-btn secondary"
          :class="{ 'bookmarked': isBookmarked }"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
          </svg>
          {{ isBookmarked ? '已收藏' : '收藏' }}
        </button>
        <button 
          v-if="showReminder"
          @click="handleReminder"
          class="action-btn primary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          设置提醒
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Resource {
  title: string
  type: 'article' | 'video' | 'book' | 'exercise' | 'app'
  url: string
  external?: boolean
}

interface Props {
  title: string
  category: string
  description: string
  steps?: string[]
  expectedOutcome?: string
  resources?: Resource[]
  priority?: 'high' | 'medium' | 'low'
  difficulty?: 'easy' | 'medium' | 'hard'
  timeframe?: string
  showProgress?: boolean
  showBookmark?: boolean
  showReminder?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  priority: 'medium',
  difficulty: 'medium',
  showProgress: true,
  showBookmark: true,
  showReminder: true
})

// 响应式状态
const completedSteps = ref<number[]>([])
const feedback = ref<boolean | null>(null)
const isBookmarked = ref(false)

// 计算属性
const cardClasses = computed(() => ({
  [`priority-${props.priority}`]: true,
  [`difficulty-${props.difficulty}`]: true
}))

const priorityClasses = computed(() => ({
  'high-priority': props.priority === 'high',
  'medium-priority': props.priority === 'medium',
  'low-priority': props.priority === 'low'
}))

const difficultyClasses = computed(() => ({
  'easy-difficulty': props.difficulty === 'easy',
  'medium-difficulty': props.difficulty === 'medium',
  'hard-difficulty': props.difficulty === 'hard'
}))

const priorityIcon = computed(() => {
  const icons = {
    high: 'HighPriorityIcon',
    medium: 'MediumPriorityIcon',
    low: 'LowPriorityIcon'
  }
  return icons[props.priority] || 'MediumPriorityIcon'
})

const difficultyText = computed(() => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[props.difficulty] || '中等'
})

const progressPercentage = computed(() => {
  if (!props.steps || props.steps.length === 0) return 0
  return Math.round((completedSteps.value.length / props.steps.length) * 100)
})

// 方法
const markStepCompleted = (index: number) => {
  if (!completedSteps.value.includes(index)) {
    completedSteps.value.push(index)
    completedSteps.value.sort((a, b) => a - b)
  }
}

const getResourceIcon = (type: Resource['type']) => {
  const icons = {
    article: 'ArticleIcon',
    video: 'VideoIcon',
    book: 'BookIcon',
    exercise: 'ExerciseIcon',
    app: 'AppIcon'
  }
  return icons[type] || 'ArticleIcon'
}

const handleFeedback = (positive: boolean) => {
  feedback.value = positive
  
  // 发送反馈到后端或本地存储
  const feedbackData = {
    recommendationTitle: props.title,
    positive,
    timestamp: new Date().toISOString()
  }
  
  const existingFeedback = localStorage.getItem('recommendation_feedback') || '[]'
  const feedbackList = JSON.parse(existingFeedback)
  feedbackList.push(feedbackData)
  localStorage.setItem('recommendation_feedback', JSON.stringify(feedbackList))
}

const handleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
  
  const bookmarkData = {
    title: props.title,
    category: props.category,
    description: props.description,
    bookmarkedAt: new Date().toISOString()
  }
  
  const bookmarks = localStorage.getItem('bookmarked_recommendations') || '[]'
  const bookmarkList = JSON.parse(bookmarks)
  
  if (isBookmarked.value) {
    bookmarkList.push(bookmarkData)
  } else {
    const index = bookmarkList.findIndex((b: any) => b.title === props.title)
    if (index > -1) {
      bookmarkList.splice(index, 1)
    }
  }
  
  localStorage.setItem('bookmarked_recommendations', JSON.stringify(bookmarkList))
}

const handleReminder = () => {
  // 实现提醒设置逻辑
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        // 设置定时提醒
        const reminderTime = new Date()
        reminderTime.setDate(reminderTime.getDate() + 1) // 明天提醒
        
        setTimeout(() => {
          new Notification('ECR建议提醒', {
            body: `记得实施这个建议：${props.title}`,
            icon: '/favicon.ico'
          })
        }, reminderTime.getTime() - Date.now())
      }
    })
  }
}
</script>

<style scoped>
.recommendation-card {
  @apply bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-300;
}

.recommendation-card:hover {
  @apply shadow-md transform -translate-y-1;
}

.recommendation-card.priority-high {
  @apply border-red-200;
}

.recommendation-card.priority-medium {
  @apply border-blue-200;
}

.recommendation-card.priority-low {
  @apply border-gray-200;
}

.card-header {
  @apply flex items-start justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100;
}

.priority-indicator {
  @apply w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0;
}

.priority-indicator.high-priority {
  @apply bg-red-100 text-red-600;
}

.priority-indicator.medium-priority {
  @apply bg-blue-100 text-blue-600;
}

.priority-indicator.low-priority {
  @apply bg-gray-100 text-gray-600;
}

.header-content {
  @apply flex-1;
}

.recommendation-title {
  @apply text-lg font-semibold text-gray-800 mb-1;
}

.recommendation-category {
  @apply text-sm text-gray-600;
}

.header-meta {
  @apply flex flex-col items-end space-y-1;
}

.difficulty-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}

.difficulty-badge.easy-difficulty {
  @apply bg-green-100 text-green-800;
}

.difficulty-badge.medium-difficulty {
  @apply bg-yellow-100 text-yellow-800;
}

.difficulty-badge.hard-difficulty {
  @apply bg-red-100 text-red-800;
}

.timeframe {
  @apply text-xs text-gray-500;
}

.card-content {
  @apply p-4 space-y-6;
}

.recommendation-description {
  @apply pb-4 border-b border-gray-100;
}

.description-text {
  @apply text-gray-700 leading-relaxed;
}

.section-title {
  @apply text-sm font-semibold text-gray-800 mb-3;
}

.steps-list {
  @apply space-y-3;
}

.step-item {
  @apply flex items-start space-x-3 p-3 rounded-lg border;
  transition: all 0.3s ease;
}

.step-item:not(.completed) {
  @apply border-gray-200 bg-gray-50;
}

.step-item.completed {
  @apply border-green-200 bg-green-50;
}

.step-marker {
  @apply flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center;
}

.step-number {
  @apply w-full h-full bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center;
}

.step-check {
  @apply w-full h-full bg-green-500 text-white rounded-full flex items-center justify-center;
}

.step-content {
  @apply flex-1;
}

.step-text {
  @apply text-sm text-gray-700 mb-2;
}

.mark-complete-btn {
  @apply text-xs text-blue-600 hover:text-blue-800 font-medium;
}

.outcome-section {
  @apply bg-green-50 border border-green-200 rounded-lg p-4;
}

.outcome-content {
  @apply flex items-start space-x-3;
}

.outcome-icon {
  @apply flex-shrink-0;
}

.outcome-text {
  @apply text-sm text-green-800;
}

.resources-list {
  @apply space-y-2;
}

.resource-item {
  @apply flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors;
}

.resource-icon {
  @apply text-gray-600;
}

.resource-content {
  @apply flex-1;
}

.resource-title {
  @apply text-sm font-medium text-gray-800 block;
}

.resource-type {
  @apply text-xs text-gray-500;
}

.resource-action {
  @apply text-gray-400;
}

.progress-section {
  @apply bg-blue-50 border border-blue-200 rounded-lg p-4;
}

.progress-bar {
  @apply w-full h-2 bg-blue-200 rounded-full overflow-hidden mb-2;
}

.progress-fill {
  @apply h-full bg-blue-500 rounded-full transition-all duration-500;
}

.progress-text {
  @apply text-sm text-blue-800 font-medium;
}

.card-footer {
  @apply flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100;
}

.feedback-section {
  @apply flex items-center space-x-3;
}

.feedback-label {
  @apply text-sm text-gray-600;
}

.feedback-buttons {
  @apply flex space-x-2;
}

.feedback-btn {
  @apply p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors;
}

.feedback-btn.active {
  @apply bg-blue-500 border-blue-500 text-white;
}

.action-buttons {
  @apply flex space-x-2;
}

.action-btn {
  @apply flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors;
}

.action-btn.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.action-btn.secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}

.action-btn.bookmarked {
  @apply bg-yellow-100 text-yellow-800 border border-yellow-300;
}

/* 暗色主题 */
[data-theme='dark'] .recommendation-card {
  @apply bg-gray-800 border-gray-700;
}

[data-theme='dark'] .card-header {
  @apply from-gray-700 to-gray-800;
}

[data-theme='dark'] .recommendation-title,
[data-theme='dark'] .section-title {
  @apply text-gray-200;
}

[data-theme='dark'] .recommendation-category,
[data-theme='dark'] .description-text,
[data-theme='dark'] .step-text {
  @apply text-gray-400;
}

[data-theme='dark'] .step-item:not(.completed) {
  @apply bg-gray-700 border-gray-600;
}

[data-theme='dark'] .resource-item {
  @apply bg-gray-700 hover:bg-gray-600;
}

[data-theme='dark'] .card-footer {
  @apply bg-gray-700 border-gray-600;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .card-header {
    @apply flex-col items-start space-y-2;
  }
  
  .header-meta {
    @apply flex-row items-center space-y-0 space-x-2;
  }
  
  .card-footer {
    @apply flex-col space-y-3;
  }
  
  .feedback-section,
  .action-buttons {
    @apply w-full justify-center;
  }
}
</style>