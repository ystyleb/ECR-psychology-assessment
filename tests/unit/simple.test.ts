import { describe, it, expect } from 'vitest'

describe('测试环境验证', () => {
  it('应该能够运行基础测试', () => {
    expect(1 + 1).toBe(2)
  })

  it('应该能够处理字符串', () => {
    expect('Hello' + ' World').toBe('Hello World')
  })

  it('应该能够处理数组', () => {
    const array = [1, 2, 3]
    expect(array.length).toBe(3)
    expect(array[0]).toBe(1)
  })

  it('应该能够处理对象', () => {
    const obj = { name: '测试', value: 42 }
    expect(obj.name).toBe('测试')
    expect(obj.value).toBe(42)
  })

  it('应该能够处理异步操作', async () => {
    const result = await Promise.resolve('success')
    expect(result).toBe('success')
  })

  it('应该能够访问全局对象', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })

  it('应该能够使用localStorage', () => {
    localStorage.setItem('test', 'value')
    expect(localStorage.getItem('test')).toBe('value')
    localStorage.removeItem('test')
  })
})
