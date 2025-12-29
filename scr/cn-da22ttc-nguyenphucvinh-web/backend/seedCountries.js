import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

async function main() {
  try {
    const res = await axios.get("https://open.oapi.vn/location/countries");
    const countries = res.data.data;

    for (const c of countries) {
      // c.id từ API là string, DB cần int
      await prisma.country.upsert({
        where: { id: parseInt(c.id) },
        update: {},
        create: {
          id: parseInt(c.id),
          name: c.name,
        },
      });
    }

    console.log("Seed countries xong!");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
