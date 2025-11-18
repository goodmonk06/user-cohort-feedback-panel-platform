# Feedback Panel Platform

> A production-ready user cohort segmentation and feedback collection platform built with Next.js, TypeScript, Prisma, and PostgreSQL.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## Overview

The Feedback Panel Platform is a sophisticated system for product teams and researchers who need to gather targeted feedback from specific user segments. It solves the problem of inefficient, one-size-fits-all feedback collection by enabling precise cohort definition through flexible rule-based segmentation, automated campaign management, and comprehensive response analytics.

**Key Capabilities:**
- 🎯 **Smart Segmentation**: Rule-based cohort definition with support for complex filters
- 📊 **Campaign Management**: Survey and interview campaigns with templates and scheduling
- 🤖 **AI-Powered Insights**: Sentiment analysis and response categorization
- 🔌 **Extensible Architecture**: Plug-and-play adapters for notifications, analytics, and AI
- 📈 **Built-in Analytics**: Track response rates, sentiment scores, and cohort metrics
- 🏢 **Enterprise-Ready**: Comprehensive logging, metrics, audit trails, and validation

## Table of Contents

- [Tech Stack](#tech-stack)
- [Domain Model](#domain-model)
- [Getting Started](#getting-started)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Cohort Rules](#cohort-rules)
- [Extensibility](#extensibility)
- [Testing](#testing)
- [Deployment](#deployment)
- [Integration Examples](#integration-examples)
- [Future Extensions](#future-extensions)

## Tech Stack

### Core
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5+ (strict mode)
- **Database**: PostgreSQL 16+
- **ORM**: Prisma 5.22
- **Styling**: TailwindCSS 3

### Quality & DX
- **Validation**: Zod for runtime type safety
- **Testing**: Vitest with coverage reporting
- **Logging**: Winston with structured logs
- **Metrics**: Prometheus-compatible metrics
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

### Infrastructure
- **Docker**: Multi-stage builds for production
- **Docker Compose**: Local development environment
- **CI/CD Ready**: Automated testing and deployment

## Domain Model

### Core Entities

**PanelUser** - Users in your feedback panel
```typescript
{
  id: string
  email: string
  name: string
  attributesJson: Record<string, any>  // Flexible attributes
  status: UserStatus                    // active | inactive | suspended
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Cohort** - User segments defined by rules
```typescript
{
  id: string
  name: string
  description?: string
  ruleJson: Record<string, any>        // Filtering rules
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

**FeedbackCampaign** - Feedback collection campaigns
```typescript
{
  id: string
  cohortId: string
  templateId?: string
  name: string
  type: 'survey' | 'interview'
  status: CampaignStatus                // draft | scheduled | active | paused | completed | archived
  payloadJson: Record<string, any>
  scheduledFor?: DateTime
  launchedAt?: DateTime
  closedAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

**FeedbackResponse** - User feedback submissions
```typescript
{
  id: string
  campaignId: string
  userId: string
  responseJson: Record<string, any>
  sentimentScore?: number               // -1 to 1
  completionRate?: number               // 0 to 1
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Extended Entities

- **CampaignTemplate**: Reusable campaign configurations
- **Tag**: Flexible tagging system for users, cohorts, and campaigns
- **UserPreference**: Opt-in/out and communication preferences
- **CohortAnalytics**: Aggregated metrics per cohort
- **CampaignAnalytics**: Response rates and sentiment tracking
- **AuditLog**: Complete audit trail for compliance

[View full schema →](./prisma/schema.prisma)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or use Docker Compose)
- npm or pnpm

### Quick Start (Docker)

```bash
# Clone repository
git clone <repository-url>
cd feedback-panel-platform

# Copy environment variables
cp .env.example .env

# Start services
docker compose up -d

# The app will be available at http://localhost:3000
```

### Manual Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run database migrations
npm run db:migrate

# Generate Prisma Client
npm run db:generate

# Seed database with demo data
npm run db:seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking
npm run format           # Format code with Prettier
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Run database migrations
npm run db:push          # Push schema without migration
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database
```

## Features

### 1. Smart Cohort Segmentation

Define user cohorts with powerful, flexible rules:

```javascript
// Simple equality
{ "country": "JP", "plan": "premium" }

// Array contains
{ "tags": { "$contains": "beta-tester" } }

// Numeric ranges
{ "age": { "$gte": 25, "$lte": 35 } }

// Complex combinations
{
  "country": "US",
  "plan": "enterprise",
  "age": { "$gte": 18 },
  "tags": { "$contains": "early-adopter" }
}
```

**One-Click Materialization**: Automatically calculate cohort membership based on rules.

[Learn more about cohort rules →](#cohort-rules)

### 2. Campaign Management

- **Templates**: Create reusable campaign templates
- **Scheduling**: Schedule campaigns for future launch
- **Status Tracking**: Draft → Scheduled → Active → Completed workflow
- **Multi-Type**: Support for surveys, interviews, and custom types

### 3. AI-Powered Analytics

- **Sentiment Analysis**: Automatic sentiment scoring for responses
- **Response Metrics**: Track completion rates and response quality
- **Campaign Analytics**: Response rates, average sentiment, engagement metrics
- **Cohort Insights**: Member trends, response rates, demographic analysis

### 4. Extensibility Layer

Plug-and-play adapters for external services:

**Notification Adapters**: Email (SendGrid, AWS SES), SMS (Twilio), Push
**Analytics Adapters**: Segment, Mixpanel, Amplitude
**AI Adapters**: OpenAI, Anthropic for sentiment analysis

[See integration recipes →](./docs/INTEGRATION_RECIPES.md)

### 5. Tags & Organization

- Flexible tagging system for users, cohorts, and campaigns
- Tag categories for organization
- Color coding for visual management
- Tag-based filtering and search

### 6. User Preferences

- Opt-in/opt-out management
- Communication channel preferences (email, SMS)
- Frequency caps to prevent survey fatigue
- Language preferences

### 7. Audit Trail

- Complete history of all entity changes
- User activity tracking
- Compliance and reporting ready
- IP address and user agent logging

## API Documentation

### Endpoints

**Users**
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Cohorts**
- `GET /api/cohorts` - List cohorts
- `POST /api/cohorts` - Create cohort
- `GET /api/cohorts/:id` - Get cohort details
- `PATCH /api/cohorts/:id` - Update cohort
- `DELETE /api/cohorts/:id` - Delete cohort
- `POST /api/cohorts/:id/materialize` - Materialize members

**Campaigns**
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PATCH /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

**Responses**
- `GET /api/responses` - List responses
- `POST /api/responses` - Submit response
- `GET /api/responses/:id` - Get response details
- `PATCH /api/responses/:id` - Update response
- `DELETE /api/responses/:id` - Delete response

**Metrics**
- `GET /api/metrics` - Prometheus metrics endpoint

### Example API Usage

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "attributesJson": {
      "country": "US",
      "age": 30,
      "plan": "premium"
    }
  }'

# Create a cohort
curl -X POST http://localhost:3000/api/cohorts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "US Premium Users",
    "description": "Premium plan users in the US",
    "ruleJson": {
      "country": "US",
      "plan": "premium"
    }
  }'

# Materialize cohort members
curl -X POST http://localhost:3000/api/cohorts/:cohortId/materialize
```

## Cohort Rules

The cohort engine supports sophisticated filtering:

### Operators

| Operator | Description | Example |
|----------|-------------|---------|
| Equality | Direct value match | `{ "country": "JP" }` |
| `$contains` | Array contains value | `{ "tags": { "$contains": "beta" } }` |
| `$gte` | Greater than or equal | `{ "age": { "$gte": 18 } }` |
| `$lte` | Less than or equal | `{ "age": { "$lte": 65 } }` |
| `$gt` | Greater than | `{ "score": { "$gt": 80 } }` |
| `$lt` | Less than | `{ "score": { "$lt": 100 } }` |

### Example Rules

```javascript
// Japanese power users
{
  "country": "JP",
  "tag": "power-user"
}

// Enterprise customers aged 30-50
{
  "plan": "enterprise",
  "age": { "$gte": 30, "$lte": 50 }
}

// Beta testers in specific countries
{
  "tags": { "$contains": "beta-tester" },
  "country": { "$in": ["US", "UK", "CA"] }
}

// High-value engaged users
{
  "plan": "premium",
  "lifetime_value": { "$gte": 1000 },
  "last_active_days": { "$lte": 7 }
}
```

[View cohort engine implementation →](./lib/cohort-engine.ts)

## Extensibility

The platform is built with extensibility in mind.

### Adapter Pattern

Create custom adapters by implementing interfaces:

```typescript
// Example: Custom notification adapter
import { INotificationAdapter } from './lib/adapters/notification.adapter'

class CustomEmailAdapter implements INotificationAdapter {
  async sendEmail(payload: NotificationPayload) {
    // Your implementation
  }
}

// Register adapter
import { setNotificationAdapter } from './lib/adapters/notification.adapter'
setNotificationAdapter(new CustomEmailAdapter())
```

### Domain Events

Subscribe to domain events for side effects:

```typescript
import { eventBus, EventTypes } from './lib/events'

eventBus.on(EventTypes.CAMPAIGN_LAUNCHED, async (event) => {
  // Send notifications
  // Track analytics
  // Update metrics
})
```

**Available Events:**
- `user.created`, `user.updated`, `user.deleted`
- `cohort.created`, `cohort.materialized`, `cohort.updated`
- `campaign.created`, `campaign.launched`, `campaign.completed`
- `response.received`, `response.updated`

[View architecture docs →](./docs/ARCHITECTURE.md)

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Test Structure

```
__tests__/
├── lib/
│   ├── cohort-engine.test.ts
│   └── validation.test.ts
└── api/
    ├── users.test.ts
    └── cohorts.test.ts
```

### Example Test

```typescript
import { describe, it, expect } from 'vitest'
import { previewCohortRule } from '@/lib/cohort-engine'

describe('Cohort Engine', () => {
  it('should match users with simple equality rule', async () => {
    const rule = { country: 'JP' }
    const result = await previewCohortRule(rule)
    expect(result).toHaveLength(2)
  })
})
```

## Deployment

### Docker Production Build

```dockerfile
# Build
docker build -t feedback-panel-platform .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  feedback-panel-platform
```

### Docker Compose

```bash
docker compose up -d
```

Includes:
- Next.js application
- PostgreSQL database
- Auto-migration on startup
- Health checks
- Volume persistence

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Node
NODE_ENV=production
LOG_LEVEL=info

# Optional integrations
SENDGRID_API_KEY=...
OPENAI_API_KEY=...
SEGMENT_WRITE_KEY=...
```

[View .env.example →](./.env.example)

## Integration Examples

### SendGrid Email Notifications

```typescript
import { SendGridAdapter } from './lib/adapters/sendgrid.adapter'
import { setNotificationAdapter } from './lib/adapters/notification.adapter'

setNotificationAdapter(new SendGridAdapter())
```

### Segment Analytics

```typescript
import { SegmentAdapter } from './lib/adapters/segment.adapter'
import { setAnalyticsAdapter } from './lib/adapters/analytics.adapter'

setAnalyticsAdapter(new SegmentAdapter())
```

### OpenAI Sentiment Analysis

```typescript
import { OpenAIAdapter } from './lib/adapters/openai.adapter'
import { setAIAdapter } from './lib/adapters/ai.adapter'

setAIAdapter(new OpenAIAdapter())
```

[View complete integration guide →](./docs/INTEGRATION_RECIPES.md)

## Monitoring & Observability

- **Structured Logging**: Winston with JSON output
- **Metrics**: Prometheus-compatible at `/api/metrics`
- **Audit Logs**: Complete entity change history
- **Health Checks**: Database connectivity and service health

## Demo Data

The platform includes comprehensive seed data:

- 11 diverse panel users across multiple countries
- 8 cohorts with various rule types
- 3 campaign templates
- 6 feedback campaigns in different statuses
- 8 feedback responses with realistic data
- Tags, preferences, analytics, and audit logs

### Explore Demo

1. Start the application
2. Visit http://localhost:3000
3. Navigate through Users, Cohorts, Campaigns, and Responses
4. Try creating new cohorts and materializing members
5. Explore the API endpoints

## Future Extensions

### Planned Features
- GraphQL API alongside REST
- Real-time collaboration and comments
- Advanced AI-powered insights and predictions
- Mobile SDK for in-app feedback
- Campaign A/B testing framework
- Multi-tenancy and organization management
- Template marketplace
- Advanced scheduling (recurring campaigns)
- Response webhooks and integrations
- Custom reporting and dashboards

### Phase 4 Ideas
- White-label deployment options
- Advanced permissioning (RBAC)
- Data export and compliance tools (GDPR)
- Localization and i18n
- Performance optimization (caching, CDN)
- Real-time notifications (WebSockets)
- Advanced analytics (cohort retention, churn prediction)

[View detailed roadmap →](./docs/PHASE3_OVERVIEW.md)

## Contributing

Contributions are welcome! Please see our contributing guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Support

- **Documentation**: See `docs/` directory
- **Issues**: GitHub Issues
- **Architecture**: [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Integration Recipes**: [INTEGRATION_RECIPES.md](./docs/INTEGRATION_RECIPES.md)
- **Phase 3 Overview**: [PHASE3_OVERVIEW.md](./docs/PHASE3_OVERVIEW.md)

---

**Built with ❤️ for product teams and researchers**

*A production-ready building block for AI-driven community and product ecosystems*
