import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteAllProvinces() {
  try {
    console.log("========== DELETING ALL PROVINCES AND COMMUNES ==========\n");

    // Delete events first (they reference communes)
    console.log("🗑️  Deleting events, participations, and organizations...");
    await prisma.join.deleteMany();
    await prisma.eventSkill.deleteMany();
    await prisma.notificationUser.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.event.deleteMany();
    await prisma.participation.deleteMany();
    await prisma.organization.deleteMany();
    console.log("✓ Deleted events and organizations\n");

    // Delete communes and provinces
    console.log("🗑️  Deleting communes and provinces...");
    const deletedCommunes = await prisma.commune.deleteMany();
    const deletedProvinces = await prisma.province.deleteMany();
    console.log(`✓ Deleted ${deletedCommunes.count} communes`);
    console.log(`✓ Deleted ${deletedProvinces.count} provinces\n`);

    console.log("========== DELETION COMPLETED SUCCESSFULLY ==========");
    console.log(`✓ All provinces and communes have been deleted`);
  } catch (err) {
    console.error("❌ Deletion error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllProvinces();
