-- Add normalized address fields to SellerProfile
ALTER TABLE "SellerProfile" ADD COLUMN "governorateId" TEXT NOT NULL DEFAULT 'sousse';
ALTER TABLE "SellerProfile" ADD COLUMN "areaId" TEXT NOT NULL DEFAULT 'sousse-medina';
ALTER TABLE "SellerProfile" ADD COLUMN "zoneId" TEXT NOT NULL DEFAULT 'sousse-medina-old-city';
ALTER TABLE "SellerProfile" ADD COLUMN "street" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SellerProfile" ADD COLUMN "buildingNumber" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN "apartment" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN "floor" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN "landmark" TEXT;

-- Drop old pickupAddress column
ALTER TABLE "SellerProfile" DROP COLUMN "pickupAddress";

-- Create DeliveryPricing table
CREATE TABLE "DeliveryPricing" (
    "id" TEXT NOT NULL,
    "fromZoneId" TEXT NOT NULL,
    "toZoneId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryPricing_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint and indexes
CREATE UNIQUE INDEX "DeliveryPricing_fromZoneId_toZoneId_key" ON "DeliveryPricing"("fromZoneId", "toZoneId");
CREATE INDEX "DeliveryPricing_fromZoneId_idx" ON "DeliveryPricing"("fromZoneId");
CREATE INDEX "DeliveryPricing_toZoneId_idx" ON "DeliveryPricing"("toZoneId");
