/**
 * Analytics Adapter Interface
 * Allows plugging in different analytics providers (Segment, Mixpanel, Amplitude, etc.)
 */

export interface AnalyticsEvent {
  userId?: string
  event: string
  properties?: Record<string, any>
  timestamp?: Date
}

export interface AnalyticsResult {
  success: boolean
  error?: string
}

export interface IAnalyticsAdapter {
  track(event: AnalyticsEvent): Promise<AnalyticsResult>
  identify(userId: string, traits: Record<string, any>): Promise<AnalyticsResult>
  page(userId: string, name: string, properties?: Record<string, any>): Promise<AnalyticsResult>
}

/**
 * Console analytics adapter for development
 */
export class ConsoleAnalyticsAdapter implements IAnalyticsAdapter {
  async track(event: AnalyticsEvent): Promise<AnalyticsResult> {
    console.log('📊 TRACK:', event)
    return { success: true }
  }

  async identify(userId: string, traits: Record<string, any>): Promise<AnalyticsResult> {
    console.log('👤 IDENTIFY:', { userId, traits })
    return { success: true }
  }

  async page(userId: string, name: string, properties?: Record<string, any>): Promise<AnalyticsResult> {
    console.log('📄 PAGE:', { userId, name, properties })
    return { success: true }
  }
}

/**
 * No-op analytics adapter
 */
export class NoOpAnalyticsAdapter implements IAnalyticsAdapter {
  async track(): Promise<AnalyticsResult> {
    return { success: true }
  }

  async identify(): Promise<AnalyticsResult> {
    return { success: true }
  }

  async page(): Promise<AnalyticsResult> {
    return { success: true }
  }
}

// Singleton instance
let analyticsAdapter: IAnalyticsAdapter = new ConsoleAnalyticsAdapter()

export function setAnalyticsAdapter(adapter: IAnalyticsAdapter) {
  analyticsAdapter = adapter
}

export function getAnalyticsAdapter(): IAnalyticsAdapter {
  return analyticsAdapter
}
