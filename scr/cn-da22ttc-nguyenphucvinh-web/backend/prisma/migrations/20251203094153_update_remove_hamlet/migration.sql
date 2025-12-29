/*
  Warnings:

  - You are about to drop the column `ID_HAMLET` on the `EVENT` table. All the data in the column will be lost.
  - The primary key for the `LOCATION_USER` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID_HAMLET` on the `LOCATION_USER` table. All the data in the column will be lost.
  - You are about to drop the `HAMLET` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ID_COMMUNE` to the `EVENT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_COMMUNE` to the `LOCATION_USER` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EVENT" DROP CONSTRAINT "EVENT_ID_HAMLET_fkey";

-- DropForeignKey
ALTER TABLE "HAMLET" DROP CONSTRAINT "HAMLET_ID_COMMUNE_fkey";

-- DropForeignKey
ALTER TABLE "LOCATION_USER" DROP CONSTRAINT "LOCATION_USER_ID_HAMLET_fkey";

-- DropIndex
DROP INDEX "EVENT_ID_HAMLET_idx";

-- AlterTable
ALTER TABLE "EVENT" DROP COLUMN "ID_HAMLET",
ADD COLUMN     "ID_COMMUNE" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "LOCATION_USER" DROP CONSTRAINT "LOCATION_USER_pkey",
DROP COLUMN "ID_HAMLET",
ADD COLUMN     "ID_COMMUNE" INTEGER NOT NULL,
ADD CONSTRAINT "LOCATION_USER_pkey" PRIMARY KEY ("ID_COMMUNE", "ID_USER");

-- DropTable
DROP TABLE "HAMLET";

-- CreateIndex
CREATE INDEX "EVENT_ID_COMMUNE_idx" ON "EVENT"("ID_COMMUNE");

-- AddForeignKey
ALTER TABLE "EVENT" ADD CONSTRAINT "EVENT_ID_COMMUNE_fkey" FOREIGN KEY ("ID_COMMUNE") REFERENCES "COMMUNE"("ID_COMMUNE") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LOCATION_USER" ADD CONSTRAINT "LOCATION_USER_ID_COMMUNE_fkey" FOREIGN KEY ("ID_COMMUNE") REFERENCES "COMMUNE"("ID_COMMUNE") ON DELETE RESTRICT ON UPDATE CASCADE;
