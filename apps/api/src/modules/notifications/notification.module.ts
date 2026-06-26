import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { DatabaseNotificationChannel } from './channels/database.channel';
import { EmailNotificationChannel } from './channels/email.channel';
import { PushNotificationChannel } from './channels/push.channel';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    DatabaseNotificationChannel,
    EmailNotificationChannel,
    PushNotificationChannel,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
