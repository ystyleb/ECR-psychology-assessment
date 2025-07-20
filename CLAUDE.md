# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the ECR (Experiences in Close Relationships) psychological assessment system - a modern Vue 3 + TypeScript web application for evaluating attachment styles in intimate relationships. The system provides scientific, secure, and user-friendly online assessment services.

## Technology Stack

### Frontend Core
- **Vue 3.4+** with Composition API and `<script setup>` syntax
- **TypeScript 5.3+** with strict type checking
- **Pinia 2.1+** for state management
- **Vue Router 4.2+** for routing
- **Vite 5.0+** as build tool
- **Tailwind CSS 3.4+** for styling

### Additional Libraries
- **Chart.js + vue-chartjs** for data visualization
- **@vueuse/core** for Vue composition utilities

### Development Tools
- **ESLint + Prettier** for code quality and formatting
- **Husky + lint-staged** for Git hooks
- **Vue TSC** for TypeScript type checking

## Common Development Commands

```bash
# Development
npm run dev              # Start development server (port 5173)

# Building
npm run build           # Production build
npm run preview         # Preview production build

# Code Quality
npm run lint           # ESLint check and fix
npm run format         # Prettier formatting
npm run type-check     # TypeScript type checking

# Testing
npm run test           # Run unit tests in watch mode  
npm run test:run       # Run unit tests once
npm run test:ui        # Run tests with UI
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage

# Additional Commands
npm run prepare        # Setup Husky git hooks
npm run build-only     # Build without type checking

# Running Specific Tests
npx vitest run tests/unit/components/BaseButton.test.ts  # Run single test file
npx vitest run --grep "BaseButton"                       # Run tests matching pattern
npx vitest run src/services/                            # Run tests in directory

## Project Architecture

### High-Level Structure
```
src/
├── main.ts                    # App entry point
├── App.vue                    # Root component
├── router/index.ts            # Route configuration with guards
├── stores/                    # Pinia state management
│   ├── assessment.ts          # Core assessment logic & data
│   ├── user.ts               # User information
│   ├── ui.ts                 # UI state (loading, notifications)
│   └── payment.ts            # Payment flow management
├── services/                  # Business logic layer
│   ├── assessmentService.ts   # Assessment CRUD operations
│   ├── calculationService.ts # ECR scoring algorithms
│   ├── storageService.ts     # Local storage management
│   └── paymentService.ts     # Stripe integration
├── components/               # Vue components by feature
│   ├── common/              # Reusable UI components
│   ├── assessment/          # Assessment flow components
│   ├── report/              # Report display components
│   ├── payment/             # Payment components
│   └── charts/              # Chart visualization
├── views/                   # Page-level components
├── types/                   # TypeScript type definitions
└── assets/                  # Static resources
```

### Key Architecture Patterns

**State Management Flow:**
- Pinia stores handle all state management
- `assessment.ts` is the core store managing the 36-question ECR assessment
- Services layer encapsulates business logic and data persistence
- Local storage with encryption for privacy protection

**Assessment Flow:**
1. User starts assessment → `createNewAssessment()` in assessment store
2. Questions loaded from `assessmentService.getQuestions()`
3. Answers stored in `responses` array (36 items, null = unanswered)
4. Completion triggers `calculateResult()` using ECR-R scoring algorithm
5. Results stored locally with optional payment for detailed report

**Route Protection:**
- Router guards in `router/index.ts` validate assessment access
- Assessment detail and report pages require valid assessment ID
- Payment flow integrated with route navigation

## Core Business Logic

### ECR Assessment Scoring
The system implements the ECR-R (Experiences in Close Relationships-Revised) scale:
- 36 questions measuring anxiety and avoidance dimensions
- 7-point Likert scale (1-7)
- Specific questions require reverse scoring
- Final scores determine attachment style: secure, anxious, avoidant, or disorganized

**Key files:**
- `src/services/calculationService.ts` - Scoring algorithms
- `src/stores/assessment.ts` - Assessment state management (lines 143-198)
- `src/types/assessment.ts` - Type definitions

### Data Privacy & Storage
- All user data stored locally (no server transmission)
- Encryption for sensitive data via `storageService`
- 30-day automatic data expiration
- GDPR/CCPA compliant design

### Payment Integration
- Stripe integration for detailed reports
- Serverless functions in `api/` directory
- Payment status tracked in assessment data
- Basic results free, detailed analysis paid

## Development Guidelines

### Component Development
Use Composition API with TypeScript:
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AssessmentQuestion } from '@/types'

interface Props {
  question: AssessmentQuestion
  modelValue?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const selectedValue = ref(props.modelValue)

const isValid = computed(() => 
  selectedValue.value !== undefined && 
  selectedValue.value >= 1 && 
  selectedValue.value <= 7
)
</script>
```

### State Management
Use Pinia stores with TypeScript:
```typescript
// stores/example.ts
export const useExampleStore = defineStore('example', () => {
  const state = reactive({ /* state */ })
  
  const computedValue = computed(() => /* logic */)
  
  const action = async () => { /* async logic */ }
  
  return { ...toRefs(state), computedValue, action }
})
```

### Service Layer
Business logic in services with proper error handling:
```typescript
// services/exampleService.ts
class ExampleService {
  async performOperation(): Promise<Result> {
    try {
      // Business logic
      return { success: true, data }
    } catch (error) {
      console.error('Operation failed:', error)
      throw new Error('User-friendly error message')
    }
  }
}
```

## Code Quality Standards

### TypeScript Usage
- Strict type checking enabled
- Avoid `any` type - use `unknown` instead
- Explicit return types for functions
- Interface definitions in `src/types/`

### Vue 3 Best Practices
- Use Composition API exclusively
- Prefer `<script setup>` syntax
- Component naming in PascalCase
- Props and emits with TypeScript interfaces

### Styling with Tailwind
- Mobile-first responsive design
- Custom components in `src/assets/styles/`
- Design tokens for consistency
- Accessibility considerations (ARIA attributes, keyboard navigation)

## Testing Strategy

### Test Files Structure
```
tests/
├── unit/                  # Component and service tests
├── integration/           # Feature flow tests
└── e2e/                  # End-to-end tests
```

### Testing Tools
- **Vitest** for unit testing with coverage thresholds (70% minimum)
- **@vue/test-utils** for component testing
- **@testing-library/vue** for user-centric testing
- **@testing-library/jest-dom** for additional DOM matchers
- **MSW** for API mocking
- **jsdom** environment for DOM testing

## Deployment Configuration

### Vercel Deployment
- Configured via `vercel.json` with Node.js 18.x runtime
- Serverless functions in `api/` directory:
  - `create-payment.js` - Payment intent creation
  - `verify-payment.js` - Payment verification
  - `generate-token.js` - Token generation
- Environment variables managed through Vercel dashboard
- SPA routing handled via rewrites to `/index.html`
- Static asset caching with Cache-Control headers

### Build Optimization
- Code splitting by vendor/feature
- Lazy loading for routes and heavy components
- Source maps for debugging
- Bundle analysis available

## Important Cursor Rules Integration

The project follows these key principles from `.cursor/rules/`:

1. **Business Logic** (ecr-assessment-business.mdc):
   - ECR-R scale implementation with proper scoring
   - Privacy-first architecture with local storage
   - Professional psychological assessment standards

2. **Frontend Standards** (modern-frontend-standards.mdc):
   - Vue 3 + TypeScript + Pinia architecture
   - Tailwind CSS with design system
   - Performance optimization strategies

3. **Project Structure** (project-structure-guide.mdc):
   - Feature-based component organization
   - Clear separation of concerns
   - Consistent naming conventions

4. **Vue 3 Architecture** (vue3-typescript-architecture.mdc):
   - Composition API patterns
   - Type-safe state management
   - Component development standards

## Common Debugging Areas

### Assessment Flow Issues
- Check `assessment.ts` store state
- Verify question loading in `assessmentService.ts`
- Validate scoring logic in `calculationService.ts`

### Payment Integration
- Stripe configuration in environment variables
- Serverless function logs in Vercel dashboard
- Payment status updates in assessment data

### Local Storage Problems
- Browser storage limits and cleanup
- Encryption/decryption in `storageService.ts`
- Data migration between app versions

## Environment Variables

Required for full functionality:
```bash
VITE_APP_TITLE=ECR心理测评系统
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_SENTRY_DSN=your_sentry_dsn
VITE_API_BASE_URL=https://your-domain.vercel.app
```

## Key Files to Understand

1. **src/stores/assessment.ts** - Core assessment logic and state
2. **src/services/assessmentService.ts** - Assessment CRUD operations  
3. **src/services/calculationService.ts** - ECR scoring algorithms
4. **src/router/index.ts** - Route configuration with guards
5. **src/types/assessment.ts** - Core type definitions
6. **package.json** - Dependencies and scripts

Understanding these files will give you a solid foundation for working with this codebase effectively.

## Git Hooks and Code Quality

The project uses Husky and lint-staged for automated code quality checks:
- **Pre-commit hook**: Automatically runs ESLint and Prettier on staged files
- **Lint-staged configuration**: Targets `*.{js,ts,vue}` files for linting and formatting
- Run `npm run prepare` after cloning to setup hooks

## Important Debugging Commands

When working with the codebase, these commands are essential for maintaining code quality:
1. Always run `npm run lint` after making changes
2. Run `npm run type-check` to catch TypeScript errors
3. Use `npm run test:run` for quick test validation before commits
4. Check `npm run build` success before deploying