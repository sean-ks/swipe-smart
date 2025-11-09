import { generateCardPath } from './cardPath';
import { getTopCardRecommendations } from './cardRecommendations';
import { RewardType, Category } from '../../../../generated/prisma';

/**
 * Test script for card path generation
 * Run with: npx ts-node backend/src/services/recommendations/testCardPath.ts
 */
async function testCardPath() {
  console.log('=== Testing Card Path Generation ===\n');

  // Sample user data: someone with bad credit starting their journey
  const userCreditScore = 580; // Poor credit
  const creditHistoryYears = 1; // Limited history
  const rewardPreference: RewardType = 'TRAVEL';

  // Realistic spending pattern (in cents): $3,000/month total
  const lifetimeSpendingByCategory = {
    [Category.groceries]: 50000, // $600 over 1 year
    [Category.dining]: 36000, // $360
    [Category.gas]: 48000, // $480
    [Category.travel]: 24000, // $240
    [Category.general]: 132000, // $1,320 (everything else)
  };

  console.log('User Profile:');
  console.log(`- Credit Score: ${userCreditScore}`);
  console.log(`- Credit History: ${creditHistoryYears} years`);
  console.log(`- Reward Preference: ${rewardPreference}`);
  console.log(`- Monthly Spending: ~$3,000\n`);

  // Step 1: Get initial recommendations
  console.log('Step 1: Getting initial recommendations...');
  const initialRecs = await getTopCardRecommendations({
    rewardPreference,
    userCreditScore,
    creditHistoryYears,
    lifetimeSpendingByCategory,
    limit: 5,
    testMode: false, // Use production cards
  });

  if (initialRecs.length === 0) {
    console.log('No initial recommendations found!');
    return;
  }

  console.log(`Found ${initialRecs.length} recommendations:\n`);
  initialRecs.forEach((rec, idx) => {
    console.log(`${idx + 1}. ${rec.cardName} (${rec.issuer})`);
    console.log(`   - 2-Year Value: $${(rec.totalTwoYearValue / 100).toFixed(2)}`);
    console.log(`   - Min Credit Score: ${rec.minCreditScore || 'None'}`);
    console.log(`   - Reward Type: ${rec.rewardType || 'Credit Builder'}\n`);
  });

  // Step 2: Select the top card and generate path
  const selectedCard = initialRecs[0];
  console.log(`\nStep 2: Generating path starting with: ${selectedCard.cardName}\n`);

  const path = await generateCardPath({
    rewardPreference,
    userCreditScore,
    creditHistoryYears,
    lifetimeSpendingByCategory,
    selectedCardId: selectedCard.cardId,
    testMode: false, // Use production cards
  });

  // Display path results
  console.log('=== CREDIT CARD PROGRESSION PATH ===\n');
  console.log(`Total Duration: ${path.totalDurationYears} years`);
  console.log(`Credit Score Progression: ${userCreditScore} → ${path.finalCreditScore} (+${path.finalCreditScore - userCreditScore} points)\n`);

  console.log('Steps:');
  path.steps.forEach((step, idx) => {
    console.log(`\n${idx + 1}. ${step.timeframe}`);
    console.log(`   Card: ${step.card.cardName} (${step.card.issuer})`);
    console.log(`   Credit Score: ${step.creditScoreAtStep} (+${step.creditScoreImprovement} improvement)`);
    console.log(`   Credit History: ${step.creditHistoryAtStep} years`);
    console.log(`   Min Credit Required: ${step.card.minCreditScore || 'None'}`);
    console.log(`   2-Year Value: $${(step.card.totalTwoYearValue / 100).toFixed(2)}`);
    console.log(`   - Cashback: $${(step.card.twoYearCashback / 100).toFixed(2)}`);
    console.log(`   - Bonus: $${(step.card.bonusValue / 100).toFixed(2)}`);
    console.log(`   - Fees: $${(step.card.twoYearFees / 100).toFixed(2)}`);
  });

  console.log('\n=== TOTAL PATH BENEFITS ===');
  console.log(`Total Value: $${(path.totalPathValue / 100).toFixed(2)}`);
  console.log(`Total Cashback: $${(path.totalCashback / 100).toFixed(2)}`);
  console.log(`Total Bonuses: $${(path.totalBonuses / 100).toFixed(2)}`);
  console.log(`Total Fees: $${(path.totalFees / 100).toFixed(2)}`);
  console.log(`Net Benefit: $${((path.totalCashback + path.totalBonuses - path.totalFees) / 100).toFixed(2)}`);
}

// Run the test
testCardPath()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  });
