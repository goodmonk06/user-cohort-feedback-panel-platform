import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users/:id - Get a single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await prisma.panelUser.findUnique({
      where: { id },
      include: {
        cohortMembers: {
          include: { cohort: true }
        },
        responses: {
          include: { campaign: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PATCH /api/users/:id - Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { email, name, attributesJson } = body

    const user = await prisma.panelUser.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(name && { name }),
        ...(attributesJson !== undefined && { attributesJson })
      }
    })

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error updating user:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/:id - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.panelUser.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
