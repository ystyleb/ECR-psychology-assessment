import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import InsightCard from '@/components/report/InsightCard.vue'
import type { ReportInsight } from '@/types'

describe('InsightCard', () => {
  const mockInsight: ReportInsight = {
    id: 'test_insight_1',
    category: 'personality',
    title: '情绪稳定的优势',
    content: '您具有良好的情绪调节能力，能够在关系中保持平衡和稳定。',
    importance: 'high',
    icon: 'fas fa-heart',
    color: '#10b981'
  }

  const mockExtendedInsight = {
    ...mockInsight,
    examples: ['在冲突中保持冷静', '能够理解他人的情感需求', '在压力下仍能做出理性决策'],
    suggestions: ['继续保持这种优势', '帮助身边的人学习情绪管理', '在团队中发挥稳定作用']
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染基本洞察卡片', () => {
    const wrapper = mount(InsightCard, {
      props: {
        insight: mockInsight
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.insight-card').exists()).toBe(true)
    expect(wrapper.text()).toContain(mockInsight.title)
    expect(wrapper.text()).toContain(mockInsight.content)
  })

  it('应该显示正确的重要性指示器', () => {
    // 测试高重要性
    const highImportanceWrapper = mount(InsightCard, {
      props: {
        insight: { ...mockInsight, importance: 'high' }
      }
    })
    const highIndicators = highImportanceWrapper.findAll('.bg-yellow-400')
    expect(highIndicators.length).toBe(3) // 3个黄色圆点

    // 测试中等重要性
    const mediumImportanceWrapper = mount(InsightCard, {
      props: {
        insight: { ...mockInsight, importance: 'medium' }
      }
    })
    const mediumIndicators = mediumImportanceWrapper.findAll('.bg-yellow-400')
    expect(mediumIndicators.length).toBe(2) // 2个黄色圆点

    // 测试低重要性
    const lowImportanceWrapper = mount(InsightCard, {
      props: {
        insight: { ...mockInsight, importance: 'low' }
      }
    })
    const lowIndicators = lowImportanceWrapper.findAll('.bg-yellow-400')
    expect(lowIndicators.length).toBe(1) // 1个黄色圆点
  })

  it('应该显示正确的类别标签', () => {
    // 测试个性特征类别
    const personalityWrapper = mount(InsightCard, {
      props: {
        insight: { ...mockInsight, category: 'personality' }
      }
    })
    expect(personalityWrapper.text()).toContain('个性特征')

    // 测试关系模式类别
    const relationshipWrapper = mount(InsightCard, {
      props: {
        insight: { ...mockInsight, category: 'relationship' }
      }
    })
    expect(relationshipWrapper.text()).toContain('关系模式')

    // 测试成长建议类别
    const growthWrapper = mount(InsightCard, {
      props: {
        insight: { ...mockInsight, category: 'growth' }
      }
    })
    expect(growthWrapper.text()).toContain('成长建议')

    // 测试兼容性分析类别
    const compatibilityWrapper = mount(InsightCard, {
      props: {
        insight: { ...mockInsight, category: 'compatibility' }
      }
    })
    expect(compatibilityWrapper.text()).toContain('兼容性分析')
  })

  it('应该在showActions为true时显示操作按钮', () => {
    const wrapper = mount(InsightCard, {
      props: {
        insight: mockInsight,
        showActions: true
      }
    })

    expect(wrapper.text()).toContain('收藏')
    expect(wrapper.text()).toContain('分享')
  })

  it('应该在showActions为false时隐藏操作按钮', () => {
    const wrapper = mount(InsightCard, {
      props: {
        insight: mockInsight,
        showActions: false
      }
    })

    expect(wrapper.text()).not.toContain('收藏')
    expect(wrapper.text()).not.toContain('分享')
  })

  it('应该正确处理收藏功能', async () => {
    const wrapper = mount(InsightCard, {
      props: {
        insight: mockInsight,
        showActions: true
      }
    })

    const bookmarkButton = wrapper.find('button:first-child')
    expect(bookmarkButton.text()).toContain('收藏')

    // 点击收藏按钮
    await bookmarkButton.trigger('click')

    // 验证事件被触发
    expect(wrapper.emitted('bookmark')).toBeTruthy()
    expect(wrapper.emitted('bookmark')?.[0]).toEqual([mockInsight.id, true])

    // 验证按钮文本变化
    expect(bookmarkButton.text()).toContain('已收藏')
  })

  it('应该在点击分享按钮时触发share事件', async () => {
    const wrapper = mount(InsightCard, {
      props: {
        insight: mockInsight,
        showActions: true
      }
    })

    const shareButton = wrapper.find('button:nth-child(2)')
    await shareButton.trigger('click')

    expect(wrapper.emitted('share')).toBeTruthy()
    expect(wrapper.emitted('share')?.[0]).toEqual([mockInsight])
  })

  it('应该在有详细内容时显示查看详情按钮', () => {
    const wrapper = mount(InsightCard, {
      props: {
        insight: mockExtendedInsight,
        showActions: true
      }
    })

    expect(wrapper.text()).toContain('查看详情')
  })

  it('应该在没有详细内容时隐藏查看详情按钮', () => {
    const wrapper = mount(InsightCard, {
      props: {
        insight: mockInsight,
        showActions: true
      }
    })

    expect(wrapper.text()).not.toContain('查看详情')
  })

  it('应该正确展开和收起详细内容', async () => {
    const wrapper = mount(InsightCard, {
      props: {
        insight: mockExtendedInsight,
        showActions: true
      }
    })

    // 初始状态应该隐藏详细内容
    expect(wrapper.text()).not.toContain('具体表现')
    expect(wrapper.text()).not.toContain('改善建议')

    // 点击查看详情按钮
    const buttons = wrapper.findAll('button')
    const detailsButton = buttons.find(btn => btn.text().includes('查看详情'))
    expect(detailsButton).toBeDefined()
    await detailsButton!.trigger('click')

    // 验证详细内容显示
    expect(wrapper.text()).toContain('具体表现')
    expect(wrapper.text()).toContain('改善建议')
    expect(wrapper.text()).toContain('在冲突中保持冷静')
    expect(wrapper.text()).toContain('继续保持这种优势')

    // 验证事件被触发
    expect(wrapper.emitted('viewDetails')).toBeTruthy()
    expect(wrapper.emitted('viewDetails')?.[0]).toEqual([mockExtendedInsight.id])

    // 验证按钮文本变化
    expect(detailsButton.text()).toContain('收起详情')

    // 再次点击收起详情
    await detailsButton.trigger('click')
    expect(wrapper.text()).not.toContain('具体表现')
    expect(wrapper.text()).not.toContain('改善建议')
  })

  it('应该在isStatic为true时禁用悬停效果', () => {
    const wrapper = mount(InsightCard, {
      props: {
        insight: mockInsight,
        isStatic: true
      }
    })

    const card = wrapper.find('.insight-card')
    expect(card.classes()).not.toContain('transform')
    expect(card.classes()).not.toContain('hover:scale-105')
  })

  it('应该正确应用重要性边框样式', () => {
    // 测试高重要性（红色边框）
    const highWrapper = mount(InsightCard, {
      props: {
        insight: { ...mockInsight, importance: 'high' }
      }
    })
    expect(highWrapper.find('.border-red-400').exists()).toBe(true)

    // 测试中等重要性（黄色边框）
    const mediumWrapper = mount(InsightCard, {
      props: {
        insight: { ...mockInsight, importance: 'medium' }
      }
    })
    expect(mediumWrapper.find('.border-yellow-400').exists()).toBe(true)

    // 测试低重要性（绿色边框）
    const lowWrapper = mount(InsightCard, {
      props: {
        insight: { ...mockInsight, importance: 'low' }
      }
    })
    expect(lowWrapper.find('.border-green-400').exists()).toBe(true)
  })

  it('应该正确应用类别颜色样式', () => {
    // 测试个性特征类别（紫色）
    const personalityWrapper = mount(InsightCard, {
      props: {
        insight: { ...mockInsight, category: 'personality' }
      }
    })
    expect(personalityWrapper.find('.bg-purple-100').exists()).toBe(true)

    // 测试关系模式类别（粉色）
    const relationshipWrapper = mount(InsightCard, {
      props: {
        insight: { ...mockInsight, category: 'relationship' }
      }
    })
    expect(relationshipWrapper.find('.bg-pink-100').exists()).toBe(true)
  })
})
