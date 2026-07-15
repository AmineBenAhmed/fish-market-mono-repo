/*
  Warnings:

  - You are about to drop the column `workingZone` on the `DriverProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DriverProfile" DROP COLUMN "workingZone",
ADD COLUMN     "addressId" TEXT;

-- CreateIndex
CREATE INDEX "DriverProfile_addressId_idx" ON "DriverProfile"("addressId");

-- AddForeignKey
ALTER TABLE "DriverProfile" ADD CONSTRAINT "DriverProfile_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
