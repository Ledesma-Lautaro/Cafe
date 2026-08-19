-- DropForeignKey
ALTER TABLE "PointsLedger" DROP CONSTRAINT "PointsLedger_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "PointsLedger" DROP CONSTRAINT "PointsLedger_readingId_fkey";

-- AddForeignKey
ALTER TABLE "PointsLedger" ADD CONSTRAINT "PointsLedger_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "Reading"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsLedger" ADD CONSTRAINT "PointsLedger_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
