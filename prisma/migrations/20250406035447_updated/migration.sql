/*
  Warnings:

  - You are about to drop the column `adminId` on the `Hospital` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "Hospital" DROP CONSTRAINT "Hospital_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Pharmacist" DROP CONSTRAINT "Pharmacist_hospitalId_fkey";

-- AlterTable
ALTER TABLE "Doctor" ALTER COLUMN "hospitalId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Hospital" DROP COLUMN "adminId";

-- AlterTable
ALTER TABLE "Pharmacist" ALTER COLUMN "hospitalId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pharmacist" ADD CONSTRAINT "Pharmacist_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE;
