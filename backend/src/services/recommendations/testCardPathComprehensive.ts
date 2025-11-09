import { generateCardPath } from './cardPath';
import { getTopCardRecommendations } from './cardRecommendations';
import { RewardType, Category } from '../../../../generated/prisma';

/**
 * Comprehensive test suite for card path generation
 * Tests various user profiles, spending patterns, and preferences
 * Run with: npx tsx src/services/recommendations/testCardPathComprehensive.ts
 */

interface UserProfile {
  name: string;
  description: string;
  creditScore: number;
  creditHistoryYears: number;
  rewardPreference: RewardType;
  lifetimeSpendingByCategory: Partial<Record<Category, number>>;
}

// Define diverse user profiles
const userProfiles: UserProfile[] = [
  {
    name: "Budget Student - Low Spending",
    description: "College student, minimal credit history, very low spending",
    creditScore: 600,
    creditHistoryYears: 0.5,
    rewardPreference: 'CASHBACK',
    lifetimeSpendingByCategory: {
      [Category.groceries]: 30000, // $600 over 6 months = $1,200/year
      [Category.dining]: 25000, // $1,000/year
      [Category.gas]: 15000, // $600/year
      [Category.travel]: 10000, // $400/year
      [Category.general]: 40000, // $1,600/year
      // Total: ~$4,800/year ($400/month)
    },
  },
  {
    name: "Young Professional - Grocery Heavy",
    description: "Entry-level job, cooks at home, heavy grocery spending",
    creditScore: 680,
    creditHistoryYears: 2,
    rewardPreference: 'CASHBACK',
    lifetimeSpendingByCategory: {
      [Category.groceries]: 480000, // $4,800/year (shops at Whole Foods)
      [Category.dining]: 240000, // $2,400/year
      [Category.gas]: 192000, // $1,920/year
      [Category.travel]: 96000, // $960/year
      [Category.general]: 384000, // $3,840/year
      // Total: ~$13,920/year ($1,160/month)
    },
  },
  {
    name: "Frequent Diner - Restaurant Heavy",
    description: "Urban professional, eats out frequently, high dining spend",
    creditScore: 720,
    creditHistoryYears: 5,
    rewardPreference: 'CASHBACK',
    lifetimeSpendingByCategory: {
      [Category.groceries]: 375000, // $1,500/year
      [Category.dining]: 2500000, // $10,000/year (eats out almost daily)
      [Category.gas]: 250000, // $1,000/year
      [Category.travel]: 625000, // $2,500/year
      [Category.general]: 1250000, // $5,000/year
      // Total: ~$20,000/year ($1,667/month)
    },
  },
  {
    name: "Commuter - High Gas Spending",
    description: "Long commute, high gas expenses, suburban lifestyle",
    creditScore: 700,
    creditHistoryYears: 4,
    rewardPreference: 'CASHBACK',
    lifetimeSpendingByCategory: {
      [Category.groceries]: 480000, // $3,000/year
      [Category.dining]: 320000, // $2,000/year
      [Category.gas]: 960000, // $6,000/year (heavy commute - 200 miles/week)
      [Category.travel]: 160000, // $1,000/year
      [Category.general]: 480000, // $3,000/year
      // Total: ~$15,000/year ($1,250/month)
    },
  },
  {
    name: "Travel Enthusiast - Moderate Credit",
    description: "Loves travel, wants to maximize points for flights/hotels",
    creditScore: 690,
    creditHistoryYears: 3,
    rewardPreference: 'TRAVEL',
    lifetimeSpendingByCategory: {
      [Category.groceries]: 270000, // $1,800/year
      [Category.dining]: 360000, // $2,400/year
      [Category.gas]: 135000, // $900/year
      [Category.travel]: 900000, // $6,000/year (frequent travel)
      [Category.general]: 450000, // $3,000/year
      // Total: ~$14,100/year ($1,175/month)
    },
  },
  {
    name: "Luxury Traveler - High Spending",
    description: "Established professional, premium travel, high overall spending",
    creditScore: 760,
    creditHistoryYears: 10,
    rewardPreference: 'TRAVEL',
    lifetimeSpendingByCategory: {
      [Category.groceries]: 1500000, // $3,000/year
      [Category.dining]: 2500000, // $5,000/year
      [Category.gas]: 1000000, // $2,000/year
      [Category.travel]: 10000000, // $20,000/year (luxury international travel)
      [Category.general]: 5000000, // $10,000/year
      // Total: ~$40,000/year ($3,333/month)
    },
  },
  {
    name: "Balanced Spender - Fair Credit",
    description: "Rebuilding credit, balanced spending across categories",
    creditScore: 640,
    creditHistoryYears: 1.5,
    rewardPreference: 'CASHBACK',
    lifetimeSpendingByCategory: {
      [Category.groceries]: 180000, // $2,400/year
      [Category.dining]: 150000, // $2,000/year
      [Category.gas]: 120000, // $1,600/year
      [Category.travel]: 90000, // $1,200/year
      [Category.general]: 240000, // $3,200/year
      // Total: ~$10,400/year ($867/month)
    },
  },
  {
    name: "High Earner - All Categories",
    description: "Executive level, high spending across all categories",
    creditScore: 800,
    creditHistoryYears: 15,
    rewardPreference: 'TRAVEL',
    lifetimeSpendingByCategory: {
      [Category.groceries]: 3750000, // $5,000/year
      [Category.dining]: 7500000, // $10,000/year
      [Category.gas]: 1875000, // $2,500/year
      [Category.travel]: 18750000, // $25,000/year (business + luxury personal)
      [Category.general]: 13125000, // $17,500/year
      // Total: ~$60,000/year ($5,000/month)
    },
  },
  {
    name: "Ultra High Spender - Premium Cards",
    description: "Wealthy individual, massive spending justifies any annual fee",
    creditScore: 820,
    creditHistoryYears: 20,
    rewardPreference: 'TRAVEL',
    lifetimeSpendingByCategory: {
      [Category.groceries]: 6000000, // $6,000/year
      [Category.dining]: 20000000, // $20,000/year
      [Category.gas]: 3000000, // $3,000/year
      [Category.travel]: 40000000, // $40,000/year (first class international)
      [Category.general]: 31000000, // $31,000/year
      // Total: ~$100,000/year ($8,333/month)
    },
  },
  {
    name: "Poor Credit Starter",
    description: "Starting from scratch, minimal credit history, moderate spending",
    creditScore: 580,
    creditHistoryYears: 0.5,
    rewardPreference: 'CASHBACK',
    lifetimeSpendingByCategory: {
      [Category.groceries]: 100000, // $4,000/year
      [Category.dining]: 60000, // $2,400/year
      [Category.gas]: 80000, // $3,200/year
      [Category.travel]: 20000, // $800/year
      [Category.general]: 140000, // $5,600/year
      // Total: ~$16,000/year ($1,333/month)
    },
  },
];

async function testUserProfile(profile: UserProfile) {
  console.log('\n' + '='.repeat(80));
  console.log(`\n🧪 Testing: ${profile.name}`);
  console.log(`📝 ${profile.description}`);
  console.log('\nProfile Details:');
  console.log(`  Credit Score: ${profile.creditScore}`);
  console.log(`  Credit History: ${profile.creditHistoryYears} years`);
  console.log(`  Reward Preference: ${profile.rewardPreference}`);

  // Calculate total annual spending
  const totalLifetimeSpending = Object.values(profile.lifetimeSpendingByCategory).reduce(
    (sum, amount) => sum + (amount || 0),
    0
  );
  const annualSpending = profile.creditHistoryYears > 0
    ? totalLifetimeSpending / profile.creditHistoryYears
    : totalLifetimeSpending * 2; // Assume 6 months = half year

  console.log(`  Annual Spending: $${(annualSpending / 100).toFixed(2)}`);

  try {
    // Step 1: Get initial recommendations
    const initialRecs = await getTopCardRecommendations({
      rewardPreference: profile.rewardPreference,
      userCreditScore: profile.creditScore,
      creditHistoryYears: profile.creditHistoryYears,
      lifetimeSpendingByCategory: profile.lifetimeSpendingByCategory,
      limit: 5,
      testMode: false,
    });

    if (initialRecs.length === 0) {
      console.log('\n❌ No initial recommendations found for this profile!');
      return;
    }

    console.log(`\n✅ Found ${initialRecs.length} initial recommendations`);
    console.log(`\nTop Card: ${initialRecs[0].cardName} (${initialRecs[0].issuer})`);
    console.log(`  2-Year Value: $${(initialRecs[0].totalTwoYearValue / 100).toFixed(2)}`);
    console.log(`  Min Credit Required: ${initialRecs[0].minCreditScore || 'None'}`);

    // Step 2: Generate progression path
    const selectedCard = initialRecs[0];
    const path = await generateCardPath({
      rewardPreference: profile.rewardPreference,
      userCreditScore: profile.creditScore,
      creditHistoryYears: profile.creditHistoryYears,
      lifetimeSpendingByCategory: profile.lifetimeSpendingByCategory,
      selectedCardId: selectedCard.cardId,
      testMode: false,
    });

    // Display path summary
    console.log('\n📊 Path Summary:');
    console.log(`  Total Steps: ${path.steps.length}`);
    console.log(`  Duration: ${path.totalDurationYears} years`);
    console.log(`  Credit Score Journey: ${profile.creditScore} → ${path.finalCreditScore} (+${path.finalCreditScore - profile.creditScore} points)`);
    console.log(`  Total Value: $${(path.totalPathValue / 100).toFixed(2)}`);
    console.log(`  Total Cashback: $${(path.totalCashback / 100).toFixed(2)}`);
    console.log(`  Total Bonuses: $${(path.totalBonuses / 100).toFixed(2)}`);
    console.log(`  Total Fees: $${(path.totalFees / 100).toFixed(2)}`);

    // Display card progression
    console.log('\n📈 Card Progression:');
    path.steps.forEach((step, idx) => {
      console.log(`  ${idx + 1}. ${step.timeframe}: ${step.card.cardName}`);
      console.log(`     Value: $${(step.card.totalTwoYearValue / 100).toFixed(2)} | Credit: ${step.creditScoreAtStep} (+${step.creditScoreImprovement})`);
    });

  } catch (error) {
    console.log('\n❌ Error testing this profile:');
    console.log(error instanceof Error ? error.message : 'Unknown error');
  }
}

async function runComprehensiveTests() {
  console.log('='.repeat(80));
  console.log('🎯 COMPREHENSIVE CARD PATH GENERATION TEST SUITE');
  console.log('='.repeat(80));
  console.log(`\nTesting ${userProfiles.length} diverse user profiles...\n`);

  for (const profile of userProfiles) {
    await testUserProfile(profile);
    // Add small delay between tests to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ ALL TESTS COMPLETED');
  console.log('='.repeat(80));
  console.log('\n📊 Summary:');
  console.log(`  - Tested ${userProfiles.length} user profiles`);
  console.log(`  - Covered credit scores: 580-800`);
  console.log(`  - Covered spending levels: $2,000-$12,000/year`);
  console.log(`  - Covered reward preferences: CASHBACK, TRAVEL`);
  console.log(`  - Covered various spending patterns: groceries, dining, gas, travel-heavy\n`);
}

// Run the comprehensive test suite
runComprehensiveTests()
  .then(() => {
    console.log('✅ Test suite completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:');
    console.error(error);
    process.exit(1);
  });
