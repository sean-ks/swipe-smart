/**
 * Test cap enforcement logic
 * Run with: npx tsx src/services/recommendations/testCapEnforcement.ts
 */

import { getTopCardRecommendations } from './cardRecommendations';
import { CardRecommendationInput } from './types';

async function testCapEnforcement() {
  console.log('🧪 Testing Cap Enforcement\n');
  console.log('='.repeat(80));

  // Test 1: Blue Cash Everyday - $8k/year groceries (should cap at $6k)
  console.log('\n📊 Test 1: Blue Cash Everyday with $8k/year groceries');
  console.log('Expected: 3% on first $6k = $180, then 1% on $2k = $20, Total = $200/year × 2 = $400');
  console.log('-'.repeat(80));

  const test1: CardRecommendationInput = {
    rewardPreference: 'CASHBACK',
    userCreditScore: 720,
    creditHistoryYears: 5,
    lifetimeSpendingByCategory: {
      groceries: 4000000, // $40k lifetime ÷ 5 years = $8k/year
    },
    limit: 5,
    testMode: false,
  };

  const results1 = await getTopCardRecommendations(test1);
  const blueCash = results1.find(c => c.cardName.includes('Blue Cash Everyday'));

  if (blueCash) {
    console.log(`\n✓ Found: ${blueCash.cardName}`);
    console.log(`  2-Year Cashback: $${(blueCash.twoYearCashback / 100).toFixed(2)}`);
    console.log(`  Expected: ~$400.00 (with cap enforcement)`);

    const expected = 400;
    const actual = blueCash.twoYearCashback / 100;
    const diff = Math.abs(actual - expected);

    if (diff < 50) {
      console.log(`  ✅ PASS - Cap appears to be enforced`);
    } else {
      console.log(`  ❌ FAIL - Expected ~$${expected}, got $${actual}`);
    }
  } else {
    console.log('  ⚠️  Blue Cash Everyday not found in results');
  }

  // Test 2: Very high grocery spending - $20k/year (well over cap)
  console.log('\n\n📊 Test 2: Blue Cash Everyday with $20k/year groceries');
  console.log('Expected: 3% on first $6k = $180, then 1% on $14k = $140, Total = $320/year × 2 = $640');
  console.log('-'.repeat(80));

  const test2: CardRecommendationInput = {
    rewardPreference: 'CASHBACK',
    userCreditScore: 720,
    creditHistoryYears: 5,
    lifetimeSpendingByCategory: {
      groceries: 10000000, // $100k lifetime ÷ 5 years = $20k/year
    },
    limit: 5,
    testMode: false,
  };

  const results2 = await getTopCardRecommendations(test2);
  const blueCash2 = results2.find(c => c.cardName.includes('Blue Cash Everyday'));

  if (blueCash2) {
    console.log(`\n✓ Found: ${blueCash2.cardName}`);
    console.log(`  2-Year Cashback: $${(blueCash2.twoYearCashback / 100).toFixed(2)}`);
    console.log(`  Expected: ~$640.00 (with cap enforcement)`);

    const expected = 640;
    const actual = blueCash2.twoYearCashback / 100;
    const diff = Math.abs(actual - expected);

    if (diff < 50) {
      console.log(`  ✅ PASS - Cap appears to be enforced correctly`);
    } else {
      console.log(`  ❌ FAIL - Expected ~$${expected}, got $${actual}`);
    }
  } else {
    console.log('  ⚠️  Blue Cash Everyday not found in results');
  }

  // Test 3: Citi Custom Cash - $10k/year groceries (should cap at $6k = $500/month × 12)
  console.log('\n\n📊 Test 3: Citi Custom Cash with $10k/year groceries');
  console.log('Expected: 5% on first $6k = $300, then 1% on $4k = $40, Total = $340/year × 2 = $680');
  console.log('-'.repeat(80));

  const test3: CardRecommendationInput = {
    rewardPreference: 'CASHBACK',
    userCreditScore: 720,
    creditHistoryYears: 5,
    lifetimeSpendingByCategory: {
      groceries: 5000000, // $50k lifetime ÷ 5 years = $10k/year
    },
    limit: 5,
    testMode: false,
  };

  const results3 = await getTopCardRecommendations(test3);
  const citiCustom = results3.find(c => c.cardName.includes('Custom Cash'));

  if (citiCustom) {
    console.log(`\n✓ Found: ${citiCustom.cardName}`);
    console.log(`  2-Year Cashback: $${(citiCustom.twoYearCashback / 100).toFixed(2)}`);
    console.log(`  Expected: ~$680.00 (with cap enforcement)`);

    const expected = 680;
    const actual = citiCustom.twoYearCashback / 100;
    const diff = Math.abs(actual - expected);

    if (diff < 100) {
      console.log(`  ✅ PASS - Cap appears to be enforced`);
    } else {
      console.log(`  ❌ FAIL - Expected ~$${expected}, got $${actual}`);
    }
  } else {
    console.log('  ⚠️  Citi Custom Cash not found in results');
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Cap enforcement test complete!\n');
}

testCapEnforcement().catch(console.error);
