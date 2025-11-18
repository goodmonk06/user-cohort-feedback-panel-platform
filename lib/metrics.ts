import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client'

export const register = new Registry()

// Collect default metrics
collectDefaultMetrics({ register })

// HTTP request duration histogram
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
})

// HTTP request counter
export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
})

// Business metrics
export const cohortMaterializationCounter = new Counter({
  name: 'cohort_materializations_total',
  help: 'Total number of cohort materializations',
  labelNames: ['cohort_id', 'status'],
  registers: [register]
})

export const cohortMembersGauge = new Counter({
  name: 'cohort_members_total',
  help: 'Total number of cohort members',
  labelNames: ['cohort_id'],
  registers: [register]
})

export const campaignCounter = new Counter({
  name: 'campaigns_total',
  help: 'Total number of campaigns',
  labelNames: ['type', 'status'],
  registers: [register]
})

export const responseCounter = new Counter({
  name: 'responses_total',
  help: 'Total number of responses',
  labelNames: ['campaign_id', 'campaign_type'],
  registers: [register]
})

// Utility functions
export function recordHttpRequest(
  method: string,
  route: string,
  statusCode: number,
  durationSeconds: number
) {
  httpRequestCounter.inc({ method, route, status_code: statusCode })
  httpRequestDuration.observe({ method, route, status_code: statusCode }, durationSeconds)
}

export function recordCohortMaterialization(cohortId: string, status: 'success' | 'error') {
  cohortMaterializationCounter.inc({ cohort_id: cohortId, status })
}

export function recordCampaignCreated(type: string, status: string = 'active') {
  campaignCounter.inc({ type, status })
}

export function recordResponse(campaignId: string, campaignType: string) {
  responseCounter.inc({ campaign_id: campaignId, campaign_type: campaignType })
}

export async function getMetrics(): Promise<string> {
  return register.metrics()
}
