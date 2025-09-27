/*
  Warnings:

  - A unique constraint covering the columns `[slug,parentId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Category_slug_key";

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "imagePublicId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_parentId_key" ON "public"."Category"("slug", "parentId");
