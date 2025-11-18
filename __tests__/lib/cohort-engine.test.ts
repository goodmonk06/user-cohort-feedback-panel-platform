import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PanelUser } from '@prisma/client'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    cohort: {
      findUnique: vi.fn(),
      findMany: vi.fn()
    },
    panelUser: {
      findMany: vi.fn()
    },
    cohortMember: {
      createMany: vi.fn(),
      deleteMany: vi.fn()
    }
  }
}))

// Import after mocking
import { materializeCohortMembers, previewCohortRule } from '@/lib/cohort-engine'
import { prisma } from '@/lib/prisma'

describe('Cohort Engine', () => {
  describe('Rule Matching', () => {
    const mockUsers: Partial<PanelUser>[] = [
      {
        id: '1',
        email: 'user1@test.com',
        name: 'User 1',
        attributesJson: { country: 'JP', tag: 'power-user', age: 28 },
        createdAt: new Date()
      },
      {
        id: '2',
        email: 'user2@test.com',
        name: 'User 2',
        attributesJson: { country: 'US', tag: 'regular', age: 35 },
        createdAt: new Date()
      },
      {
        id: '3',
        email: 'user3@test.com',
        name: 'User 3',
        attributesJson: { country: 'JP', tag: 'regular', age: 22, tags: ['beta-tester'] },
        createdAt: new Date()
      }
    ]

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should match users with simple equality rule', async () => {
      vi.mocked(prisma.panelUser.findMany).mockResolvedValue(mockUsers as PanelUser[])

      const rule = { country: 'JP' }
      const result = await previewCohortRule(rule)

      expect(result).toHaveLength(2)
      expect(result.map(u => u.id)).toEqual(['1', '3'])
    })

    it('should match users with multiple conditions', async () => {
      vi.mocked(prisma.panelUser.findMany).mockResolvedValue(mockUsers as PanelUser[])

      const rule = { country: 'JP', tag: 'power-user' }
      const result = await previewCohortRule(rule)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should match users with array contains operator', async () => {
      vi.mocked(prisma.panelUser.findMany).mockResolvedValue(mockUsers as PanelUser[])

      const rule = { tags: { $contains: 'beta-tester' } }
      const result = await previewCohortRule(rule)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('3')
    })

    it('should match users with numeric range operators', async () => {
      vi.mocked(prisma.panelUser.findMany).mockResolvedValue(mockUsers as PanelUser[])

      const rule = { age: { $gte: 25, $lte: 30 } }
      const result = await previewCohortRule(rule)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should return empty array when no users match', async () => {
      vi.mocked(prisma.panelUser.findMany).mockResolvedValue(mockUsers as PanelUser[])

      const rule = { country: 'FR' }
      const result = await previewCohortRule(rule)

      expect(result).toHaveLength(0)
    })
  })

  describe('Cohort Materialization', () => {
    it('should add new members matching rules', async () => {
      const mockCohort = {
        id: 'cohort1',
        name: 'Test Cohort',
        ruleJson: { country: 'JP' },
        members: []
      }

      const mockUsers: Partial<PanelUser>[] = [
        {
          id: '1',
          email: 'user1@test.com',
          name: 'User 1',
          attributesJson: { country: 'JP' },
          createdAt: new Date()
        },
        {
          id: '2',
          email: 'user2@test.com',
          name: 'User 2',
          attributesJson: { country: 'US' },
          createdAt: new Date()
        }
      ]

      vi.mocked(prisma.cohort.findUnique).mockResolvedValue(mockCohort as any)
      vi.mocked(prisma.panelUser.findMany).mockResolvedValue(mockUsers as PanelUser[])
      vi.mocked(prisma.cohortMember.createMany).mockResolvedValue({ count: 1 })

      const result = await materializeCohortMembers('cohort1')

      expect(result.added).toBe(1)
      expect(result.removed).toBe(0)
      expect(prisma.cohortMember.createMany).toHaveBeenCalledWith({
        data: [{ cohortId: 'cohort1', userId: '1' }],
        skipDuplicates: true
      })
    })

    it('should throw error when cohort not found', async () => {
      vi.mocked(prisma.cohort.findUnique).mockResolvedValue(null)

      await expect(materializeCohortMembers('nonexistent')).rejects.toThrow(
        'Cohort nonexistent not found'
      )
    })
  })
})
