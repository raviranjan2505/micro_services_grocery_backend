/*
  Warnings:

  - You are about to drop the column `hash` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `publicId` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId,hash]` on the table `ProductImage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Product_hash_key";

-- DropIndex
DROP INDEX "public"."ProductImage_hash_key";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "hash",
DROP COLUMN "publicId";

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_productId_hash_key" ON "public"."ProductImage"("productId", "hash");
