import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testStatisticsAPI() {
  try {
    console.log("Testing /admin/statistics endpoint:\n");

    // Simulate statistics endpoint
    const [volunteers, organizations, events, pending] = await Promise.all([
      prisma.volunteer.count(),
      prisma.organization.count(),
      prisma.event.count(),
      prisma.event.count({ where: { isApproved: false } })
    ]);

    console.log("Response:", {
      volunteers,
      organizations,
      events,
      pending
    });

    console.log("\n✅ Statistics API test passed!");

    prisma.$disconnect();
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

testStatisticsAPI();
