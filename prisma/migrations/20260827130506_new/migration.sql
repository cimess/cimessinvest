-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "heroGridImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "heroVideoUrl" TEXT,
ADD COLUMN     "rawMaterialImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tailorBioImage" TEXT,
ADD COLUMN     "tailorBioText" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "customStorageMB" INTEGER;
