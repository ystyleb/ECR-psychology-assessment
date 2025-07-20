import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { render, screen, fireEvent } from '@testing-library/vue'
import BaseButton from '@/components/common/BaseButton.vue'

describe('BaseButton', () => {
  it('应该正确渲染按钮文本', () => {
    const wrapper = mount(BaseButton, {
      props: {
        text: '点击我'
      }
    })

    expect(wrapper.text()).toBe('点击我')
  })

  it('应该正确应用按钮类型样式', () => {
    const wrapper = mount(BaseButton, {
      props: {
        text: '主要按钮',
        variant: 'primary'
      }
    })

    expect(wrapper.classes()).toContain('button-primary')
  })

  it('应该在点击时触发事件', async () => {
    const wrapper = mount(BaseButton, {
      props: {
        text: '测试按钮'
      }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('应该在禁用状态下不触发点击事件', async () => {
    const wrapper = mount(BaseButton, {
      props: {
        text: '禁用按钮',
        disabled: true
      }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeFalsy()
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('应该正确设置按钮大小', () => {
    const wrapper = mount(BaseButton, {
      props: {
        text: '大按钮',
        size: 'lg'
      }
    })

    expect(wrapper.classes()).toContain('button-lg')
  })

  // 使用Testing Library的测试方式
  it('应该通过Testing Library正确渲染', () => {
    render(BaseButton, {
      props: {
        text: 'Testing Library按钮'
      }
    })

    expect(screen.getByRole('button', { name: 'Testing Library按钮' })).toBeInTheDocument()
  })

  it('应该通过Testing Library正确处理点击事件', async () => {
    const { emitted } = render(BaseButton, {
      props: {
        text: '可点击按钮'
      }
    })

    const button = screen.getByRole('button', { name: '可点击按钮' })
    await fireEvent.click(button)

    expect(emitted().click).toBeTruthy()
  })
})
