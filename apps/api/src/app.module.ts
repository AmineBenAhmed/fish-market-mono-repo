import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AllExceptionsFilter } from './common/filters';
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from './common/guards';
import { LoggingInterceptor } from './common/interceptors';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AdminOrdersModule } from './modules/admin-orders/admin-orders.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { AuthModule } from './modules/auth/auth.module';
import { BillingModule } from './modules/billing/billing.module';
import { CacheModule } from './modules/cache/cache.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CommissionModule } from './modules/commission/commission.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { DeliveryFeeModule } from './modules/delivery-fee/delivery-fee.module';
import { DeliveryZoneModule } from './modules/delivery-zones/delivery-zone.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { EventsModule } from './modules/events/events.module';
import { FilesModule } from './modules/files/files.module';
import { GatewaysModule } from './modules/gateways/gateways.module';
import { HealthModule } from './modules/health/health.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ListingsModule } from './modules/listings/listings.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { ProductsModule } from './modules/products/products.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { SellerOrdersModule } from './modules/seller-orders/seller-orders.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { UserSettingsModule } from './modules/user-settings/user-settings.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 300,
      },
    ]),

    PrismaModule,
    RedisModule,
    CacheModule,
    JobsModule,
    HealthModule,
    AuthModule,
    UsersModule,
    AddressesModule,
    SellersModule,
    DriversModule,
    UserSettingsModule,
    CategoriesModule,
    ProductsModule,
    ListingsModule,
    MarketplaceModule,
    CartModule,
    OrdersModule,
    SellerOrdersModule,
    AdminOrdersModule,
    AuditLogModule,
    EventsModule,
    NotificationModule,
    PaymentsModule,
    WalletModule,
    CommissionModule,
    DeliveryFeeModule,
    DeliveryZoneModule,
    BillingModule,
    DeliveriesModule,
    CloudinaryModule,
    FilesModule,
    GatewaysModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
