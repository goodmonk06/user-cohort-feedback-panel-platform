import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/campaigns - List all campaigns
export async function GET() {
  try {
    const campaigns = await prisma.feedbackCampaign.findMany({
      include: {
        cohort: true,
        _count: {
          select: { responses: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cohortId, name, type, payloadJson } = body

    if (!cohortId || !name || !type) {
      return NextResponse.json(
        { error: 'CohortId, name, and type are required' },
        { status: 400 }
      )
    }

    if (!['survey', 'interview'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "survey" or "interview"' },
        { status: 400 }
      )
    }

    const campaign = await prisma.feedbackCampaign.create({
      data: {
        cohortId,
        name,
        type,
        payloadJson: payloadJson || {}
      },
      include: { cohort: true }
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error: any) {
    console.error('Error creating campaign:', error)
    if (error?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
