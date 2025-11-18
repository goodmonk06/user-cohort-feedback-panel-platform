/**
 * AI Adapter Interface
 * Allows plugging in different AI providers for sentiment analysis, summarization, etc.
 */

export interface SentimentAnalysisInput {
  text: string
  language?: string
}

export interface SentimentAnalysisResult {
  score: number // -1 to 1
  magnitude?: number
  label?: 'positive' | 'negative' | 'neutral'
}

export interface SummarizationInput {
  text: string
  maxLength?: number
}

export interface SummarizationResult {
  summary: string
}

export interface CategoryInput {
  text: string
  categories?: string[]
}

export interface CategoryResult {
  category: string
  confidence: number
}

export interface IAIAdapter {
  analyzeSentiment(input: SentimentAnalysisInput): Promise<SentimentAnalysisResult>
  summarize(input: SummarizationInput): Promise<SummarizationResult>
  categorize(input: CategoryInput): Promise<CategoryResult>
}

/**
 * Mock AI adapter for development
 */
export class MockAIAdapter implements IAIAdapter {
  async analyzeSentiment(input: SentimentAnalysisInput): Promise<SentimentAnalysisResult> {
    // Simple mock: count positive/negative words
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love']
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'poor']

    const text = input.text.toLowerCase()
    let score = 0

    positiveWords.forEach(word => {
      if (text.includes(word)) score += 0.2
    })

    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 0.2
    })

    score = Math.max(-1, Math.min(1, score))

    return {
      score,
      magnitude: Math.abs(score),
      label: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral'
    }
  }

  async summarize(input: SummarizationInput): Promise<SummarizationResult> {
    // Mock: just truncate
    const maxLength = input.maxLength || 100
    const summary = input.text.length > maxLength
      ? input.text.substring(0, maxLength) + '...'
      : input.text

    return { summary }
  }

  async categorize(input: CategoryInput): Promise<CategoryResult> {
    // Mock: return first category or "general"
    const categories = input.categories || ['general', 'feature request', 'bug report', 'other']
    return {
      category: categories[0],
      confidence: 0.75
    }
  }
}

// Singleton instance
let aiAdapter: IAIAdapter = new MockAIAdapter()

export function setAIAdapter(adapter: IAIAdapter) {
  aiAdapter = adapter
}

export function getAIAdapter(): IAIAdapter {
  return aiAdapter
}
