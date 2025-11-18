import { prisma } from './prisma'
import { PanelUser, Cohort } from '@prisma/client'

/**
 * Rule format examples:
 * - Simple equality: { "country": "JP", "tag": "power-user" }
 * - Array contains: { "tags": { "$contains": "beta-tester" } }
 * - Numeric comparison: { "age": { "$gte": 18, "$lte": 65 } }
 */

type RuleValue =
  | string
  | number
  | boolean
  | { $contains?: string; $gte?: number; $lte?: number; $gt?: number; $lt?: number }

type Rule = Record<string, RuleValue>

/**
 * Evaluates if a user matches a cohort rule
 */
function matchesRule(user: PanelUser, rule: Rule): boolean {
  const attributes = user.attributesJson as Record<string, any>

  for (const [key, ruleValue] of Object.entries(rule)) {
    const userValue = attributes[key]

    // Handle complex operators
    if (typeof ruleValue === 'object' && ruleValue !== null && !Array.isArray(ruleValue)) {
      const operators = ruleValue as { $contains?: string; $gte?: number; $lte?: number; $gt?: number; $lt?: number }

      // $contains operator for arrays
      if (operators.$contains !== undefined) {
        if (!Array.isArray(userValue) || !userValue.includes(operators.$contains)) {
          return false
        }
      }

      // Numeric comparison operators
      if (operators.$gte !== undefined && (typeof userValue !== 'number' || userValue < operators.$gte)) {
        return false
      }
      if (operators.$lte !== undefined && (typeof userValue !== 'number' || userValue > operators.$lte)) {
        return false
      }
      if (operators.$gt !== undefined && (typeof userValue !== 'number' || userValue <= operators.$gt)) {
        return false
      }
      if (operators.$lt !== undefined && (typeof userValue !== 'number' || userValue >= operators.$lt)) {
        return false
      }
    } else {
      // Simple equality check
      if (userValue !== ruleValue) {
        return false
      }
    }
  }

  return true
}

/**
 * Materializes cohort members for a given cohort based on its rules
 */
export async function materializeCohortMembers(cohortId: string): Promise<{
  added: number
  removed: number
}> {
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: { members: true }
  })

  if (!cohort) {
    throw new Error(`Cohort ${cohortId} not found`)
  }

  const rule = cohort.ruleJson as Rule
  const allUsers = await prisma.panelUser.findMany()

  // Find users that match the rule
  const matchingUserIds = new Set(
    allUsers.filter(user => matchesRule(user, rule)).map(user => user.id)
  )

  // Find current members
  const currentMemberUserIds = new Set(cohort.members.map(m => m.userId))

  // Calculate adds and removes
  const toAdd = [...matchingUserIds].filter(id => !currentMemberUserIds.has(id))
  const toRemove = [...currentMemberUserIds].filter(id => !matchingUserIds.has(id))

  // Add new members
  if (toAdd.length > 0) {
    await prisma.cohortMember.createMany({
      data: toAdd.map(userId => ({
        cohortId: cohort.id,
        userId
      })),
      skipDuplicates: true
    })
  }

  // Remove members that no longer match
  if (toRemove.length > 0) {
    await prisma.cohortMember.deleteMany({
      where: {
        cohortId: cohort.id,
        userId: { in: toRemove }
      }
    })
  }

  return {
    added: toAdd.length,
    removed: toRemove.length
  }
}

/**
 * Materializes all cohorts
 */
export async function materializeAllCohorts(): Promise<Record<string, { added: number; removed: number }>> {
  const cohorts = await prisma.cohort.findMany()
  const results: Record<string, { added: number; removed: number }> = {}

  for (const cohort of cohorts) {
    results[cohort.id] = await materializeCohortMembers(cohort.id)
  }

  return results
}

/**
 * Gets users that match a rule (without saving to DB)
 */
export async function previewCohortRule(rule: Rule): Promise<PanelUser[]> {
  const allUsers = await prisma.panelUser.findMany()
  return allUsers.filter(user => matchesRule(user, rule))
}
