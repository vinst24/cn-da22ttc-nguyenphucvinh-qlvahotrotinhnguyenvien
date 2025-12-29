-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrganizationType" ADD VALUE 'CHARITY';
ALTER TYPE "OrganizationType" ADD VALUE 'UNIVERSITY';
ALTER TYPE "OrganizationType" ADD VALUE 'HOSPITAL';
ALTER TYPE "OrganizationType" ADD VALUE 'RELIGIOUS';
ALTER TYPE "OrganizationType" ADD VALUE 'COMMUNITY';
ALTER TYPE "OrganizationType" ADD VALUE 'ENVIRONMENTAL';
