import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createUserSchema } from '@/lib/validation'
import { asyncHandler } from '@/lib/errors'
import { logger } from '@/lib/logger'

// GET /api/users - List all users
export const GET = asyncHandler(async () => {
  logger.info('Fetching all users')
  const users = await prisma.panelUser.findMany({
    orderBy: { createdAt: 'desc' }
  })
  logger.info(`Retrieved ${users.length} users`)
  return NextResponse.json(users)
})

// POST /api/users - Create a new user
export const POST = asyncHandler(async (request: NextRequest) => {
  const body = await request.json()
  const validatedData = createUserSchema.parse(body)

  logger.info('Creating new user', { email: validatedData.email })

  const user = await prisma.panelUser.create({
    data: validatedData
  })

  logger.info('User created successfully', { userId: user.id })
  return NextResponse.json(user, { status: 201 })
})
