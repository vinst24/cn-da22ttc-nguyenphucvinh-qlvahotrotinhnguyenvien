import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌍 Đang lấy danh sách tỉnh...");

    const provinceRes = await axios.get(
      "https://provinces.open-api.vn/api/v2/p/"
    );

    for (const p of provinceRes.data) {
      // ===== PROVINCE =====
      const province = await prisma.province.upsert({
        where: { name: p.name },
        update: {},
        create: {
          name: p.name,
        },
      });

      console.log(`🏙️ Province: ${province.name}`);

      // ===== COMMUNES =====
      const detailRes = await axios.get(
        `https://provinces.open-api.vn/api/v2/p/${p.code}?depth=2`
      );

      const communes = detailRes.data.wards || [];

      for (const c of communes) {
        await prisma.commune.upsert({
          where: {
            provinceId_name: {
              provinceId: province.id,
              name: c.name,
            },
          },
          update: {},
          create: {
            provinceId: province.id,
            name: c.name,
          },
        });
      }
    }

    console.log("✅ Seed tỉnh & xã thành công!");
  } catch (err) {
    console.error("❌ Seed thất bại:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
