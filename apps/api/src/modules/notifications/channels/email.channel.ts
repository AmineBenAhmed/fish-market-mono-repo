import { Injectable, Logger } from '@nestjs/common';

import { NotificationChannel, NotificationPayload } from './notification-channel.interface';

@Injectable()
export class EmailNotificationChannel implements NotificationChannel {
  readonly name = 'email';
  private readonly logger = new Logger(EmailNotificationChannel.name);

  async send(payload: NotificationPayload): Promise<void> {
    this.logger.log(`[EMAIL STUB] Would send email for ${payload.type}: ${payload.title}`);
  }
}
