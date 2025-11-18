/**
 * Notification Adapter Interface
 * Allows plugging in different notification providers (Email, SMS, Push, etc.)
 */

export interface NotificationPayload {
  to: string
  subject?: string
  body: string
  template?: string
  variables?: Record<string, any>
}

export interface NotificationResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface INotificationAdapter {
  sendEmail(payload: NotificationPayload): Promise<NotificationResult>
  sendSMS(payload: NotificationPayload): Promise<NotificationResult>
  sendPush(payload: NotificationPayload): Promise<NotificationResult>
}

/**
 * No-op notification adapter for testing/development
 */
export class NoOpNotificationAdapter implements INotificationAdapter {
  async sendEmail(payload: NotificationPayload): Promise<NotificationResult> {
    console.log('[NoOp] Email notification:', payload)
    return { success: true, messageId: `noop-email-${Date.now()}` }
  }

  async sendSMS(payload: NotificationPayload): Promise<NotificationResult> {
    console.log('[NoOp] SMS notification:', payload)
    return { success: true, messageId: `noop-sms-${Date.now()}` }
  }

  async sendPush(payload: NotificationPayload): Promise<NotificationResult> {
    console.log('[NoOp] Push notification:', payload)
    return { success: true, messageId: `noop-push-${Date.now()}` }
  }
}

/**
 * Console notification adapter for development
 */
export class ConsoleNotificationAdapter implements INotificationAdapter {
  async sendEmail(payload: NotificationPayload): Promise<NotificationResult> {
    console.log('📧 EMAIL:', {
      to: payload.to,
      subject: payload.subject,
      body: payload.body
    })
    return { success: true, messageId: `console-email-${Date.now()}` }
  }

  async sendSMS(payload: NotificationPayload): Promise<NotificationResult> {
    console.log('📱 SMS:', {
      to: payload.to,
      body: payload.body
    })
    return { success: true, messageId: `console-sms-${Date.now()}` }
  }

  async sendPush(payload: NotificationPayload): Promise<NotificationResult> {
    console.log('🔔 PUSH:', {
      to: payload.to,
      body: payload.body
    })
    return { success: true, messageId: `console-push-${Date.now()}` }
  }
}

// Singleton instance - can be replaced at runtime
let notificationAdapter: INotificationAdapter = new ConsoleNotificationAdapter()

export function setNotificationAdapter(adapter: INotificationAdapter) {
  notificationAdapter = adapter
}

export function getNotificationAdapter(): INotificationAdapter {
  return notificationAdapter
}
