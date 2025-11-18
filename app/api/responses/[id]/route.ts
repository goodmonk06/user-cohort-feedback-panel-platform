import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/responses/:id - Get a single response
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await prisma.feedbackResponse.findUnique({
      where: { id },
      include: {
        user: true,
        campaign: {
          include: { cohort: true }
        }
      }
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching response:', error)
    return NextResponse.json(
      { error: 'Failed to fetch response' },
      { status: 500 }
    )
  }
}

// PATCH /api/responses/:id - Update a response
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { responseJson } = body

    const response = await prisma.feedbackResponse.update({
      where: { id },
      data: {
        ...(responseJson !== undefined && { responseJson })
      }
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error updating response:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update response' },
      { status: 500 }
    )
  }
}

// DELETE /api/responses/:id - Delete a response
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.feedbackResponse.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting response:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete response' },
      { status: 500 }
    )
  }
}
