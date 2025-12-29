import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkOrgVolunteers() {
  const orgUsers = await prisma.volunteer.findMany({
    where: { role: "ORG" },
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  });

  console.log("Volunteers with ORG role:");
  console.table(orgUsers);
}

checkOrgVolunteers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
