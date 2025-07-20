import { describe, it, expect } from 'vitest'

// 示例单元测试
describe('基础数学运算', () => {
  it('应该正确计算加法', () => {
    expect(1 + 2).toBe(3)
  })

  it('应该正确计算乘法', () => {
    expect(3 * 4).toBe(12)
  })

  it('应该处理字符串连接', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World')
  })
})

// 示例异步测试
describe('异步操作', () => {
  it('应该正确处理Promise', async () => {
    const result = await Promise.resolve('success')
    expect(result).toBe('success')
  })

  it('应该处理异步函数', async () => {
    const asyncFunction = async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return 'async result'
    }

    const result = await asyncFunction()
    expect(result).toBe('async result')
  })
})

// 示例对象测试
describe('对象操作', () => {
  it('应该正确合并对象', () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { c: 3, d: 4 }
    const merged = { ...obj1, ...obj2 }

    expect(merged).toEqual({
      a: 1,
      b: 2,
      c: 3,
      d: 4
    })
  })

  it('应该正确解构数组', () => {
    const array = [1, 2, 3, 4, 5]
    const [first, second, ...rest] = array

    expect(first).toBe(1)
    expect(second).toBe(2)
    expect(rest).toEqual([3, 4, 5])
  })
})
