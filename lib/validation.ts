import { z } from 'zod'

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  attributesJson: z.record(z.any()).optional().default({})
})

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  attributesJson: z.record(z.any()).optional()
})

// Cohort schemas
export const createCohortSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional().nullable(),
  ruleJson: z.record(z.any()).default({})
})

export const updateCohortSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional().nullable(),
  ruleJson: z.record(z.any()).optional()
})

// Campaign schemas
export const campaignTypeEnum = z.enum(['survey', 'interview'])

export const createCampaignSchema = z.object({
  cohortId: z.string().min(1, 'Cohort ID is required'),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  type: campaignTypeEnum,
  payloadJson: z.record(z.any()).default({})
})

export const updateCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  type: campaignTypeEnum.optional(),
  payloadJson: z.record(z.any()).optional()
})

// Response schemas
export const createResponseSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  responseJson: z.record(z.any()).default({})
})

export const updateResponseSchema = z.object({
  responseJson: z.record(z.any())
})

// Query schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
})

// Types
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateCohortInput = z.infer<typeof createCohortSchema>
export type UpdateCohortInput = z.infer<typeof updateCohortSchema>
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
export type CreateResponseInput = z.infer<typeof createResponseSchema>
export type UpdateResponseInput = z.infer<typeof updateResponseSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
