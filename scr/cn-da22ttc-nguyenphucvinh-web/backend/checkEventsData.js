import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    // Check events
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true
      }
    });
    
    console.log('\n📊 ====== DATABASE CHECK ======');
    console.log('📊 Total events:', events.length);
    
    if (events.length === 0) {
      console.log('⚠️  NO EVENTS FOUND IN DATABASE!');
    } else {
      console.log('\n📋 Events list:');
      events.forEach((e, i) => {
        console.log(`  ${i + 1}. ${e.title}`);
        console.log(`     startDate: ${e.startDate}`);
        console.log(`     endDate: ${e.endDate}`);
      });
    }
    
    // Check stats
    const volunteerCount = await prisma.volunteer.count();
    const orgCount = await prisma.organization.count();
    
    console.log('\n📊 Summary:');
    console.log(`  - Volunteers: ${volunteerCount}`);
    console.log(`  - Organizations: ${orgCount}`);
    console.log(`  - Events: ${events.length}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
