/**
 * Find all cards with rotating categories or special earn structures
 */
import { prisma } from '../../utils/prisma';

async function findRotatingCards() {
  console.log('🔍 Finding cards with rotating categories or complex earn structures...\n');

  // Check CardRotatingSchedule table
  const cardsWithRotating = await prisma.cardsCatalog.findMany({
    where: {
      rotating: {
        some: {},
      },
    },
    select: {
      id: true,
      name: true,
      issuer: true,
      rotating: true,
    },
  });

  console.log('📋 Cards with rotating schedules:');
  if (cardsWithRotating.length === 0) {
    console.log('   None found in CardRotatingSchedule table');
  } else {
    cardsWithRotating.forEach(card => {
      console.log(`\n   - ${card.name} (${card.issuer})`);
      console.log(`     ID: ${card.id}`);
      console.log(`     Rotating schedules: ${card.rotating.length}`);
    });
  }

  // Check for cards with isRotating flag in earnRates
  const cardsWithRotatingRates = await prisma.cardsCatalog.findMany({
    where: {
      earnRates: {
        some: {
          isRotating: true,
        },
      },
    },
    include: {
      earnRates: {
        where: {
          isRotating: true,
        },
      },
    },
  });

  console.log('\n\n📋 Cards with isRotating=true in earnRates:');
  if (cardsWithRotatingRates.length === 0) {
    console.log('   None found');
  } else {
    cardsWithRotatingRates.forEach(card => {
      console.log(`\n   - ${card.name} (${card.issuer})`);
      console.log(`     ID: ${card.id}`);
      card.earnRates.forEach(rate => {
        console.log(`     • ${rate.category}: ${rate.ratePct} (rotating)`);
      });
    });
  }

  // Known rotating cards to check manually
  const knownRotatingNames = [
    'Discover it',
    'Freedom Flex',
    'Freedom',
    'Custom Cash',
    'Ink Business Cash',
  ];

  console.log('\n\n📋 Checking for known rotating category cards by name:');
  for (const cardName of knownRotatingNames) {
    const cards = await prisma.cardsCatalog.findMany({
      where: {
        name: {
          contains: cardName,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        issuer: true,
      },
    });

    if (cards.length > 0) {
      cards.forEach(card => {
        console.log(`   ✓ Found: ${card.name} (${card.issuer}) - ID: ${card.id}`);
      });
    }
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('💡 SUMMARY: Cards to manually remove or mark as inactive:\n');

  const allRotatingCards = new Set([
    ...cardsWithRotating.map(c => `${c.name} (${c.issuer})`),
    ...cardsWithRotatingRates.map(c => `${c.name} (${c.issuer})`),
  ]);

  if (allRotatingCards.size === 0) {
    console.log('No cards found with rotating category flags.');
    console.log('However, check for these common rotating cards and mark as active=false:');
    console.log('   - Discover it Cash Back');
    console.log('   - Chase Freedom Flex');
    console.log('   - Chase Freedom');
    console.log('   - Citi Custom Cash (auto-selects top category each month)');
    console.log('   - Chase Ink Business Cash');
  } else {
    allRotatingCards.forEach(card => {
      console.log(`   • ${card}`);
    });
  }

  await prisma.$disconnect();
}

findRotatingCards();
