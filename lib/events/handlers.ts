/**
 * Event Handlers
 * Side effects triggered by domain events
 */

import { eventBus } from './event-bus'
import { EventTypes, CampaignLaunchedPayload, ResponseReceivedPayload } from './types'
import { getNotificationAdapter } from '../adapters/notification.adapter'
import { getAnalyticsAdapter } from '../adapters/analytics.adapter'
import { getAIAdapter } from '../adapters/ai.adapter'
import { logger } from '../logger'
import { prisma } from '../prisma'

/**
 * Initialize all event handlers
 */
export function initializeEventHandlers() {
  // Campaign launched → Send notifications
  eventBus.on<CampaignLaunchedPayload>(EventTypes.CAMPAIGN_LAUNCHED, async (event) => {
    const { campaignId, targetCount } = event.payload

    logger.info('Handling campaign launch', { campaignId, targetCount })

    // Track analytics
    const analytics = getAnalyticsAdapter()
    await analytics.track({
      event: 'Campaign Launched',
      properties: {
        campaignId,
        targetCount
      }
    })

    // In a real system, this would send actual notifications to cohort members
    logger.info(`Would send notifications to ${targetCount} users`)
  })

  // Response received → Analyze sentiment
  eventBus.on<ResponseReceivedPayload>(EventTypes.RESPONSE_RECEIVED, async (event) => {
    const { responseId, campaignId, userId } = event.payload

    logger.info('Handling response received', { responseId, campaignId, userId })

    try {
      // Get response data
      const response = await prisma.feedbackResponse.findUnique({
        where: { id: responseId }
      })

      if (!response) return

      // Extract text from response JSON for sentiment analysis
      const responseText = extractTextFromResponse(response.responseJson)

      if (responseText) {
        const ai = getAIAdapter()
        const sentiment = await ai.analyzeSentiment({ text: responseText })

        // Update response with sentiment score
        await prisma.feedbackResponse.update({
          where: { id: responseId },
          data: { sentimentScore: sentiment.score }
        })

        logger.info('Sentiment analysis complete', {
          responseId,
          score: sentiment.score,
          label: sentiment.label
        })
      }

      // Track analytics
      const analytics = getAnalyticsAdapter()
      await analytics.track({
        userId,
        event: 'Response Submitted',
        properties: {
          campaignId,
          responseId
        }
      })
    } catch (error) {
      logger.error('Error processing response', { responseId, error })
    }
  })

  // Log all events for debugging
  if (process.env.NODE_ENV === 'development') {
    eventBus.onAny((event) => {
      logger.debug('Event:', { type: event.type, payload: event.payload })
    })
  }
}

/**
 * Extract text content from response JSON for analysis
 */
function extractTextFromResponse(responseJson: any): string {
  if (typeof responseJson === 'string') return responseJson

  if (typeof responseJson === 'object') {
    // Try common field names
    const textFields = ['comment', 'feedback', 'text', 'message', 'response', 'answer']
    for (const field of textFields) {
      if (responseJson[field] && typeof responseJson[field] === 'string') {
        return responseJson[field]
      }
    }

    // Concatenate all string values
    const strings = Object.values(responseJson)
      .filter(v => typeof v === 'string')
      .join(' ')

    return strings
  }

  return ''
}

// Initialize handlers on import
initializeEventHandlers()
