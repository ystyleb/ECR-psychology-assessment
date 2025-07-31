import { computed, type Ref } from 'vue'
import type { 
  AttachmentStyle, 
  BasicResult
} from '@/types/assessment'
import type {
  BasicReport,
  AttachmentScores,
  AttachmentPercentiles
} from '@/types/report'
import { ATTACHMENT_DESCRIPTIONS } from '@/data/attachmentDescriptions'

/**
 * 报告数据处理的组合式API
 */
export function useReportData(
  assessmentId: Ref<string>,
  basicResult: Ref<BasicResult | null>
) {
  // 计算依恋类型描述
  const attachmentDescription = computed(() => {
    if (!basicResult.value) return null
    
    const description = ATTACHMENT_DESCRIPTIONS[basicResult.value.attachmentStyle]
    // const _labels = ATTACHMENT_LABELS[basicResult.value.attachmentStyle]
    
    return {
      name: description.title,
      shortDescription: description.summary,
      characteristics: description.characteristics,
      strengths: description.strengths,
      challenges: description.challenges,
      suggestions: description.growthSuggestions,
      icon: getAttachmentIcon(basicResult.value.attachmentStyle),
      color: getAttachmentColor(basicResult.value.attachmentStyle),
      bgColor: getAttachmentBgColor(basicResult.value.attachmentStyle),
      // 完整描述对象
      fullDescription: description
    }
  })

  // 计算得分数据
  const scores = computed((): AttachmentScores | null => {
    if (!basicResult.value) return null
    
    return {
      anxious: basicResult.value.anxious,
      avoidant: basicResult.value.avoidant,
      secure: calculateSecureScore(basicResult.value.anxious, basicResult.value.avoidant)
    }
  })

  // 计算百分位数
  const percentiles = computed((): AttachmentPercentiles | null => {
    if (!scores.value) return null
    
    return {
      anxious: Math.round((scores.value.anxious / 7) * 100),
      avoidant: Math.round((scores.value.avoidant / 7) * 100),
      secure: Math.round((scores.value.secure / 7) * 100)
    }
  })

  // 生成基础报告数据
  const basicReportData = computed((): BasicReport | null => {
    if (!basicResult.value || !attachmentDescription.value || !scores.value || !percentiles.value) {
      return null
    }

    return {
      id: `report-${assessmentId.value}`,
      assessmentId: assessmentId.value,
      type: 'basic',
      status: 'ready',
      createdAt: new Date(),
      updatedAt: new Date(),
      basicResult: basicResult.value,
      attachmentDescription: {
        name: attachmentDescription.value.name,
        title: attachmentDescription.value.name,
        shortDescription: attachmentDescription.value.shortDescription,
        description: attachmentDescription.value.shortDescription,
        characteristics: attachmentDescription.value.characteristics,
        strengths: attachmentDescription.value.strengths,
        challenges: attachmentDescription.value.challenges,
        relationshipPatterns: attachmentDescription.value.fullDescription.relationshipPatterns,
        icon: attachmentDescription.value.icon,
        color: attachmentDescription.value.color,
        bgColor: attachmentDescription.value.bgColor
      },
      scores: scores.value,
      percentiles: percentiles.value,
      reliability: calculateReliability(basicResult.value)
    }
  })

  return {
    attachmentDescription,
    scores,
    percentiles,
    basicReportData
  }
}

// 辅助函数
function getAttachmentIcon(style: AttachmentStyle): string {
  const icons = {
    secure: '🛡️',
    anxious: '💗',
    avoidant: '🏔️',
    disorganized: '🌀'
  }
  return icons[style] || '❓'
}

function getAttachmentColor(style: AttachmentStyle): string {
  const colors = {
    secure: '#10b981',
    anxious: '#f97316',
    avoidant: '#3b82f6',
    disorganized: '#8b5cf6'
  }
  return colors[style] || '#6b7280'
}

function getAttachmentBgColor(style: AttachmentStyle): string {
  const bgColors = {
    secure: '#dcfce7',
    anxious: '#fed7aa',
    avoidant: '#dbeafe',
    disorganized: '#e9d5ff'
  }
  return bgColors[style] || '#f3f4f6'
}

function calculateSecureScore(anxious: number, avoidant: number): number {
  // 安全性得分计算：7减去最高的不安全维度得分
  return Math.max(0, 7 - Math.max(anxious, avoidant))
}

function calculateReliability(result: BasicResult): number {
  // 根据得分分布计算可靠性
  const { anxious, avoidant } = result
  const maxDistance = Math.max(Math.abs(anxious - 3.5), Math.abs(avoidant - 3.5))
  return Math.min(95, Math.max(60, Math.round(maxDistance * 20 + 60)))
} 