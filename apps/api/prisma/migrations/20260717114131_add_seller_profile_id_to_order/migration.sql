-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "sellerProfileId" TEXT;

-- CreateIndex
CREATE INDEX "Order_sellerProfileId_idx" ON "Order"("sellerProfileId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
