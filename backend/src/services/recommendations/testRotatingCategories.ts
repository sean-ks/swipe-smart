/**
 * Test rotating category calculation
 * Run with: npx tsx src/services/recommendations/testRotatingCategories.ts
 */

import { getTopCardRecommendations } from './cardRecommendations';
import { CardRecommendationInput } from './types';

async function testRotatingCategories() {
  console.log('🧪 Testing Rotating Category Calculation\n');
  console.log('='.repeat(80));

  // Test 1: User with balanced spending across rotating categories
  console.log('\n📊 Test 1: Discover it - User spends in all 4 rotating categories');
  console.log('Scenario: $3k/year gas, $4k/year groceries, $2k/year dining, $5k/year drugstore');
  console.log('Expected: Each category gets bonus 1 quarter out of 4 (assuming 4 different quarters)');
  console.log('Average bonus spending: ($3k+$4k+$2k+$5k) / 4 * 1 quarter each = $3.5k/quarter avg');
  console.log('With $1,500/quarter cap: max $1,500 * 4 quarters = $6k/year at 5%');
  console.log('Expected earnings: ~$300/year × 2 = $600 over 2 years');
  console.log('-'.repeat(80));

  const test1: CardRecommendationInput = {
    rewardPreference: 'CASHBACK',
    userCreditScore: 720,
    creditHistoryYears: 5,
    lifetimeSpendingByCategory: {
      gas: 1500000,       // $15k lifetime / 5 years = $3k/year
      groceries: 2000000, // $20k lifetime / 5 years = $4k/year
      dining: 1000000,    // $10k lifetime / 5 years = $2k/year
      drugstore: 2500000, // $25k lifetime / 5 years = $5k/year
      general: 2500000,   // $25k lifetime / 5 years = $5k/year (base rate)
    },
    limit: 5,
    testMode: false,
  };

  const results1 = await getTopCardRecommendations(test1);
  const discover = results1.find(c => c.cardName.includes('Discover it'));

  if (discover) {
    console.log(`\n✓ Found: ${discover.cardName}`);
    console.log(`  2-Year Cashback: $${(discover.twoYearCashback / 100).toFixed(2)}`);
    console.log(`  Total Value: $${(discover.totalTwoYearValue / 100).toFixed(2)}`);
    console.log(`  Bonus: $${(discover.bonusValue / 100).toFixed(2)}`);

    // Check if rotating calculation is being used
    if (discover.twoYearCashback > 0) {
      console.log(`  ✅ Card found and calculated`);
    } else {
      console.log(`  ⚠️  Zero cashback calculated`);
    }
  } else {
    console.log('  ⚠️  Discover it not found in results');
  }

  // Test 2: Chase Freedom Flex
  console.log('\n\n📊 Test 2: Chase Freedom Flex - Similar rotating structure');
  console.log('-'.repeat(80));

  const test2: CardRecommendationInput = {
    rewardPreference: 'CASHBACK',
    userCreditScore: 720,
    creditHistoryYears: 5,
    lifetimeSpendingByCategory: {
      gas: 1500000,
      groceries: 2000000,
      dining: 1000000,
      travel: 1500000,
      general: 2000000,
    },
    limit: 5,
    testMode: false,
  };

  const results2 = await getTopCardRecommendations(test2);
  const freedomFlex = results2.find(c => c.cardName.includes('Freedom Flex'));

  if (freedomFlex) {
    console.log(`\n✓ Found: ${freedomFlex.cardName}`);
    console.log(`  2-Year Cashback: $${(freedomFlex.twoYearCashback / 100).toFixed(2)}`);
    console.log(`  Total Value: $${(freedomFlex.totalTwoYearValue / 100).toFixed(2)}`);
    console.log(`  Bonus: $${(freedomFlex.bonusValue / 100).toFixed(2)}`);

    if (freedomFlex.twoYearCashback > 0) {
      console.log(`  ✅ Card found and calculated`);
    } else {
      console.log(`  ⚠️  Zero cashback calculated`);
    }
  } else {
    console.log('  ⚠️  Freedom Flex not found in results');
  }

  // Test 3: Check which cards have rotating schedules in database
  console.log('\n\n📊 Checking which cards have rotating schedules in database...');
  console.log('-'.repeat(80));

  const { prisma } = await import('../../utils/prisma');

  const cardsWithRotating = await prisma.cardsCatalog.findMany({
    where: {
      rotating: {
        some: {},
      },
    },
    include: {
      rotating: true,
      earnRates: {
        where: {
          isRotating: true,
        },
      },
    },
  });

  console.log(`\n✓ Found ${cardsWithRotating.length} cards with rotating schedules:\n`);

  cardsWithRotating.forEach(card => {
    console.log(`   • ${card.name} (${card.issuer})`);
    console.log(`     Rotating schedules: ${card.rotating.length} quarters`);
    card.rotating.forEach(schedule => {
      console.log(`       Q${schedule.quarter || '?'}: ${schedule.categories.join(', ')}`);
    });
    console.log(`     Rotating earn rates: ${card.earnRates.length}`);
    card.earnRates.forEach(rate => {
      console.log(`       ${rate.category}: ${rate.ratePct}% (cap: $${rate.capAmountCents ? rate.capAmountCents / 100 : 'none'})`);
    });
    console.log('');
  });

  await prisma.$disconnect();

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Rotating category test complete!\n');
}

testRotatingCategories().catch(console.error);
