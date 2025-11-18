/**
 * Simple in-memory event bus for domain events
 * Can be replaced with a more robust solution (Redis, RabbitMQ, etc.) in production
 */

import { DomainEvent, EventType } from './types'
import { logger } from '../logger'

type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map()
  private globalHandlers: EventHandler[] = []

  /**
   * Subscribe to a specific event type
   */
  on<T = any>(eventType: EventType, handler: EventHandler<T>): () => void {
    const handlers = this.handlers.get(eventType) || []
    handlers.push(handler as EventHandler)
    this.handlers.set(eventType, handlers)

    // Return unsubscribe function
    return () => {
      const currentHandlers = this.handlers.get(eventType) || []
      const index = currentHandlers.indexOf(handler as EventHandler)
      if (index > -1) {
        currentHandlers.splice(index, 1)
        this.handlers.set(eventType, currentHandlers)
      }
    }
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: EventHandler): () => void {
    this.globalHandlers.push(handler)

    // Return unsubscribe function
    return () => {
      const index = this.globalHandlers.indexOf(handler)
      if (index > -1) {
        this.globalHandlers.splice(index, 1)
      }
    }
  }

  /**
   * Emit an event
   */
  async emit<T = any>(event: DomainEvent<T>): Promise<void> {
    logger.info('Event emitted', { type: event.type, payload: event.payload })

    // Execute type-specific handlers
    const typeHandlers = this.handlers.get(event.type) || []
    const allHandlers = [...typeHandlers, ...this.globalHandlers]

    const promises = allHandlers.map(async (handler) => {
      try {
        await handler(event)
      } catch (error) {
        logger.error('Event handler error', {
          eventType: event.type,
          error
        })
      }
    })

    await Promise.all(promises)
  }

  /**
   * Create a domain event
   */
  createEvent<T = any>(type: EventType, payload: T, metadata?: Record<string, any>): DomainEvent<T> {
    return {
      type,
      payload,
      timestamp: new Date(),
      metadata
    }
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear()
    this.globalHandlers = []
  }
}

// Singleton instance
export const eventBus = new EventBus()
