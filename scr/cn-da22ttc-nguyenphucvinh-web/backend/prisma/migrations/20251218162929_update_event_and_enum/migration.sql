/*
  Warnings:

  - The values [APPROVED] on the enum `EventStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventStatus_new" AS ENUM ('UPCOMING', 'ONGOING', 'FINISHED', 'CANCELED');
ALTER TABLE "EVENT" ALTER COLUMN "STATUS" TYPE "EventStatus_new" USING ("STATUS"::text::"EventStatus_new");
ALTER TYPE "EventStatus" RENAME TO "EventStatus_old";
ALTER TYPE "EventStatus_new" RENAME TO "EventStatus";
DROP TYPE "public"."EventStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "EVENT" ADD COLUMN     "ISAPPROVED" BOOLEAN NOT NULL DEFAULT false;
