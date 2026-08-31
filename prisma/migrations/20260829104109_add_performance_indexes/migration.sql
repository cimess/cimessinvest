-- CreateIndex
CREATE INDEX "Image_category_createdAt_idx" ON "Image"("category", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt" DESC);
