import { generateUpgradePath } from './upgradePath';
import { RewardType, Category } from '../../../../generated/prisma';

/**
 * Test the upgrade path algorithm
 * Run with: npx tsx src/services/recommendations/testUpgradePath.ts
 */
async function testUpgradePath() {
  console.log('=== Testing Upgrade Path Generation ===\n');

  // Test Case 1: Poor credit → Premium (CASHBACK)
  console.log('Test 1: Poor Credit Starter → Premium (CASHBACK)\n');

  const test1 = await generateUpgradePath({
    rewardPreference: 'CASHBACK',
    userCreditScore: 580,
    creditHistoryYears: 0.5,
    lifetimeSpendingByCategory: {
      [Category.groceries]: 100000, // $4,000/year
      [Category.dining]: 60000,
      [Category.gas]: 80000,
      [Category.travel]: 20000,
      [Category.general]: 140000,
    },
    testMode: false,
  });

  console.log(`Found ${test1.cards.length} cards in upgrade path:`);
  console.log(`Credit Score Journey: ${test1.startingCreditScore} → ${test1.endingCreditScore}\n`);

  test1.cards.forEach((card, idx) => {
    console.log(`${idx + 1}. ${card.cardName} (${card.issuer})`);
    console.log(`   Reward Type: ${card.rewardType || 'Credit Builder'}`);
    console.log(`   Min Credit: ${card.minCreditScore || 'None'}`);
    console.log(`   Annual Fee: $${(card.annualFeeCents / 100).toFixed(2)}\n`);
  });

  // Test Case 2: Good credit → Premium (TRAVEL)
  console.log('\n' + '='.repeat(60));
  console.log('\nTest 2: Good Credit → Premium (TRAVEL)\n');

  const test2 = await generateUpgradePath({
    rewardPreference: 'TRAVEL',
    userCreditScore: 680,
    creditHistoryYears: 3,
    lifetimeSpendingByCategory: {
      [Category.groceries]: 270000,
      [Category.dining]: 360000,
      [Category.gas]: 135000,
      [Category.travel]: 900000, // $6,000/year on travel
      [Category.general]: 450000,
    },
    testMode: false,
  });

  console.log(`Found ${test2.cards.length} cards in upgrade path:`);
  console.log(`Credit Score Journey: ${test2.startingCreditScore} → ${test2.endingCreditScore}\n`);

  test2.cards.forEach((card, idx) => {
    console.log(`${idx + 1}. ${card.cardName} (${card.issuer})`);
    console.log(`   Reward Type: ${card.rewardType || 'Credit Builder'}`);
    console.log(`   Min Credit: ${card.minCreditScore || 'None'}`);
    console.log(`   Annual Fee: $${(card.annualFeeCents / 100).toFixed(2)}\n`);
  });

  // Test Case 3: High spender (CASHBACK, grocery-heavy)
  console.log('\n' + '='.repeat(60));
  console.log('\nTest 3: High Spender - Grocery Heavy (CASHBACK)\n');

  const test3 = await generateUpgradePath({
    rewardPreference: 'CASHBACK',
    userCreditScore: 640,
    creditHistoryYears: 1.5,
    lifetimeSpendingByCategory: {
      [Category.groceries]: 480000, // $4,800/year on groceries
      [Category.dining]: 240000,
      [Category.gas]: 192000,
      [Category.travel]: 96000,
      [Category.general]: 384000,
    },
    testMode: false,
  });

  console.log(`Found ${test3.cards.length} cards in upgrade path:`);
  console.log(`Credit Score Journey: ${test3.startingCreditScore} → ${test3.endingCreditScore}\n`);

  test3.cards.forEach((card, idx) => {
    console.log(`${idx + 1}. ${card.cardName} (${card.issuer})`);
    console.log(`   Reward Type: ${card.rewardType || 'Credit Builder'}`);
    console.log(`   Min Credit: ${card.minCreditScore || 'None'}`);
    console.log(`   Annual Fee: $${(card.annualFeeCents / 100).toFixed(2)}\n`);
  });

  // Test Case 4: User already has a card (mid-tier)
  console.log('\n' + '='.repeat(60));
  console.log('\nTest 4: User Already Has Mid-Tier Card\n');

  // First get the full path
  const fullPath = await generateUpgradePath({
    rewardPreference: 'CASHBACK',
    userCreditScore: 640,
    creditHistoryYears: 2,
    lifetimeSpendingByCategory: {
      [Category.groceries]: 240000,
      [Category.dining]: 180000,
      [Category.gas]: 120000,
      [Category.travel]: 60000,
      [Category.general]: 200000,
    },
    testMode: false,
  });

  console.log('Full path without current cards:');
  fullPath.cards.forEach((card, idx) => {
    console.log(`  ${idx + 1}. ${card.cardName} (${card.issuer})`);
  });

  // Now simulate user already having the 2nd card
  if (fullPath.cards.length >= 2) {
    const userCurrentCardId = fullPath.cards[1].cardId;
    console.log(`\nUser already has: ${fullPath.cards[1].cardName}`);

    const filteredPath = await generateUpgradePath({
      rewardPreference: 'CASHBACK',
      userCreditScore: 640,
      creditHistoryYears: 2,
      lifetimeSpendingByCategory: {
        [Category.groceries]: 240000,
        [Category.dining]: 180000,
        [Category.gas]: 120000,
        [Category.travel]: 60000,
        [Category.general]: 200000,
      },
      currentCardIds: [userCurrentCardId],
      testMode: false,
    });

    console.log(`\nFiltered upgrade path (${filteredPath.cards.length} cards):`);
    filteredPath.cards.forEach((card, idx) => {
      console.log(`  ${idx + 1}. ${card.cardName} (${card.issuer})`);
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`Test 1 (Poor → Premium): ${test1.cards.length} cards`);
  console.log(`Test 2 (Good → Premium): ${test2.cards.length} cards`);
  console.log(`Test 3 (High Spender): ${test3.cards.length} cards`);
  console.log(`Average: ${((test1.cards.length + test2.cards.length + test3.cards.length) / 3).toFixed(1)} cards`);
  console.log(`\nTest 4: Demonstrated filtering based on current cards ✓`);
}

testUpgradePath()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  });
