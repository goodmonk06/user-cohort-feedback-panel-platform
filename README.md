# Feedback Panel Platform

A comprehensive user cohort feedback panel platform built with Next.js, TypeScript, Prisma, and PostgreSQL. This platform enables you to manage panel users, segment them into cohorts based on rules, create feedback campaigns, and track responses.

## Features

- **Panel User Management**: Store users with flexible JSON attributes
- **Dynamic Cohort Segmentation**: Define cohorts using rule-based filtering
- **Feedback Campaigns**: Create survey and interview campaigns for specific cohorts
- **Response Tracking**: Collect and analyze feedback responses
- **Rule-Based Materialization**: Automatically assign users to cohorts based on their attributes

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 18, TailwindCSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL with Prisma ORM
- **Language**: TypeScript

## Domain Model

### PanelUser
Represents users in your feedback panel with flexible attributes.

```typescript
{
  id: string
  email: string
  name: string
  attributesJson: JSON  // Flexible user attributes
  createdAt: DateTime
}
```

### Cohort
Groups of users defined by rules for targeted feedback campaigns.

```typescript
{
  id: string
  name: string
  description: string?
  ruleJson: JSON        // Filtering rules
  createdAt: DateTime
}
```

### CohortMember
Many-to-many relationship between cohorts and users.

```typescript
{
  id: string
  cohortId: string
  userId: string
  createdAt: DateTime
}
```

### FeedbackCampaign
Feedback requests sent to cohorts (surveys, interviews, etc.).

```typescript
{
  id: string
  cohortId: string
  name: string
  type: "survey" | "interview"
  payloadJson: JSON     // Campaign-specific data
  createdAt: DateTime
}
```

### FeedbackResponse
User responses to feedback campaigns.

```typescript
{
  id: string
  campaignId: string
  userId: string
  responseJson: JSON    // Response data
  createdAt: DateTime
}
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd user-cohort-feedback-panel-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
```bash
# Create .env file
DATABASE_URL="postgresql://user:password@localhost:5432/feedback_panel?schema=public"
```

4. Set up the database:
```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed the database with sample data
npm run prisma:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Cohort Rules (ruleJson)

The `ruleJson` field in cohorts defines filtering rules to automatically assign users to cohorts. The cohort engine evaluates user attributes against these rules.

### Rule Syntax

#### 1. Simple Equality
Match users with exact attribute values:

```json
{
  "country": "JP",
  "tag": "power-user"
}
```

This matches users where:
- `attributesJson.country === "JP"` AND
- `attributesJson.tag === "power-user"`

#### 2. Array Contains (`$contains`)
Match users with an array attribute containing a specific value:

```json
{
  "tags": { "$contains": "beta-tester" }
}
```

This matches users where the `tags` array includes "beta-tester".

#### 3. Numeric Comparison
Use operators for numeric ranges:

```json
{
  "age": { "$gte": 25, "$lte": 35 }
}
```

Available operators:
- `$gte`: Greater than or equal
- `$lte`: Less than or equal
- `$gt`: Greater than
- `$lt`: Less than

#### 4. Complex Rules
Combine multiple conditions (all must match):

```json
{
  "country": "US",
  "plan": "premium",
  "age": { "$gte": 18 },
  "tags": { "$contains": "early-adopter" }
}
```

### Example Use Cases

#### Target power users in Japan
```json
{
  "country": "JP",
  "tag": "power-user"
}
```

#### Target premium plan users
```json
{
  "plan": "premium"
}
```

#### Target young adults (25-35)
```json
{
  "age": { "$gte": 25, "$lte": 35 }
}
```

#### Target beta testers
```json
{
  "tags": { "$contains": "beta-tester" }
}
```

#### Target high-value users
```json
{
  "plan": "premium",
  "lifetime_value": { "$gte": 1000 },
  "country": "US"
}
```

## Campaign Payloads (payloadJson)

The `payloadJson` field stores campaign-specific information.

### Survey Campaign Example
```json
{
  "surveyUrl": "https://example.com/surveys/product-feedback",
  "description": "Help us improve our product",
  "estimatedTime": "5 minutes",
  "incentive": "$10 gift card"
}
```

### Interview Campaign Example
```json
{
  "meetingUrl": "https://meet.example.com/interview",
  "duration": "30 minutes",
  "incentive": "$50 Amazon gift card",
  "availableSlots": [
    "2024-02-01T10:00:00Z",
    "2024-02-01T14:00:00Z"
  ]
}
```

## API Endpoints

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create a user
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Cohorts
- `GET /api/cohorts` - List all cohorts
- `POST /api/cohorts` - Create a cohort
- `GET /api/cohorts/:id` - Get cohort details
- `PATCH /api/cohorts/:id` - Update a cohort
- `DELETE /api/cohorts/:id` - Delete a cohort
- `POST /api/cohorts/:id/materialize` - Materialize cohort members based on rules

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create a campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PATCH /api/campaigns/:id` - Update a campaign
- `DELETE /api/campaigns/:id` - Delete a campaign

### Responses
- `GET /api/responses` - List all responses (optional `?campaignId=xxx` filter)
- `POST /api/responses` - Create a response
- `GET /api/responses/:id` - Get response details
- `PATCH /api/responses/:id` - Update a response
- `DELETE /api/responses/:id` - Delete a response

## Cohort Materialization

The platform includes a cohort engine (`lib/cohort-engine.ts`) that materializes cohort members based on rules:

```typescript
import { materializeCohortMembers, materializeAllCohorts } from '@/lib/cohort-engine'

// Materialize a specific cohort
const result = await materializeCohortMembers(cohortId)
console.log(`Added: ${result.added}, Removed: ${result.removed}`)

// Materialize all cohorts
const results = await materializeAllCohorts()
```

### When to Materialize

- After creating or updating a cohort's rules
- After adding or updating users
- Periodically via a cron job to keep cohorts fresh

## Integration Ideas

### Email Integration
Integrate with email providers to send feedback requests:

```typescript
// Example with SendGrid
import sgMail from '@sendgrid/mail'

async function sendCampaignInvites(campaignId: string) {
  const campaign = await prisma.feedbackCampaign.findUnique({
    where: { id: campaignId },
    include: {
      cohort: {
        include: {
          members: {
            include: { user: true }
          }
        }
      }
    }
  })

  for (const member of campaign.cohort.members) {
    await sgMail.send({
      to: member.user.email,
      from: 'feedback@yourcompany.com',
      subject: campaign.name,
      html: `<p>We'd love your feedback! <a href="${campaign.payloadJson.surveyUrl}">Take our survey</a></p>`
    })
  }
}
```

### Webhook Integration
Accept responses from external survey tools:

```typescript
// app/api/webhooks/survey-response/route.ts
export async function POST(request: Request) {
  const payload = await request.json()

  await prisma.feedbackResponse.create({
    data: {
      campaignId: payload.campaignId,
      userId: payload.userId,
      responseJson: payload.answers
    }
  })

  return Response.json({ success: true })
}
```

### Analytics Integration
Track campaign performance:

```typescript
async function getCampaignMetrics(campaignId: string) {
  const campaign = await prisma.feedbackCampaign.findUnique({
    where: { id: campaignId },
    include: {
      cohort: {
        include: {
          _count: { select: { members: true } }
        }
      },
      _count: { select: { responses: true } }
    }
  })

  return {
    inviteSent: campaign.cohort._count.members,
    responseCount: campaign._count.responses,
    responseRate: (campaign._count.responses / campaign.cohort._count.members) * 100
  }
}
```

### Scheduling Campaigns
Use a job scheduler to automate campaigns:

```typescript
// Using node-cron
import cron from 'node-cron'

// Run every Monday at 9 AM
cron.schedule('0 9 * * 1', async () => {
  // Create weekly feedback campaign
  const campaign = await prisma.feedbackCampaign.create({
    data: {
      cohortId: 'active-users-cohort-id',
      name: `Weekly Feedback - ${new Date().toISOString()}`,
      type: 'survey',
      payloadJson: { surveyUrl: 'https://...' }
    }
  })

  await sendCampaignInvites(campaign.id)
})
```

## Vertical Slice Demo

The seed data includes a complete vertical slice demonstrating the platform:

1. **6 Panel Users** with diverse attributes (country, tags, age, plan)
2. **4 Cohorts**:
   - JP Power Users (country: JP, tag: power-user)
   - Premium Plan Users (plan: premium)
   - Beta Testers (tags contains beta-tester)
   - Young Adults 25-35 (age between 25 and 35)
3. **3 Campaigns**:
   - Beta Feature Feedback Survey
   - Premium User Experience Interview
   - Japan Market Research Survey
4. **5 Responses** from various users across campaigns

### Testing the Vertical Slice

1. Visit **Users** page to see all panel users and their attributes
2. Visit **Cohorts** page to see how users are segmented
3. Click "Materialize" on any cohort to recalculate members based on rules
4. Visit **Campaigns** page to see feedback campaigns for each cohort
5. Visit **Responses** page to view all feedback responses

## Development

### Database Migrations

After modifying the Prisma schema:

```bash
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

### Database Studio

Explore your database with Prisma Studio:

```bash
npx prisma studio
```

### Type Safety

The platform leverages TypeScript and Prisma for end-to-end type safety. Prisma generates types automatically from your schema.

## Production Deployment

### Environment Variables

Set these in your production environment:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
NODE_ENV="production"
```

### Build and Deploy

```bash
npm run build
npm start
```

### Recommended Hosting

- **Vercel**: Seamless Next.js deployment
- **Railway**: Easy PostgreSQL + Next.js hosting
- **AWS**: EC2 + RDS for full control
- **Heroku**: Simple deployment with Postgres add-on

## Security Considerations

1. **API Authentication**: Add authentication middleware to protect API routes
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Input Validation**: Validate all JSON inputs before parsing
4. **SQL Injection**: Prisma protects against SQL injection by default
5. **CORS**: Configure CORS appropriately for production

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For questions or issues, please open a GitHub issue or contact the development team.
