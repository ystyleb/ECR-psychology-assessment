import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// 模拟测评流程组件
const AssessmentFlow = {
  template: `
    <div class="assessment-flow">
      <div v-if="currentStep === 0" class="welcome">
        <h1>欢迎参加ECR心理测评</h1>
        <button @click="startAssessment" data-test="start-assessment">开始测评</button>
      </div>

      <div v-else-if="currentStep <= totalQuestions" class="question">
        <div class="progress">{{ currentStep }} / {{ totalQuestions }}</div>
        <h2>问题 {{ currentStep }}</h2>
        <p>{{ currentQuestion.text }}</p>
        <div class="rating-options">
          <button
            v-for="score in 7"
            :key="score"
            @click="selectScore(score)"
            :class="{ active: selectedScore === score }"
            class="rating-option"
          >
            {{ score }}
          </button>
        </div>
        <button
          @click="submitAnswer"
          :disabled="!selectedScore"
          class="submit-btn"
        >
          {{ currentStep === totalQuestions ? '完成' : '下一题' }}
        </button>
      </div>

      <div v-else class="complete">
        <h1>测评完成！</h1>
        <p>您的依恋类型：{{ result.attachmentType }}</p>
        <button @click="viewReport" data-test="view-report">查看详细报告</button>
      </div>
    </div>
  `,
  data() {
    return {
      currentStep: 0,
      totalQuestions: 3,
      selectedScore: null,
      answers: [],
      questions: [
        { id: '1', text: '我担心我的伴侣不会像我关心他/她那样关心我。', dimension: 'anxiety' },
        { id: '2', text: '我倾向于与伴侣保持情感距离。', dimension: 'avoidance' },
        { id: '3', text: '我担心我的伴侣会离开我。', dimension: 'anxiety' }
      ],
      result: null
    }
  },
  computed: {
    currentQuestion() {
      if (this.currentStep > 0 && this.currentStep <= this.totalQuestions) {
        return this.questions[this.currentStep - 1]
      }
      return null
    }
  },
  methods: {
    startAssessment() {
      this.currentStep = 1
    },
    selectScore(score: number) {
      this.selectedScore = score
    },
    submitAnswer() {
      if (this.selectedScore) {
        this.answers.push({
          questionId: this.currentQuestion.id,
          score: this.selectedScore
        })

        if (this.currentStep === this.totalQuestions) {
          this.completeAssessment()
        } else {
          this.currentStep++
          this.selectedScore = null
        }
      }
    },
    completeAssessment() {
      // 模拟计算结果
      const anxietyAnswers = this.answers.filter(
        a => this.questions.find(q => q.id === a.questionId)?.dimension === 'anxiety'
      )
      const avoidanceAnswers = this.answers.filter(
        a => this.questions.find(q => q.id === a.questionId)?.dimension === 'avoidance'
      )

      const anxietyScore =
        anxietyAnswers.reduce((sum, a) => sum + a.score, 0) / anxietyAnswers.length
      const avoidanceScore =
        avoidanceAnswers.reduce((sum, a) => sum + a.score, 0) / avoidanceAnswers.length

      this.result = {
        attachmentType: this.determineAttachmentType(anxietyScore, avoidanceScore),
        scores: { anxiety: anxietyScore, avoidance: avoidanceScore }
      }

      this.currentStep = this.totalQuestions + 1
    },
    determineAttachmentType(anxietyScore: number, avoidanceScore: number): string {
      if (anxietyScore <= 3.5 && avoidanceScore <= 3.5) {
        return '安全型'
      } else if (anxietyScore > 3.5 && avoidanceScore <= 3.5) {
        return '焦虑型'
      } else if (anxietyScore <= 3.5 && avoidanceScore > 3.5) {
        return '回避型'
      } else {
        return '混乱型'
      }
    },
    viewReport() {
      // 模拟查看报告
      console.log('查看报告', this.result)
    }
  }
}

describe('测评流程集成测试', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(AssessmentFlow)
  })

  it('应该显示欢迎页面', () => {
    expect(wrapper.find('.welcome').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('欢迎参加ECR心理测评')
    expect(wrapper.find('[data-test="start-assessment"]').exists()).toBe(true)
  })

  it('应该能够开始测评', async () => {
    await wrapper.find('[data-test="start-assessment"]').trigger('click')

    expect(wrapper.vm.currentStep).toBe(1)
    expect(wrapper.find('.question').exists()).toBe(true)
    expect(wrapper.find('.progress').text()).toBe('1 / 3')
  })

  it('应该能够回答问题并进入下一题', async () => {
    // 开始测评
    await wrapper.find('[data-test="start-assessment"]').trigger('click')

    // 选择答案
    await wrapper.find('.rating-option').trigger('click')

    // 提交答案
    await wrapper.find('.submit-btn').trigger('click')

    expect(wrapper.vm.currentStep).toBe(2)
    expect(wrapper.vm.answers).toHaveLength(1)
  })

  it('应该完成整个测评流程', async () => {
    // 开始测评
    await wrapper.find('[data-test="start-assessment"]').trigger('click')

    // 回答所有问题
    for (let i = 0; i < 3; i++) {
      await wrapper.find('.rating-option').trigger('click')
      await wrapper.find('.submit-btn').trigger('click')
    }

    // 验证完成状态
    expect(wrapper.find('.complete').exists()).toBe(true)
    expect(wrapper.vm.result).toBeTruthy()
    expect(wrapper.vm.result.attachmentType).toBeDefined()
    expect(wrapper.vm.result.scores).toBeDefined()
  })

  it('应该在未选择答案时禁用提交按钮', async () => {
    await wrapper.find('[data-test="start-assessment"]').trigger('click')

    const submitBtn = wrapper.find('.submit-btn')
    expect(submitBtn.attributes('disabled')).toBeDefined()

    await wrapper.find('.rating-option').trigger('click')
    expect(submitBtn.attributes('disabled')).toBeUndefined()
  })

  it('应该正确计算依恋类型', async () => {
    // 开始测评
    await wrapper.find('[data-test="start-assessment"]').trigger('click')

    // 模拟低分答案（安全型）
    for (let i = 0; i < 3; i++) {
      await wrapper.findAll('.rating-option')[1].trigger('click') // 选择2分
      await wrapper.find('.submit-btn').trigger('click')
    }

    expect(wrapper.vm.result.attachmentType).toBe('安全型')
  })

  it('应该能够查看报告', async () => {
    // 完成测评
    await wrapper.find('[data-test="start-assessment"]').trigger('click')
    for (let i = 0; i < 3; i++) {
      await wrapper.find('.rating-option').trigger('click')
      await wrapper.find('.submit-btn').trigger('click')
    }

    // 查看报告
    const viewReportBtn = wrapper.find('[data-test="view-report"]')
    expect(viewReportBtn.exists()).toBe(true)

    await viewReportBtn.trigger('click')
    // 这里可以验证报告查看逻辑
  })
})
