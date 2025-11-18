import { NextRequest, NextResponse } from 'next/server'
import { materializeCohortMembers } from '@/lib/cohort-engine'

// POST /api/cohorts/:id/materialize - Materialize cohort members based on rules
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await materializeCohortMembers(id)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error materializing cohort:', error)
    if (error?.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to materialize cohort' },
      { status: 500 }
    )
  }
}
