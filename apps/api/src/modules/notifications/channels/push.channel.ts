import { Injectable, Logger } from '@nestjs/common';

import { NotificationChannel, NotificationPayload } from './notification-channel.interface';

@Injectable()
export class PushNotificationChannel implements NotificationChannel {
  readonly name = 'push';
  private readonly logger = new Logger(PushNotificationChannel.name);

  async send(payload: NotificationPayload): Promise<void> {
    this.logger.log(`[PUSH STUB] Would send push for ${payload.type}: ${payload.title}`);
  }
}
