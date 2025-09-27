-- CreateTable
CREATE TABLE "public"."Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "parentId" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" SERIAL NOT NULL,
    "productCode" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "gstPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL,
    "subCategoryId" INTEGER,
    "subCategoryId2" INTEGER,
    "mrp" DOUBLE PRECISION NOT NULL,
    "dp" DOUBLE PRECISION NOT NULL,
    "stockQuantity" INTEGER NOT NULL,
    "productSlug" TEXT NOT NULL,
    "defaultImage" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_productCode_key" ON "public"."Product"("productCode");

-- CreateIndex
CREATE UNIQUE INDEX "Product_productSlug_key" ON "public"."Product"("productSlug");

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
