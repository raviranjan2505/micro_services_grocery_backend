/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `ProductImage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."ProductImage" ADD COLUMN     "hash" TEXT,
ADD COLUMN     "publicId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_hash_key" ON "public"."ProductImage"("hash");
