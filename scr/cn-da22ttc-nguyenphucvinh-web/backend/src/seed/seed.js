import { PrismaClient } from "@prisma/client";
import { communes, organizations, provinces } from "./sampleLocations.js";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("========== SEEDING DATABASE ==========\n");

    // Delete in correct order (respecting foreign key constraints)
    // CHỈ XÓA HOẠT ĐỘNG, TỔ CHỨC - GIỮ LẠI TỈNH/XÃ
    console.log("🗑️  Clearing old events and organizations...");
    await prisma.join.deleteMany();
    await prisma.eventSkill.deleteMany();
    await prisma.notificationUser.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.event.deleteMany();
    await prisma.participation.deleteMany();
    await prisma.organization.deleteMany();
    console.log("   ✓ Cleared old data\n");

    // Seed Provinces
    console.log("1️⃣  Seeding provinces...");
    let provinceCount = await prisma.province.count();
    if (provinceCount === 0) {
      for (const p of provinces) {
        await prisma.province.create({ data: p });
        console.log(`   ✓ Created province: ${p.name}`);
      }
      provinceCount = await prisma.province.count();
      console.log(`   Total provinces: ${provinceCount}\n`);
    } else {
      console.log(`   ⚠️  Provinces already exist: ${provinceCount} provinces\n`);
    }

    // Seed Communes
    console.log("2️⃣  Seeding communes...");
    let communeCount = await prisma.commune.count();
    if (communeCount === 0) {
      for (const c of communes) {
        await prisma.commune.create({ data: c });
        console.log(`   ✓ Created commune: ${c.name} (Province ID: ${c.provinceId})`);
      }
      communeCount = await prisma.commune.count();
      console.log(`   Total communes: ${communeCount}\n`);
    } else {
      console.log(`   ⚠️  Communes already exist: ${communeCount} communes\n`);
    }

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
    // Bỏ qua participations vì user chưa tồn tại
    const participationCount = 0;
    console.log(`   Total participations: ${participationCount}\n`);

    // Seed Events - Use smart generation instead of hardcoded data
    console.log("5️⃣  Seeding events...");
    const eventTemplates = [
      {
        title: "Lau dọn môi trường cộng đồng",
        description: "Tham gia cùng chúng tôi để làm sạch khu vực công cộng và bảo vệ môi trường.",
        image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=500",
        maxVolunteers: 30,
        duration: 4,
      },
      {
        title: "Dạy kèm tiếng Anh cho trẻ em",
        description: "Hỗ trợ giảng dạy tiếng Anh cơ bản cho các em nhỏ ở vùng ngoại thành.",
        image: "https://images.unsplash.com/photo-1427504494785-cdbb3d32a6e4?w=500",
        maxVolunteers: 15,
        duration: 3,
      },
      {
        title: "Chương trình khám sức khỏe miễn phí",
        description: "Tổ chức khám sức khỏe tổng quát miễn phí cho cộng đồng.",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500",
        maxVolunteers: 20,
        duration: 8,
      },
      {
        title: "Xây dựng nhà tình thương",
        description: "Tham gia giúp xây dựng nhà tình thương cho gia đình khó khăn.",
        image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500",
        maxVolunteers: 50,
        duration: 10,
      },
      {
        title: "Trồng cây xanh cho thành phố",
        description: "Cùng nhau trồng cây xanh để cải thiện không gian sống.",
        image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=500",
        maxVolunteers: 25,
        duration: 4,
      },
    ];

    let eventCount = 0;
    if (orgCount > 0 && communeCount > 0) {
      for (const org of await prisma.organization.findMany()) {
        // Get some random communes for this org
        const randomCommunes = await prisma.commune.findMany({
          take: Math.min(3, Math.floor(communeCount / 2)),
          skip: Math.floor(Math.random() * (communeCount - 3)),
        });

        for (let i = 0; i < randomCommunes.length && i < eventTemplates.length; i++) {
          const template = eventTemplates[i];
          const commune = randomCommunes[i];

          const startDate = new Date();
          startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + template.duration);

          try {
            await prisma.event.create({
              data: {
                organizationId: org.id,
                communeId: commune.id,
                title: template.title,
                description: template.description,
                image: template.image,
                maxVolunteers: template.maxVolunteers,
                currentParticipants: 0,
                address: `${template.title} - ${commune.name}`,
                startDate,
                endDate,
                status: "UPCOMING",
                isApproved: true,
              },
            });
            console.log(`   ✓ Created event: "${template.title}"`);
            eventCount++;
          } catch (err) {
            console.warn(`   ⚠️  Could not create event: ${err.message}`);
          }
        }
      }
    }

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
