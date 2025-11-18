/**
 * Domain Event Types
 * Type-safe event system for triggering side effects
 */

export interface DomainEvent<T = any> {
  type: string
  payload: T
  timestamp: Date
  metadata?: Record<string, any>
}

// User Events
export interface UserCreatedPayload {
  userId: string
  email: string
  name: string
}

export interface UserUpdatedPayload {
  userId: string
  changes: Record<string, any>
}

export interface UserDeletedPayload {
  userId: string
}

// Cohort Events
export interface CohortCreatedPayload {
  cohortId: string
  name: string
}

export interface CohortMaterializedPayload {
  cohortId: string
  membersAdded: number
  membersRemoved: number
}

export interface CohortUpdatedPayload {
  cohortId: string
  changes: Record<string, any>
}

// Campaign Events
export interface CampaignCreatedPayload {
  campaignId: string
  cohortId: string
  name: string
  type: 'survey' | 'interview'
}

export interface CampaignLaunchedPayload {
  campaignId: string
  cohortId: string
  targetCount: number
}

export interface CampaignCompletedPayload {
  campaignId: string
  responseCount: number
  responseRate: number
}

// Response Events
export interface ResponseReceivedPayload {
  responseId: string
  campaignId: string
  userId: string
  sentimentScore?: number
}

export interface ResponseUpdatedPayload {
  responseId: string
  changes: Record<string, any>
}

// Event type constants
export const EventTypes = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',

  COHORT_CREATED: 'cohort.created',
  COHORT_MATERIALIZED: 'cohort.materialized',
  COHORT_UPDATED: 'cohort.updated',

  CAMPAIGN_CREATED: 'campaign.created',
  CAMPAIGN_LAUNCHED: 'campaign.launched',
  CAMPAIGN_COMPLETED: 'campaign.completed',

  RESPONSE_RECEIVED: 'response.received',
  RESPONSE_UPDATED: 'response.updated'
} as const

export type EventType = typeof EventTypes[keyof typeof EventTypes]
