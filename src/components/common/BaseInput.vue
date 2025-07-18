<template>
  <div class="input-wrapper" :class="wrapperClasses">
    <!-- 标签 -->
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="input-required">*</span>
    </label>

    <!-- 输入框容器 -->
    <div class="input-container" :class="containerClasses">
      <!-- 前缀图标 -->
      <div v-if="prefixIcon" class="input-prefix">
        <i :class="prefixIcon" />
      </div>

      <!-- 输入框 -->
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxLength"
        :minlength="minLength"
        :pattern="pattern"
        :autocomplete="autocomplete"
        :class="inputClasses"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />

      <!-- 后缀图标 -->
      <div v-if="suffixIcon || showClearButton" class="input-suffix">
        <!-- 清除按钮 -->
        <button v-if="showClearButton" type="button" class="input-clear" @click="handleClear">
          <i class="fas fa-times" />
        </button>

        <!-- 后缀图标 -->
        <i v-if="suffixIcon" :class="suffixIcon" />
      </div>
    </div>

    <!-- 帮助文本或错误信息 -->
    <div v-if="helpText || errorMessage" class="input-help">
      <span v-if="errorMessage" class="input-error">{{ errorMessage }}</span>
      <span v-else-if="helpText" class="input-help-text">{{ helpText }}</span>
    </div>

    <!-- 字符计数 -->
    <div v-if="showCount && maxLength" class="input-count">{{ currentLength }}/{{ maxLength }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import type { InputType } from '@/types'

interface Props {
  modelValue?: string | number
  type?: InputType
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  autocomplete?: string
  size?: 'sm' | 'md' | 'lg'
  prefixIcon?: string
  suffixIcon?: string
  clearable?: boolean
  showCount?: boolean
  helpText?: string
  errorMessage?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'clear'): void
  (e: 'keydown', event: KeyboardEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  clearable: false,
  showCount: false
})

const emit = defineEmits<Emits>()

const inputRef = ref<HTMLInputElement>()
const focused = ref(false)

// 生成唯一ID
const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

// 当前值长度
const currentLength = computed(() => String(props.modelValue || '').length)

// 是否显示清除按钮
const showClearButton = computed(
  () =>
    props.clearable &&
    !props.disabled &&
    !props.readonly &&
    props.modelValue &&
    String(props.modelValue).length > 0
)

// 包装器样式类
const wrapperClasses = computed(() => ({
  'input-wrapper-disabled': props.disabled,
  'input-wrapper-error': !!props.errorMessage
}))

// 容器样式类
const containerClasses = computed(() => [
  'input-container-base',
  `input-container-${props.size}`,
  {
    'input-container-focused': focused.value,
    'input-container-disabled': props.disabled,
    'input-container-readonly': props.readonly,
    'input-container-error': !!props.errorMessage,
    'input-container-with-prefix': !!props.prefixIcon,
    'input-container-with-suffix': !!props.suffixIcon || showClearButton.value
  }
])

// 输入框样式类
const inputClasses = computed(() => [
  'input-base',
  `input-${props.size}`,
  {
    'input-with-prefix': !!props.prefixIcon,
    'input-with-suffix': !!props.suffixIcon || showClearButton.value
  }
])

// 事件处理
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('change', target.value)
}

const handleFocus = (event: FocusEvent) => {
  focused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  focused.value = false
  emit('blur', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

// 暴露方法
const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

const select = () => {
  inputRef.value?.select()
}

defineExpose({
  focus,
  blur,
  select,
  inputRef
})
</script>

<style scoped>
/* 包装器 */
.input-wrapper {
  @apply w-full;
}

.input-wrapper-disabled {
  @apply opacity-60;
}

/* 标签 */
.input-label {
  @apply block text-sm font-medium mb-1;
  color: var(--text-secondary);
}

.input-required {
  @apply text-red-500 ml-1;
}

/* 输入框容器 */
.input-container-base {
  @apply relative flex items-center;
  @apply border rounded-md;
  @apply transition-all duration-200;
  border-color: var(--border-primary);
  background-color: var(--bg-primary);
}

.input-container-sm {
  height: var(--input-height-sm);
}

.input-container-md {
  height: var(--input-height-md);
}

.input-container-lg {
  height: var(--input-height-lg);
}

.input-container-focused {
  @apply ring-2 ring-opacity-50;
  border-color: var(--border-focus);
  ring-color: var(--color-primary-500);
}

.input-container-disabled {
  @apply cursor-not-allowed;
  background-color: var(--bg-secondary);
}

.input-container-readonly {
  background-color: var(--bg-secondary);
}

.input-container-error {
  border-color: var(--border-error);
}

.input-container-error.input-container-focused {
  ring-color: var(--color-error-500);
}

/* 输入框 */
.input-base {
  @apply flex-1 bg-transparent border-0 outline-none;
  @apply placeholder-gray-400;
  padding-left: var(--input-padding-x);
  padding-right: var(--input-padding-x);
  color: var(--text-primary);
  font-family: var(--font-family-sans);
}

.input-sm {
  @apply text-sm;
}

.input-md {
  @apply text-base;
}

.input-lg {
  @apply text-lg;
}

.input-with-prefix {
  @apply pl-0;
}

.input-with-suffix {
  @apply pr-0;
}

.input-base:disabled {
  @apply cursor-not-allowed;
}

/* 前缀和后缀 */
.input-prefix,
.input-suffix {
  @apply flex items-center justify-center;
  @apply text-gray-400;
  padding: 0 var(--spacing-3);
}

.input-clear {
  @apply p-1 rounded hover:bg-gray-100;
  @apply transition-colors duration-150;
  @apply text-gray-400 hover:text-gray-600;
}

/* 帮助文本 */
.input-help {
  @apply mt-1 text-sm;
}

.input-error {
  @apply text-red-600;
}

.input-help-text {
  @apply text-gray-500;
}

/* 字符计数 */
.input-count {
  @apply mt-1 text-xs text-right;
  color: var(--text-tertiary);
}

/* 暗色主题适配 */
[data-theme='dark'] .input-container-base {
  background-color: var(--bg-secondary);
  border-color: var(--border-primary);
}

[data-theme='dark'] .input-container-disabled,
[data-theme='dark'] .input-container-readonly {
  background-color: var(--bg-tertiary);
}

[data-theme='dark'] .input-clear:hover {
  @apply bg-gray-700;
}

[data-theme='dark'] .input-help-text {
  @apply text-gray-400;
}
</style>
