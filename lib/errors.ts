import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { logger } from './logger'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(404, `${resource}${id ? ` with id ${id}` : ''} not found`, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(409, message, 'CONFLICT', details)
    this.name = 'ConflictError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

interface ErrorResponse {
  error: {
    message: string
    code?: string
    details?: any
    statusCode: number
  }
}

export function handleError(error: unknown): NextResponse<ErrorResponse> {
  logger.error('API Error:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          })),
          statusCode: 400
        }
      },
      { status: 400 }
    )
  }

  // Custom app errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          statusCode: error.statusCode
        }
      },
      { status: error.statusCode }
    )
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: {
              message: 'A record with this value already exists',
              code: 'UNIQUE_CONSTRAINT_VIOLATION',
              details: { field: error.meta?.target },
              statusCode: 409
            }
          },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          {
            error: {
              message: 'Record not found',
              code: 'NOT_FOUND',
              statusCode: 404
            }
          },
          { status: 404 }
        )
      case 'P2003':
        return NextResponse.json(
          {
            error: {
              message: 'Related record not found',
              code: 'FOREIGN_KEY_VIOLATION',
              details: { field: error.meta?.field_name },
              statusCode: 400
            }
          },
          { status: 400 }
        )
      default:
        return NextResponse.json(
          {
            error: {
              message: 'Database error occurred',
              code: 'DATABASE_ERROR',
              statusCode: 500
            }
          },
          { status: 500 }
        )
    }
  }

  // Generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: {
          message: error.message || 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
          statusCode: 500
        }
      },
      { status: 500 }
    )
  }

  // Unknown errors
  return NextResponse.json(
    {
      error: {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        statusCode: 500
      }
    },
    { status: 500 }
  )
}

export function asyncHandler(
  handler: (...args: any[]) => Promise<NextResponse>
) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleError(error)
    }
  }
}
