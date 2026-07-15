/*
  Warnings:

  - You are about to drop the column `pickupAddress` on the `SellerProfile` table. All the data in the column will be lost.
  - Added the required column `addressId` to the `SellerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SellerProfile" DROP COLUMN "pickupAddress",
ADD COLUMN     "addressId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DeliveryPricing" (
    "id" TEXT NOT NULL,
    "fromAreaId" TEXT NOT NULL,
    "toAreaId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "governorateId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "nearestReference" TEXT,
    "label" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryPricing_fromAreaId_idx" ON "DeliveryPricing"("fromAreaId");

-- CreateIndex
CREATE INDEX "DeliveryPricing_toAreaId_idx" ON "DeliveryPricing"("toAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryPricing_fromAreaId_toAreaId_key" ON "DeliveryPricing"("fromAreaId", "toAreaId");

-- CreateIndex
CREATE INDEX "Address_governorateId_idx" ON "Address"("governorateId");

-- CreateIndex
CREATE INDEX "Address_areaId_idx" ON "Address"("areaId");

-- CreateIndex
CREATE INDEX "Address_zoneId_idx" ON "Address"("zoneId");

-- AddForeignKey
ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_governorateId_fkey" FOREIGN KEY ("governorateId") REFERENCES "Governorate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
