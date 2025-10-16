/*
  Warnings:

  - You are about to drop the column `product` on the `CartItem` table. All the data in the column will be lost.
  - Added the required column `price` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "product",
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL;
