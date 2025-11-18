# Integration Recipes

Common integration patterns for the Feedback Panel Platform.

## Table of Contents

1. [Email Notifications (SendGrid)](#email-notifications-sendgrid)
2. [SMS Notifications (Twilio)](#sms-notifications-twilio)
3. [Analytics (Segment)](#analytics-segment)
4. [AI Sentiment Analysis (OpenAI)](#ai-sentiment-analysis-openai)
5. [Authentication (NextAuth.js)](#authentication-nextauthjs)
6. [Survey Platform (Typeform)](#survey-platform-typeform)
7. [Background Jobs (Bull)](#background-jobs-bull)
8. [Webhook Delivery](#webhook-delivery)

---

## Email Notifications (SendGrid)

Send campaign invites via email using SendGrid.

### 1. Install SendGrid

```bash
npm install @sendgrid/mail
```

### 2. Create SendGrid Adapter

```typescript
// lib/adapters/sendgrid.adapter.ts
import sgMail from '@sendgrid/mail'
import { INotificationAdapter, NotificationPayload, NotificationResult } from './notification.adapter'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export class SendGridAdapter implements INotificationAdapter {
  async sendEmail(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const msg = {
        to: payload.to,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject: payload.subject || 'Feedback Request',
        text: payload.body,
        html: payload.template
          ? this.renderTemplate(payload.template, payload.variables)
          : `<p>${payload.body}</p>`
      }

      const [response] = await sgMail.send(msg)

      return {
        success: true,
        messageId: response.headers['x-message-id']
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async sendSMS(): Promise<NotificationResult> {
    throw new Error('SMS not supported by SendGrid adapter')
  }

  async sendPush(): Promise<NotificationResult> {
    throw new Error('Push not supported by SendGrid adapter')
  }

  private renderTemplate(template: string, variables?: Record<string, any>): string {
    if (!variables) return template
    return Object.entries(variables).reduce(
      (html, [key, value]) => html.replace(new RegExp(`{{${key}}}`, 'g'), value),
      template
    )
  }
}
```

### 3. Register Adapter

```typescript
// lib/adapters/index.ts
import { SendGridAdapter } from './sendgrid.adapter'
import { setNotificationAdapter } from './notification.adapter'

if (process.env.NODE_ENV === 'production') {
  setNotificationAdapter(new SendGridAdapter())
}
```

### 4. Use in Event Handler

```typescript
// lib/events/handlers.ts
eventBus.on<CampaignLaunchedPayload>(EventTypes.CAMPAIGN_LAUNCHED, async (event) => {
  const notification = getNotificationAdapter()

  await notification.sendEmail({
    to: user.email,
    subject: `New Feedback Request: ${campaign.name}`,
    body: `We'd love your feedback on ${campaign.name}`,
    template: 'campaign-invite',
    variables: { campaignName: campaign.name, surveyUrl: campaign.payloadJson.surveyUrl }
  })
})
```

---

## SMS Notifications (Twilio)

### 1. Install Twilio

```bash
npm install twilio
```

### 2. Create Twilio Adapter

```typescript
// lib/adapters/twilio.adapter.ts
import twilio from 'twilio'
import { INotificationAdapter } from './notification.adapter'

export class TwilioAdapter implements INotificationAdapter {
  private client: twilio.Twilio

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
  }

  async sendSMS(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const message = await this.client.messages.create({
        body: payload.body,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: payload.to
      })

      return { success: true, messageId: message.sid }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async sendEmail(): Promise<NotificationResult> {
    throw new Error('Email not supported by Twilio adapter')
  }

  async sendPush(): Promise<NotificationResult> {
    throw new Error('Push not supported by Twilio adapter')
  }
}
```

---

## Analytics (Segment)

Track events to Segment for unified analytics.

### 1. Install Segment

```bash
npm install @segment/analytics-node
```

### 2. Create Segment Adapter

```typescript
// lib/adapters/segment.adapter.ts
import { Analytics } from '@segment/analytics-node'
import { IAnalyticsAdapter, AnalyticsEvent } from './analytics.adapter'

export class SegmentAdapter implements IAnalyticsAdapter {
  private analytics: Analytics

  constructor() {
    this.analytics = new Analytics({
      writeKey: process.env.SEGMENT_WRITE_KEY!
    })
  }

  async track(event: AnalyticsEvent): Promise<AnalyticsResult> {
    try {
      await this.analytics.track({
        userId: event.userId,
        event: event.event,
        properties: event.properties,
        timestamp: event.timestamp
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async identify(userId: string, traits: Record<string, any>): Promise<AnalyticsResult> {
    try {
      await this.analytics.identify({ userId, traits })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async page(userId: string, name: string, properties?: Record<string, any>): Promise<AnalyticsResult> {
    try {
      await this.analytics.page({ userId, name, properties })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
```

---

## AI Sentiment Analysis (OpenAI)

Use OpenAI for advanced sentiment analysis.

### 1. Install OpenAI

```bash
npm install openai
```

### 2. Create OpenAI Adapter

```typescript
// lib/adapters/openai.adapter.ts
import OpenAI from 'openai'
import { IAIAdapter } from './ai.adapter'

export class OpenAIAdapter implements IAIAdapter {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  async analyzeSentiment(input: SentimentAnalysisInput): Promise<SentimentAnalysisResult> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Analyze sentiment and return a JSON with score (-1 to 1) and label.'
        },
        {
          role: 'user',
          content: input.text
        }
      ],
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return {
      score: result.score,
      magnitude: Math.abs(result.score),
      label: result.label
    }
  }

  async summarize(input: SummarizationInput): Promise<SummarizationResult> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Summarize the following text in max ${input.maxLength || 100} characters.`
        },
        {
          role: 'user',
          content: input.text
        }
      ]
    })

    return { summary: completion.choices[0].message.content || '' }
  }

  async categorize(input: CategoryInput): Promise<CategoryResult> {
    const categories = input.categories?.join(', ') || 'general, feature request, bug report, feedback'

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Categorize the text into one of: ${categories}. Return JSON with category and confidence.`
        },
        {
          role: 'user',
          content: input.text
        }
      ],
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return {
      category: result.category,
      confidence: result.confidence
    }
  }
}
```

---

## Authentication (NextAuth.js)

Add authentication to protect API routes.

### 1. Install NextAuth

```bash
npm install next-auth
```

### 2. Configure NextAuth

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    })
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub!
      return session
    }
  }
})

export { handler as GET, handler as POST }
```

### 3. Protect API Routes

```typescript
// lib/auth.ts
import { getServerSession } from 'next-auth'

export async function requireAuth() {
  const session = await getServerSession()
  if (!session) {
    throw new UnauthorizedError()
  }
  return session
}

// In API routes:
export const POST = asyncHandler(async (request) => {
  await requireAuth()
  // ... rest of handler
})
```

---

## Survey Platform (Typeform)

Integrate with Typeform for professional surveys.

### Webhook Handler

```typescript
// app/api/webhooks/typeform/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { eventBus } from '@/lib/events/event-bus'
import { EventTypes } from '@/lib/events/types'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('typeform-signature')

  // Verify webhook signature
  if (!verifyTypeformSignature(signature, await request.text())) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = await request.json()

  // Map Typeform response to our format
  const response = await prisma.feedbackResponse.create({
    data: {
      campaignId: payload.form_response.hidden.campaign_id,
      userId: payload.form_response.hidden.user_id,
      responseJson: mapTypeformResponse(payload.form_response)
    }
  })

  // Emit event for processing
  await eventBus.emit(
    eventBus.createEvent(EventTypes.RESPONSE_RECEIVED, {
      responseId: response.id,
      campaignId: response.campaignId,
      userId: response.userId
    })
  )

  return NextResponse.json({ success: true })
}
```

---

## Background Jobs (Bull)

Process heavy tasks in the background.

### 1. Install Bull

```bash
npm install bull @types/bull redis
```

### 2. Create Job Queue

```typescript
// lib/queues/feedback.queue.ts
import Bull from 'bull'
import { prisma } from '../prisma'
import { getAIAdapter } from '../adapters/ai.adapter'

export const feedbackQueue = new Bull('feedback', {
  redis: process.env.REDIS_URL
})

feedbackQueue.process('analyze-sentiment', async (job) => {
  const { responseId } = job.data

  const response = await prisma.feedbackResponse.findUnique({
    where: { id: responseId }
  })

  if (!response) return

  const ai = getAIAdapter()
  const sentiment = await ai.analyzeSentiment({
    text: extractText(response.responseJson)
  })

  await prisma.feedbackResponse.update({
    where: { id: responseId },
    data: { sentimentScore: sentiment.score }
  })
})

// Enqueue job
export async function analyzeFeedback(responseId: string) {
  await feedbackQueue.add('analyze-sentiment', { responseId })
}
```

---

## Webhook Delivery

Send webhooks to external systems when events occur.

### Webhook Model

```prisma
model Webhook {
  id          String   @id @default(cuid())
  url         String
  events      String[]
  secret      String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

### Webhook Sender

```typescript
// lib/webhooks/sender.ts
import crypto from 'crypto'

export async function sendWebhook(webhook: Webhook, event: DomainEvent) {
  if (!webhook.events.includes(event.type)) return

  const payload = JSON.stringify(event)
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(payload)
    .digest('hex')

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature
      },
      body: payload
    })

    if (!response.ok) {
      logger.error('Webhook delivery failed', {
        webhookId: webhook.id,
        status: response.status
      })
    }
  } catch (error) {
    logger.error('Webhook delivery error', { webhookId: webhook.id, error })
  }
}
```

---

## Environment Variables

Add these to your `.env`:

```bash
# SendGrid
SENDGRID_API_KEY=your_key
SENDGRID_FROM_EMAIL=noreply@example.com

# Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Segment
SEGMENT_WRITE_KEY=your_key

# OpenAI
OPENAI_API_KEY=your_key

# NextAuth
GITHUB_ID=your_id
GITHUB_SECRET=your_secret
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# Redis (for Bull)
REDIS_URL=redis://localhost:6379
```
