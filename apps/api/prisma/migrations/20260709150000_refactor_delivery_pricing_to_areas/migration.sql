-- Rename DeliveryPricing from zone-level to area-level
DROP INDEX "DeliveryPricing_fromZoneId_idx";
DROP INDEX "DeliveryPricing_fromZoneId_toZoneId_key";
DROP INDEX "DeliveryPricing_toZoneId_idx";

ALTER TABLE "DeliveryPricing" DROP COLUMN "fromZoneId",
DROP COLUMN "toZoneId",
ADD COLUMN "fromAreaId" TEXT NOT NULL,
ADD COLUMN "toAreaId" TEXT NOT NULL;

CREATE INDEX "DeliveryPricing_fromAreaId_idx" ON "DeliveryPricing"("fromAreaId");
CREATE INDEX "DeliveryPricing_toAreaId_idx" ON "DeliveryPricing"("toAreaId");
CREATE UNIQUE INDEX "DeliveryPricing_fromAreaId_toAreaId_key" ON "DeliveryPricing"("fromAreaId", "toAreaId");
