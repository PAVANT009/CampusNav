-- AlterTable
ALTER TABLE "map_points" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "map_points" ADD CONSTRAINT "map_points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
