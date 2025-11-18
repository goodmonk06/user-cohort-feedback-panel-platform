import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/responses - List all responses (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaignId')

    const responses = await prisma.feedbackResponse.findMany({
      where: campaignId ? { campaignId } : undefined,
      include: {
        user: true,
        campaign: {
          include: { cohort: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(responses)
  } catch (error) {
    console.error('Error fetching responses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    )
  }
}

// POST /api/responses - Create a new response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, userId, responseJson } = body

    if (!campaignId || !userId) {
      return NextResponse.json(
        { error: 'CampaignId and userId are required' },
        { status: 400 }
      )
    }

    const response = await prisma.feedbackResponse.create({
      data: {
        campaignId,
        userId,
        responseJson: responseJson || {}
      },
      include: {
        user: true,
        campaign: true
      }
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error('Error creating response:', error)
    if (error?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Campaign or user not found' },
        { status: 404 }
      )
    }
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'User has already responded to this campaign' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create response' },
      { status: 500 }
    )
  }
}
