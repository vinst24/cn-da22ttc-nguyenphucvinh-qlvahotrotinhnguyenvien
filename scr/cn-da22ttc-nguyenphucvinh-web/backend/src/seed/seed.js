import { PrismaClient } from "@prisma/client";
import { sampleEvents } from "./sampleData.js";
import { communes, organizations, participations, provinces } from "./sampleLocations.js";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("========== SEEDING DATABASE ==========\n");

    // Delete in correct order (respecting foreign key constraints)
    console.log("🗑️  Clearing old data...");
    await prisma.event.deleteMany();
    await prisma.participation.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.commune.deleteMany();
    await prisma.province.deleteMany();
    console.log("   ✓ Cleared old data\n");

    // Seed Provinces
    console.log("1️⃣  Seeding provinces...");
    for (const p of provinces) {
      await prisma.province.create({ data: p });
      console.log(`   ✓ Created province: ${p.name}`);
    }
    const provinceCount = await prisma.province.count();
    console.log(`   Total provinces: ${provinceCount}\n`);

    // Seed Communes
    console.log("2️⃣  Seeding communes...");
    for (const c of communes) {
      await prisma.commune.create({ data: c });
      console.log(`   ✓ Created commune: ${c.name} (Province ID: ${c.provinceId})`);
    }
    const communeCount = await prisma.commune.count();
    console.log(`   Total communes: ${communeCount}\n`);

    // Seed Organizations
    console.log("3️⃣  Seeding organizations...");
    for (const o of organizations) {
      await prisma.organization.create({ data: o });
      console.log(`   ✓ Created organization: ${o.name}`);
    }
    const orgCount = await prisma.organization.count();
    console.log(`   Total organizations: ${orgCount}\n`);

    // Seed Participations (linking users to organizations)
    console.log("4️⃣  Seeding participations...");
    for (const p of participations) {
      try {
        await prisma.participation.create({ data: p });
        console.log(`   ✓ Linked user ${p.userId} to organization ${p.organizationId}`);
      } catch (err) {
        console.warn(`   ⚠️  Could not link user ${p.userId}: ${err.message}`);
      }
    }
    const participationCount = await prisma.participation.count();
    console.log(`   Total participations: ${participationCount}\n`);

    // Seed Events
    console.log("5️⃣  Seeding events...");
    for (const e of sampleEvents) {
      try {
        await prisma.event.create({ data: e });
        console.log(`   ✓ Created event: "${e.title}"`);
      } catch (err) {
        console.error(`   ✗ Failed to create event "${e.title}":`, err.message);
      }
    }
    const eventCount = await prisma.event.count();
    console.log(`   Total events: ${eventCount}\n`);

    console.log("========== SEEDING COMPLETED SUCCESSFULLY ==========");
    console.log(`✓ Provinces: ${provinceCount}`);
    console.log(`✓ Communes: ${communeCount}`);
    console.log(`✓ Organizations: ${orgCount}`);
    console.log(`✓ Participations: ${participationCount}`);
    console.log(`✓ Events: ${eventCount}`);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
