/*
  Warnings:

  - The values [LEADER,MANAGER] on the enum `VolunteerRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VolunteerRole_new" AS ENUM ('MEMBER', 'ORG', 'ADMIN', 'SUPER_ADMIN');
ALTER TABLE "VOLUNTEER" ALTER COLUMN "ROLE" TYPE "VolunteerRole_new" USING ("ROLE"::text::"VolunteerRole_new");
ALTER TYPE "VolunteerRole" RENAME TO "VolunteerRole_old";
ALTER TYPE "VolunteerRole_new" RENAME TO "VolunteerRole";
DROP TYPE "public"."VolunteerRole_old";
COMMIT;
