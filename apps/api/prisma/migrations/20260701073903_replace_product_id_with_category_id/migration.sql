/*
  Warnings:

  - You are about to drop the column `productId` on the `SellerListing` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `SellerListing` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SellerListing" DROP CONSTRAINT "SellerListing_productId_fkey";

-- DropIndex
DROP INDEX "SellerListing_productId_date_status_idx";

-- DropIndex
DROP INDEX "SellerListing_variantId_sellerId_date_key";

-- AlterTable
ALTER TABLE "SellerListing" DROP COLUMN "productId",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "SellerListing_categoryId_date_status_idx" ON "SellerListing"("categoryId", "date", "status");

-- AddForeignKey
ALTER TABLE "SellerListing" ADD CONSTRAINT "SellerListing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FishCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
