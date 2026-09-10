-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "group" TEXT DEFAULT 'Native',
ADD COLUMN     "placement" TEXT DEFAULT 'both';

-- CreateIndex
CREATE INDEX "Image_group_createdAt_idx" ON "Image"("group", "createdAt" DESC);
