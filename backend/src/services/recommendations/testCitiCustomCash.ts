/**
 * Test Citi Custom Cash calculation with custom logic
 * Run with: npx tsx src/services/recommendations/testCitiCustomCash.ts
 */

import { getTopCardRecommendations } from './cardRecommendations';
import { CardRecommendationInput } from './types';

async function testCitiCustomCash() {
  console.log('🧪 Testing Citi Custom Cash Custom Logic\n');
  console.log('='.repeat(80));

  // Test 1: High spender with general as top category
  console.log('\n📊 Test 1: High spender - Top category: general ($20k/year)');
  console.log('Expected calculation:');
  console.log('  - General: 5% on first $6k + 1% on $14k = $300 + $140 = $440/year');
  console.log('  - Gas: 1% on $10k = $100/year');
  console.log('  - Groceries: 1% on $8k = $80/year');
  console.log('  - Dining: 1% on $6k = $60/year');
  console.log('  - Online: 1% on $5k = $50/year');
  console.log('  - Total: $730/year × 2 = $1,460 over 2 years');
  console.log('-'.repeat(80));

  const test1: CardRecommendationInput = {
    rewardPreference: 'CASHBACK',
    userCreditScore: 800,
    creditHistoryYears: 10,
    lifetimeSpendingByCategory: {
      gas: 10000000,       // $100k lifetime / 10 years = $10k/year
      groceries: 8000000,  // $80k lifetime / 10 years = $8k/year
      dining: 6000000,     // $60k lifetime / 10 years = $6k/year
      online: 5000000,     // $50k lifetime / 10 years = $5k/year
      general: 20000000,   // $200k lifetime / 10 years = $20k/year (TOP!)
    },
    limit: 5,
    testMode: false,
  };

  const results1 = await getTopCardRecommendations(test1);
  const citiCustom1 = results1.find(c => c.cardName.includes('Custom Cash'));

  if (citiCustom1) {
    console.log(`\n✓ Found: ${citiCustom1.cardName}`);
    console.log(`  2-Year Cashback: $${(citiCustom1.twoYearCashback / 100).toFixed(2)}`);
    console.log(`  Expected: ~$1,460.00`);

    const expected = 1460;
    const actual = citiCustom1.twoYearCashback / 100;
    const diff = Math.abs(actual - expected);

    if (diff < 100) {
      console.log(`  ✅ PASS - Custom logic is working!`);
    } else {
      console.log(`  ❌ FAIL - Expected ~$${expected}, got $${actual}`);
    }
  } else {
    console.log('  ⚠️  Citi Custom Cash not found in results');
  }

  // Test 2: Grocery-heavy spender
  console.log('\n\n📊 Test 2: Grocery-heavy spender - Top category: groceries ($20k/year)');
  console.log('Expected calculation:');
  console.log('  - Groceries: 5% on first $6k + 1% on $14k = $300 + $140 = $440/year');
  console.log('  - Gas: 1% on $3k = $30/year');
  console.log('  - Dining: 1% on $2k = $20/year');
  console.log('  - General: 1% on $5k = $50/year');
  console.log('  - Total: $540/year × 2 = $1,080 over 2 years');
  console.log('-'.repeat(80));

  const test2: CardRecommendationInput = {
    rewardPreference: 'CASHBACK',
    userCreditScore: 800,
    creditHistoryYears: 8,
    lifetimeSpendingByCategory: {
      groceries: 16000000, // $160k lifetime / 8 years = $20k/year (TOP!)
      gas: 2400000,        // $24k lifetime / 8 years = $3k/year
      dining: 1600000,     // $16k lifetime / 8 years = $2k/year
      general: 4000000,    // $40k lifetime / 8 years = $5k/year
    },
    limit: 5,
    testMode: false,
  };

  const results2 = await getTopCardRecommendations(test2);
  const citiCustom2 = results2.find(c => c.cardName.includes('Custom Cash'));

  if (citiCustom2) {
    console.log(`\n✓ Found: ${citiCustom2.cardName}`);
    console.log(`  2-Year Cashback: $${(citiCustom2.twoYearCashback / 100).toFixed(2)}`);
    console.log(`  Expected: ~$1,080.00`);

    const expected = 1080;
    const actual = citiCustom2.twoYearCashback / 100;
    const diff = Math.abs(actual - expected);

    if (diff < 50) {
      console.log(`  ✅ PASS - Custom logic is working!`);
    } else {
      console.log(`  ❌ FAIL - Expected ~$${expected}, got $${actual}`);
    }
  } else {
    console.log('  ⚠️  Citi Custom Cash not found in results');
  }

  // Test 3: Moderate spender
  console.log('\n\n📊 Test 3: Moderate spender - Top category: general ($12k/year)');
  console.log('Expected calculation:');
  console.log('  - General: 5% on first $6k + 1% on $6k = $300 + $60 = $360/year');
  console.log('  - Gas: 1% on $5k = $50/year');
  console.log('  - Groceries: 1% on $6k = $60/year');
  console.log('  - Dining: 1% on $3k = $30/year');
  console.log('  - Online: 1% on $4k = $40/year');
  console.log('  - Total: $540/year × 2 = $1,080 over 2 years');
  console.log('-'.repeat(80));

  const test3: CardRecommendationInput = {
    rewardPreference: 'CASHBACK',
    userCreditScore: 720,
    creditHistoryYears: 5,
    lifetimeSpendingByCategory: {
      gas: 2500000,        // $25k lifetime / 5 years = $5k/year
      groceries: 3000000,  // $30k lifetime / 5 years = $6k/year
      dining: 1500000,     // $15k lifetime / 5 years = $3k/year
      online: 2000000,     // $20k lifetime / 5 years = $4k/year
      general: 6000000,    // $60k lifetime / 5 years = $12k/year (TOP!)
    },
    limit: 5,
    testMode: false,
  };

  const results3 = await getTopCardRecommendations(test3);
  const citiCustom3 = results3.find(c => c.cardName.includes('Custom Cash'));

  if (citiCustom3) {
    console.log(`\n✓ Found: ${citiCustom3.cardName}`);
    console.log(`  2-Year Cashback: $${(citiCustom3.twoYearCashback / 100).toFixed(2)}`);
    console.log(`  Expected: ~$1,080.00`);

    const expected = 1080;
    const actual = citiCustom3.twoYearCashback / 100;
    const diff = Math.abs(actual - expected);

    if (diff < 50) {
      console.log(`  ✅ PASS - Custom logic is working!`);
    } else {
      console.log(`  ❌ FAIL - Expected ~$${expected}, got $${actual}`);
    }
  } else {
    console.log('  ⚠️  Citi Custom Cash not found in results');
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Citi Custom Cash test complete!\n');
}

testCitiCustomCash().catch(console.error);
