# Architecture

## Overview

The Feedback Panel Platform follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│  (Next.js App Router, React Components) │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│            API Layer                    │
│  (REST Endpoints, Validation, Auth)     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│          Business Logic Layer           │
│  (Cohort Engine, Event Handlers)        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       Extensibility Layer               │
│  (Adapters, Events, Plugins)            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Data Layer                      │
│  (Prisma ORM, PostgreSQL)               │
└─────────────────────────────────────────┘
```

## Directory Structure

```
feedback-panel-platform/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── users/           # User CRUD endpoints
│   │   ├── cohorts/         # Cohort management
│   │   ├── campaigns/       # Campaign operations
│   │   ├── responses/       # Response handling
│   │   └── metrics/         # Prometheus metrics
│   ├── users/               # User management UI
│   ├── cohorts/             # Cohort management UI
│   ├── campaigns/           # Campaign management UI
│   └── responses/           # Response viewing UI
├── lib/                      # Shared libraries
│   ├── adapters/            # Extension interfaces
│   │   ├── notification.adapter.ts
│   │   ├── analytics.adapter.ts
│   │   └── ai.adapter.ts
│   ├── events/              # Domain events
│   │   ├── types.ts
│   │   ├── event-bus.ts
│   │   └── handlers.ts
│   ├── cohort-engine.ts     # Cohort materialization logic
│   ├── validation.ts        # Zod schemas
│   ├── errors.ts            # Error handling
│   ├── logger.ts            # Winston logging
│   ├── metrics.ts           # Prometheus metrics
│   └── prisma.ts            # Prisma client
├── prisma/                   # Database schema & migrations
│   ├── schema.prisma
│   ├── seed.ts              # Basic seed
│   └── seed-enhanced.ts     # Comprehensive seed
├── components/               # Shared React components
├── __tests__/                # Test suites
└── docs/                     # Documentation
```

## Core Components

### 1. Cohort Engine (`lib/cohort-engine.ts`)

The cohort engine is responsible for:
- Evaluating rule-based filters
- Materializing cohort members
- Supporting various operators ($contains, $gte, etc.)

**Rule Evaluation Flow:**
1. Load cohort rules from database
2. Fetch all panel users
3. Apply rule matchers to each user's attributes
4. Calculate diff between current and target membership
5. Update cohortMember records

### 2. Event System (`lib/events/`)

Domain events enable loose coupling and extensibility:

**Event Flow:**
```
Action → Event Emitted → Event Handlers → Side Effects
```

**Example:**
```typescript
// When a response is received:
ResponseReceived Event
  → Sentiment Analysis (AI Adapter)
  → Analytics Tracking (Analytics Adapter)
  → Update Campaign Metrics
```

### 3. Adapter Pattern (`lib/adapters/`)

Adapters provide pluggable integrations:

**Notification Adapter:**
- Email (SendGrid, AWS SES, etc.)
- SMS (Twilio, etc.)
- Push (FCM, APNs, etc.)

**Analytics Adapter:**
- Segment
- Mixpanel
- Amplitude
- Custom analytics

**AI Adapter:**
- Sentiment analysis
- Text summarization
- Auto-categorization

### 4. Validation Layer (`lib/validation.ts`)

All API inputs are validated using Zod schemas:
- Type safety
- Runtime validation
- Clear error messages

### 5. Error Handling (`lib/errors.ts`)

Centralized error handling with:
- Custom error types
- Consistent error responses
- Proper HTTP status codes
- Error logging

## Data Flow Examples

### Creating a Campaign

```
User submits form
  ↓
POST /api/campaigns
  ↓
Validate input (Zod)
  ↓
Create campaign record
  ↓
Emit CampaignCreated event
  ↓
Event handlers:
  - Send notifications to cohort
  - Track analytics
  - Create initial metrics
```

### Receiving a Response

```
External webhook/form
  ↓
POST /api/responses
  ↓
Validate input
  ↓
Create response record
  ↓
Emit ResponseReceived event
  ↓
Event handlers:
  - Analyze sentiment (AI)
  - Update campaign analytics
  - Track user engagement
```

## Extensibility

### Adding a New Adapter

1. Create interface in `lib/adapters/`
2. Implement concrete adapter
3. Add singleton getter/setter
4. Use in event handlers or services

### Adding a New Event

1. Define payload type in `lib/events/types.ts`
2. Add event type constant
3. Emit event at appropriate location
4. Add handlers in `lib/events/handlers.ts`

## Performance Considerations

- **Database Indexes**: Critical paths are indexed (audit logs, tags)
- **Caching**: Can add Redis for frequent queries
- **Background Jobs**: Event handlers are async
- **Query Optimization**: Use Prisma includes strategically

## Security

- **Input Validation**: All inputs validated with Zod
- **SQL Injection**: Protected by Prisma ORM
- **XSS**: React escapes outputs by default
- **Rate Limiting**: Can add middleware
- **Authentication**: Ready for auth integration

## Monitoring

- **Logging**: Winston with structured logs
- **Metrics**: Prometheus exportable at `/api/metrics`
- **Health Checks**: Can add `/api/health` endpoint
- **Tracing**: Ready for OpenTelemetry

## Testing Strategy

- **Unit Tests**: Business logic (cohort engine, validation)
- **Integration Tests**: API endpoints
- **E2E Tests**: Can add with Playwright
- **Mocks**: Adapter interfaces make testing easy
