import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function generateEventsFromData() {
  try {
    console.log("========== GENERATING EVENTS FROM EXISTING DATA ==========\n");

    // Get all volunteers and organizations
    console.log("📊 Fetching existing data...");
    const volunteers = await prisma.volunteer.findMany();
    const organizations = await prisma.organization.findMany();
    const communes = await prisma.commune.findMany();

    console.log(`✓ Found ${volunteers.length} volunteers`);
    console.log(`✓ Found ${organizations.length} organizations`);
    console.log(`✓ Found ${communes.length} communes\n`);

    if (organizations.length === 0) {
      console.log("⚠️  No organizations found. Please create organizations first.");
      process.exit(0);
    }

    if (communes.length === 0) {
      console.log("⚠️  No communes found. Please run seedProvincesCommunes.js first.");
      process.exit(0);
    }

    // Sample event templates
    const eventTemplates = [
      {
        title: "Lau dọn môi trường cộng đồng",
        description: "Tham gia cùng chúng tôi để làm sạch khu vực công cộng và bảo vệ môi trường.",
        image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=500",
        maxVolunteers: 30,
        address: "Công viên địa phương",
        duration: 4, // hours
      },
      {
        title: "Dạy kèm tiếng Anh cho trẻ em",
        description: "Hỗ trợ giảng dạy tiếng Anh cơ bản cho các em nhỏ ở vùng ngoại thành.",
        image: "https://images.unsplash.com/photo-1427504494785-cdbb3d32a6e4?w=500",
        maxVolunteers: 15,
        address: "Trường tiểu học địa phương",
        duration: 3,
      },
      {
        title: "Chương trình khám sức khỏe miễn phí",
        description: "Tổ chức khám sức khỏe tổng quát miễn phí cho cộng đồng.",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500",
        maxVolunteers: 20,
        address: "Trung tâm y tế địa phương",
        duration: 8,
      },
      {
        title: "Xây dựng nhà tình thương",
        description: "Tham gia giúp xây dựng nhà tình thương cho gia đình khó khăn.",
        image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500",
        maxVolunteers: 50,
        address: "Địa bàn cần hỗ trợ",
        duration: 10,
      },
      {
        title: "Trồng cây xanh cho thành phố",
        description: "Cùng nhau trồng cây xanh để cải thiện không gian sống.",
        image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=500",
        maxVolunteers: 25,
        address: "Công viên hoặc khu đất công cộng",
        duration: 4,
      },
      {
        title: "Dạy kỹ năng mềm cho thanh niên",
        description: "Workshop về kỹ năng mềm: giao tiếp, làm việc nhóm, lãnh đạo.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500",
        maxVolunteers: 40,
        address: "Trung tâm đào tạo địa phương",
        duration: 8,
      },
      {
        title: "Chương trình ăn cơm chay từ thiện",
        description: "Chuẩn bị và phục vụ cơm chay miễn phí cho những người khó khăn.",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        maxVolunteers: 35,
        address: "Chùa hoặc trung tâm cộng đồng",
        duration: 6,
      },
      {
        title: "Hỗ trợ dạy học cho trẻ khuyết tật",
        description: "Giáo dục đặc biệt cho trẻ em khuyết tật.",
        image: "https://images.unsplash.com/photo-1427504494785-cdbb3d32a6e4?w=500",
        maxVolunteers: 12,
        address: "Trung tâm giáo dục đặc biệt",
        duration: 4,
      },
      {
        title: "Vận động quyên góp sách và đồ dùng học tập",
        description: "Quyên góp sách, bút, vở để hỗ trợ trẻ em vùng sâu vùng xa.",
        image: "https://images.unsplash.com/photo-1507842955343-583cf15ee341?w=500",
        maxVolunteers: 20,
        address: "Trung tâm tình nguyện",
        duration: 8,
      },
      {
        title: "Chơi đá bóng và thể thao với trẻ em",
        description: "Tổ chức hoạt động thể thao vui vẻ rèn luyện sức khỏe cho trẻ em.",
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500",
        maxVolunteers: 30,
        address: "Sân vận động hoặc sân trường",
        duration: 2,
      },
    ];

    // Generate events
    console.log("🎯 Generating events...\n");
    let eventCount = 0;
    const statuses = ["UPCOMING", "ONGOING", "FINISHED"];

    // For each organization, create multiple events across different communes
    for (const org of organizations) {
      // Get random communes for this org's events
      const randomCommunes = communes
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(5, communes.length)); // Max 5 events per org

      for (let i = 0; i < randomCommunes.length && i < eventTemplates.length; i++) {
        const template = eventTemplates[i];
        const commune = randomCommunes[i];

        // Generate random dates
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60)); // 0-60 days from now
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + template.duration);

        // Determine status based on date
        let status = "UPCOMING";
        if (startDate < new Date()) {
          status = Math.random() > 0.5 ? "FINISHED" : "ONGOING";
        }

        try {
          const event = await prisma.event.create({
            data: {
              organizationId: org.id,
              communeId: commune.id,
              title: template.title,
              description: template.description,
              image: template.image,
              maxVolunteers: template.maxVolunteers,
              currentParticipants: Math.floor(Math.random() * (template.maxVolunteers / 2)),
              address: `${template.address}, ${commune.name}`,
              startDate,
              endDate,
              status: status,
              isApproved: Math.random() > 0.3, // 70% approved
            },
          });

          console.log(`   ✓ Created event: "${event.title}" for ${org.name}`);
          eventCount++;
        } catch (err) {
          console.error(`   ✗ Failed to create event: ${err.message}`);
        }
      }
    }

    console.log(`\n========== EVENT GENERATION COMPLETED ==========`);
    console.log(`✓ Created ${eventCount} new events`);

    const finalEventCount = await prisma.event.count();
    console.log(`✓ Total events in database: ${finalEventCount}`);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

generateEventsFromData();
