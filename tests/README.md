# ECR心理测评系统测试指南

## 测试环境配置

本项目使用以下测试工具：

- **Vitest**: 现代化的测试框架，与Vite完美集成
- **Vue Test Utils**: Vue官方测试工具库
- **Testing Library**: 更接近用户行为的测试方式
- **jsdom**: 浏览器环境模拟

## 测试脚本

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试UI界面
npm run test:ui

# 运行测试（不监听）
npm run test:run
```

## 测试目录结构

```
tests/
├── setup.ts                    # 测试环境设置
├── unit/                       # 单元测试
│   ├── example.test.ts        # 示例测试
│   ├── components/            # 组件测试
│   │   └── BaseButton.test.ts
│   └── services/              # 服务测试
│       └── calculationService.test.ts
├── integration/               # 集成测试
│   └── assessment-flow.test.ts
└── e2e/                      # 端到端测试
    └── assessment.spec.ts
```

## 测试编写规范

### 单元测试

```typescript
import { describe, it, expect } from 'vitest'

describe('功能模块', () => {
  it('应该正确执行某个功能', () => {
    // 测试逻辑
    expect(result).toBe(expected)
  })
})
```

### 组件测试

```typescript
import { mount } from '@vue/test-utils'
import { render, screen, fireEvent } from '@testing-library/vue'

describe('组件名称', () => {
  it('应该正确渲染', () => {
    const wrapper = mount(Component, {
      props: { title: '测试标题' }
    })
    
    expect(wrapper.text()).toContain('测试标题')
  })
})
```

### 集成测试

```typescript
import { mount } from '@vue/test-utils'

describe('功能流程', () => {
  it('应该完成完整流程', async () => {
    const wrapper = mount(Component)
    
    // 模拟用户操作
    await wrapper.find('button').trigger('click')
    
    // 验证结果
    expect(wrapper.find('.result').exists()).toBe(true)
  })
})
```

## 测试覆盖率

项目配置了70%的测试覆盖率要求：

- **branches**: 70%
- **functions**: 70%
- **lines**: 70%
- **statements**: 70%

运行覆盖率测试：

```bash
npm run test:coverage
```

覆盖率报告将生成在 `coverage/` 目录下。

## 测试最佳实践

### 1. 测试命名

- 使用描述性的测试名称
- 遵循 "应该..." 的命名模式
- 清晰表达测试的预期行为

```typescript
it('应该在用户点击按钮时触发事件', async () => {
  // 测试逻辑
})
```

### 2. 测试结构

- 使用 `describe` 组织相关测试
- 使用 `beforeEach` 设置测试环境
- 使用 `afterEach` 清理测试状态

```typescript
describe('用户服务', () => {
  let userService: UserService

  beforeEach(() => {
    userService = new UserService()
  })

  afterEach(() => {
    // 清理测试数据
  })
})
```

### 3. 异步测试

- 使用 `async/await` 处理异步操作
- 设置适当的超时时间
- 处理Promise和回调

```typescript
it('应该异步加载数据', async () => {
  const result = await loadData()
  expect(result).toBeDefined()
})
```

### 4. Mock和Stub

- 使用 `vi.fn()` 创建模拟函数
- 使用 `vi.mock()` 模拟模块
- 隔离外部依赖

```typescript
const mockApi = vi.fn().mockResolvedValue({ data: 'test' })
vi.mock('@/services/api', () => ({
  apiService: { getData: mockApi }
}))
```

## 常见问题解决

### 1. 组件导入错误

确保组件路径正确，使用别名导入：

```typescript
import Component from '@/components/Component.vue'
```

### 2. 类型错误

在测试文件中添加类型声明：

```typescript
import type { ComponentProps } from '@/types'
```

### 3. 环境变量

在测试中使用环境变量：

```typescript
process.env.NODE_ENV = 'test'
```

### 4. 全局对象

在 `tests/setup.ts` 中配置全局对象：

```typescript
global.localStorage = localStorageMock
global.sessionStorage = sessionStorageMock
```

## 持续集成

在CI/CD流程中运行测试：

```yaml
# GitHub Actions示例
- name: 运行测试
  run: npm run test:coverage

- name: 上传覆盖率报告
  uses: codecov/codecov-action@v3
```

## 测试工具推荐

### VS Code扩展

- **Vitest**: Vitest测试运行器
- **Vue Test Utils**: Vue测试工具
- **Coverage Gutters**: 覆盖率显示

### 调试测试

使用 `debugger` 语句或VS Code调试器：

```typescript
it('调试测试', () => {
  debugger // 设置断点
  // 测试逻辑
})
```

## 性能测试

对于性能关键的功能，添加性能测试：

```typescript
it('应该在合理时间内完成计算', () => {
  const start = performance.now()
  const result = heavyCalculation()
  const end = performance.now()
  
  expect(end - start).toBeLessThan(100) // 100ms内完成
  expect(result).toBeDefined()
})
```

## 测试数据管理

使用工厂函数创建测试数据：

```typescript
const createTestUser = (overrides = {}) => ({
  id: '1',
  name: '测试用户',
  email: 'test@example.com',
  ...overrides
})

it('应该处理用户数据', () => {
  const user = createTestUser({ name: '自定义名称' })
  expect(user.name).toBe('自定义名称')
})
``` 