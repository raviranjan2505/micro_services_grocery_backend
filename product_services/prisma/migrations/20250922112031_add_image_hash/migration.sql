/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "hash" TEXT,
ADD COLUMN     "publicId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_hash_key" ON "public"."Product"("hash");
