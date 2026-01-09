import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkEvents() {
  const events = await prisma.event.findMany({
    take: 5,
    select: {
      id: true,
      title: true,
      startDate: true,
      createdAt: true
    }
  });
  
  console.log("Sample Events:");
  console.log(JSON.stringify(events, null, 2));
  
  // Count by month
  console.log("\nCounting events by month...");
  const allEvents = await prisma.event.findMany({
    select: { startDate: true }
  });
  
  const counts = {};
  for (let m = 1; m <= 12; m++) counts[m] = 0;
  
  allEvents.forEach(e => {
    if (e.startDate) {
      const month = new Date(e.startDate).getMonth() + 1;
      counts[month]++;
    }
  });
  
  console.log("Events by month:", counts);
  
  prisma.$disconnect();
}

checkEvents();
