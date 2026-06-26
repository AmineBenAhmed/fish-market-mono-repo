import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AdminDriversController } from './admin-drivers.controller';
import { DriverStatusController } from './driver-status.controller';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';

@Module({
  imports: [PrismaModule],
  controllers: [DriversController, DriverStatusController, AdminDriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
