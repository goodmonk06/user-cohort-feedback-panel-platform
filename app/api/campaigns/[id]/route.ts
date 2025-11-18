import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/campaigns/:id - Get a single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const campaign = await prisma.feedbackCampaign.findUnique({
      where: { id },
      include: {
        cohort: {
          include: {
            members: {
              include: { user: true }
            }
          }
        },
        responses: {
          include: { user: true }
        },
        _count: {
          select: { responses: true }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

// PATCH /api/campaigns/:id - Update a campaign
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, payloadJson } = body

    if (type && !['survey', 'interview'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "survey" or "interview"' },
        { status: 400 }
      )
    }

    const campaign = await prisma.feedbackCampaign.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(payloadJson !== undefined && { payloadJson })
      }
    })

    return NextResponse.json(campaign)
  } catch (error: any) {
    console.error('Error updating campaign:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/:id - Delete a campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.feedbackCampaign.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting campaign:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
