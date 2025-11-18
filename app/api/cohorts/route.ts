import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cohorts - List all cohorts
export async function GET() {
  try {
    const cohorts = await prisma.cohort.findMany({
      include: {
        _count: {
          select: { members: true, campaigns: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(cohorts)
  } catch (error) {
    console.error('Error fetching cohorts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cohorts' },
      { status: 500 }
    )
  }
}

// POST /api/cohorts - Create a new cohort
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, ruleJson } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const cohort = await prisma.cohort.create({
      data: {
        name,
        description: description || null,
        ruleJson: ruleJson || {}
      }
    })

    return NextResponse.json(cohort, { status: 201 })
  } catch (error: any) {
    console.error('Error creating cohort:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cohort name already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create cohort' },
      { status: 500 }
    )
  }
}
