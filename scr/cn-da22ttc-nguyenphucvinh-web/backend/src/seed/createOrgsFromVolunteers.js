import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createOrganizationsFromOrgVolunteers() {
  const orgUsers = await prisma.volunteer.findMany({
    where: { role: "ORG" },
  });

  for (const user of orgUsers) {
    await prisma.organization.create({
      data: {
        name: `Org of ${user.fullName}`,
        type: "OTHER", // Thay đổi theo enum OrganizationType của bạn
      },
    });
    console.log(`Created organization for ${user.fullName}`);
  }
}

createOrganizationsFromOrgVolunteers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
