import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cohorts/:id - Get a single cohort
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cohort = await prisma.cohort.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: true }
        },
        campaigns: true,
        _count: {
          select: { members: true, campaigns: true }
        }
      }
    })

    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(cohort)
  } catch (error) {
    console.error('Error fetching cohort:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cohort' },
      { status: 500 }
    )
  }
}

// PATCH /api/cohorts/:id - Update a cohort
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, ruleJson } = body

    const cohort = await prisma.cohort.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(ruleJson !== undefined && { ruleJson })
      }
    })

    return NextResponse.json(cohort)
  } catch (error: any) {
    console.error('Error updating cohort:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      )
    }
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cohort name already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update cohort' },
      { status: 500 }
    )
  }
}

// DELETE /api/cohorts/:id - Delete a cohort
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.cohort.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting cohort:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete cohort' },
      { status: 500 }
    )
  }
}
