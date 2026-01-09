import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log('\n🧪 Testing /admin/events-by-month logic\n');
    
    // Simulate the API logic
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

    console.log(`📊 Found ${events.length} events with startDate\n`);

    // Count events by month
    const monthCounts = {};
    for (let m = 1; m <= 12; m++) {
      monthCounts[m] = 0;
    }

    events.forEach(event => {
      if (event.startDate) {
        const month = new Date(event.startDate).getMonth() + 1;
        monthCounts[month]++;
        console.log(`📅 ${event.title} → Month ${month}`);
      }
    });

    // Format response
    const data = [];
    for (let m = 1; m <= 12; m++) {
      data.push({ month: m, count: monthCounts[m] });
    }

    console.log('\n✅ API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check if response is empty
    const nonZeroMonths = data.filter(d => d.count > 0);
    console.log(`\n📊 Non-zero months: ${nonZeroMonths.length}`);
    nonZeroMonths.forEach(m => {
      console.log(`   - Tháng ${m.month}: ${m.count} hoạt động`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
