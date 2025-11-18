import { describe, it, expect } from 'vitest'
import {
  createUserSchema,
  updateUserSchema,
  createCohortSchema,
  createCampaignSchema,
  createResponseSchema
} from '@/lib/validation'

describe('Validation Schemas', () => {
  describe('User Validation', () => {
    it('should validate correct user data', () => {
      const validUser = {
        email: 'test@example.com',
        name: 'Test User',
        attributesJson: { country: 'US' }
      }

      const result = createUserSchema.safeParse(validUser)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidUser = {
        email: 'not-an-email',
        name: 'Test User'
      }

      const result = createUserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid email')
      }
    })

    it('should require name', () => {
      const invalidUser = {
        email: 'test@example.com',
        name: ''
      }

      const result = createUserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
    })

    it('should default attributesJson to empty object', () => {
      const user = {
        email: 'test@example.com',
        name: 'Test User'
      }

      const result = createUserSchema.parse(user)
      expect(result.attributesJson).toEqual({})
    })
  })

  describe('Cohort Validation', () => {
    it('should validate correct cohort data', () => {
      const validCohort = {
        name: 'Test Cohort',
        description: 'A test cohort',
        ruleJson: { country: 'JP' }
      }

      const result = createCohortSchema.safeParse(validCohort)
      expect(result.success).toBe(true)
    })

    it('should allow null description', () => {
      const cohort = {
        name: 'Test Cohort',
        description: null,
        ruleJson: {}
      }

      const result = createCohortSchema.safeParse(cohort)
      expect(result.success).toBe(true)
    })

    it('should default ruleJson to empty object', () => {
      const cohort = {
        name: 'Test Cohort'
      }

      const result = createCohortSchema.parse(cohort)
      expect(result.ruleJson).toEqual({})
    })
  })

  describe('Campaign Validation', () => {
    it('should validate survey campaign', () => {
      const validCampaign = {
        cohortId: 'cohort-123',
        name: 'Test Survey',
        type: 'survey' as const,
        payloadJson: { surveyUrl: 'https://example.com/survey' }
      }

      const result = createCampaignSchema.safeParse(validCampaign)
      expect(result.success).toBe(true)
    })

    it('should validate interview campaign', () => {
      const validCampaign = {
        cohortId: 'cohort-123',
        name: 'Test Interview',
        type: 'interview' as const,
        payloadJson: { meetingUrl: 'https://meet.example.com' }
      }

      const result = createCampaignSchema.safeParse(validCampaign)
      expect(result.success).toBe(true)
    })

    it('should reject invalid campaign type', () => {
      const invalidCampaign = {
        cohortId: 'cohort-123',
        name: 'Test Campaign',
        type: 'invalid' as any
      }

      const result = createCampaignSchema.safeParse(invalidCampaign)
      expect(result.success).toBe(false)
    })
  })

  describe('Response Validation', () => {
    it('should validate correct response data', () => {
      const validResponse = {
        campaignId: 'campaign-123',
        userId: 'user-123',
        responseJson: { rating: 5, comment: 'Great!' }
      }

      const result = createResponseSchema.safeParse(validResponse)
      expect(result.success).toBe(true)
    })

    it('should require campaignId and userId', () => {
      const invalidResponse = {
        responseJson: { rating: 5 }
      }

      const result = createResponseSchema.safeParse(invalidResponse)
      expect(result.success).toBe(false)
    })
  })
})
