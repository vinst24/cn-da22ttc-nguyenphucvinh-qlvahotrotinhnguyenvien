/*
  Warnings:

  - The values [GOVERNMENT,COMPANY,OTHER,CHARITY,UNIVERSITY,RELIGIOUS] on the enum `OrganizationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrganizationType_new" AS ENUM ('NGO', 'SCHOOL', 'HOSPITAL', 'COMMUNITY', 'ENVIRONMENTAL');
ALTER TABLE "ORGANIZATION" ALTER COLUMN "TYPE" TYPE "OrganizationType_new" USING ("TYPE"::text::"OrganizationType_new");
ALTER TYPE "OrganizationType" RENAME TO "OrganizationType_old";
ALTER TYPE "OrganizationType_new" RENAME TO "OrganizationType";
DROP TYPE "public"."OrganizationType_old";
COMMIT;
