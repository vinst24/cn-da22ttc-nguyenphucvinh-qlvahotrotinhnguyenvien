import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testAPI() {
  try {
    // Test getEventsByMonth logic
    const events = await prisma.event.findMany({
      select: {
        id: true,
        startDate: true,
        title: true
      },
      where: {
        startDate: {
          not: null
        }
      }
    });

    console.log(`Found ${events.length} events with startDate\n`);

    // Count events by month
    const monthCounts = {};
    for (let m = 1; m <= 12; m++) {
      monthCounts[m] = 0;
    }

    events.forEach(event => {
      if (event.startDate) {
        const month = new Date(event.startDate).getMonth() + 1;
        monthCounts[month]++;
      }
    });

    // Format response
    const data = [];
    for (let m = 1; m <= 12; m++) {
      data.push({ month: m, count: monthCounts[m] });
    }

    console.log("API Response /admin/events-by-month:");
    console.log(JSON.stringify(data, null, 2));

    prisma.$disconnect();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testAPI();
