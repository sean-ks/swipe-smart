/**
 * Comprehensive test suite for card recommendation algorithm
 * Tests against FULL production database (all cards, not just test cards)
 * Run with: npx tsx src/services/recommendations/testProductionDatabase.ts
 */

import { getTopCardRecommendations } from './cardRecommendations';
import { CardRecommendationInput } from './types';

async function runProductionTests() {
  console.log('🚀 PRODUCTION DATABASE TEST SUITE');
  console.log('Testing against ALL cards in database\n');
  console.log('='.repeat(80));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Helper function to run a test scenario
  async function runTest(
    testName: string,
    input: CardRecommendationInput,
    expectations: {
      minResults?: number;
      maxResults?: number;
      shouldIncludeRewardType?: ('CASHBACK' | 'TRAVEL' | 'MISCELLANEOUS' | null)[];
      shouldExcludeRewardType?: ('CASHBACK' | 'TRAVEL' | 'MISCELLANEOUS' | null)[];
      topCardShouldBe?: string; // Card name
      allCardsShouldMeetCreditScore?: boolean;
      allCardsShouldMeetCreditHistory?: boolean;
      shouldHavePositiveValue?: boolean;
      maxAnnualFee?: number;
    } = {}
  ) {
    totalTests++;
    console.log(`\n📊 Test ${totalTests}: ${testName}`);
    console.log('-'.repeat(80));

    try {
      const results = await getTopCardRecommendations(input);

      console.log(`✅ Found ${results.length} recommendations`);

      // Display top 3 results
      results.slice(0, 3).forEach((card, index) => {
        console.log(`\n${index + 1}. ${card.cardName} (${card.issuer})`);
        console.log(`   Type: ${card.rewardType || 'Credit Building'}`);
        console.log(`   Total 2-Year Value: $${(card.totalTwoYearValue / 100).toFixed(2)}`);
        console.log(`   Cashback/Points: $${(card.twoYearCashback / 100).toFixed(2)}`);
        console.log(`   Bonus: $${(card.bonusValue / 100).toFixed(2)}`);
        console.log(`   Fees: -$${(card.twoYearFees / 100).toFixed(2)}`);
        console.log(`   Min Score: ${card.minCreditScore || 'None'}`);
        console.log(`   Annual Fee: $${(card.annualFeeCents / 100).toFixed(2)}`);
      });

      // Run validations
      let testPassed = true;
      const failures: string[] = [];

      // Check minimum results
      if (expectations.minResults !== undefined && results.length < expectations.minResults) {
        failures.push(`Expected at least ${expectations.minResults} results, got ${results.length}`);
        testPassed = false;
      }

      // Check maximum results
      if (expectations.maxResults !== undefined && results.length > expectations.maxResults) {
        failures.push(`Expected at most ${expectations.maxResults} results, got ${results.length}`);
        testPassed = false;
      }

      // Check reward types included
      if (expectations.shouldIncludeRewardType) {
        const rewardTypes = new Set(results.map(r => r.rewardType));
        expectations.shouldIncludeRewardType.forEach(expectedType => {
          if (!rewardTypes.has(expectedType)) {
            failures.push(`Expected to include ${expectedType} cards, but none found`);
            testPassed = false;
          }
        });
      }

      // Check reward types excluded
      if (expectations.shouldExcludeRewardType) {
        const rewardTypes = new Set(results.map(r => r.rewardType));
        expectations.shouldExcludeRewardType.forEach(excludedType => {
          if (rewardTypes.has(excludedType)) {
            failures.push(`Should NOT include ${excludedType} cards, but found some`);
            testPassed = false;
          }
        });
      }

      // Check top card
      if (expectations.topCardShouldBe && results.length > 0) {
        if (!results[0].cardName.includes(expectations.topCardShouldBe)) {
          failures.push(`Expected top card to be "${expectations.topCardShouldBe}", got "${results[0].cardName}"`);
          testPassed = false;
        }
      }

      // Check credit score eligibility
      if (expectations.allCardsShouldMeetCreditScore) {
        const ineligibleCards = results.filter(
          r => r.minCreditScore !== null && r.minCreditScore > input.userCreditScore
        );
        if (ineligibleCards.length > 0) {
          failures.push(`Found ${ineligibleCards.length} cards user doesn't qualify for (credit score)`);
          testPassed = false;
        }
      }

      // Check positive value
      if (expectations.shouldHavePositiveValue) {
        const negativeCards = results.filter(r => r.totalTwoYearValue < 0);
        if (negativeCards.length > 0) {
          failures.push(`Found ${negativeCards.length} cards with negative value`);
          testPassed = false;
        }
      }

      // Check annual fee cap
      if (expectations.maxAnnualFee !== undefined) {
        const expensiveCards = results.filter(r => r.annualFeeCents > expectations.maxAnnualFee);
        if (expensiveCards.length > 0) {
          failures.push(`Found ${expensiveCards.length} cards exceeding max annual fee`);
          testPassed = false;
        }
      }

      // Print results
      if (testPassed) {
        console.log('\n✅ PASSED');
        passedTests++;
      } else {
        console.log('\n❌ FAILED');
        failures.forEach(f => console.log(`   - ${f}`));
        failedTests++;
      }

    } catch (error) {
      console.error(`\n❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      failedTests++;
    }
  }

  // =================================================================
  // TEST SUITE
  // =================================================================

  // Test 1: Excellent Credit, High Spending - CASHBACK
  await runTest(
    'Excellent Credit (800), High Spender - CASHBACK',
    {
      rewardPreference: 'CASHBACK',
      userCreditScore: 800,
      creditHistoryYears: 10,
      lifetimeSpendingByCategory: {
        gas: 10000000,       // $100k lifetime = $10k/year
        groceries: 8000000,  // $80k lifetime = $8k/year
        dining: 6000000,     // $60k lifetime = $6k/year
        online: 5000000,     // $50k lifetime = $5k/year
        general: 20000000,   // $200k lifetime = $20k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      shouldIncludeRewardType: ['CASHBACK'],
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 2: Excellent Credit, High Spending - TRAVEL
  await runTest(
    'Excellent Credit (800), High Spender - TRAVEL',
    {
      rewardPreference: 'TRAVEL',
      userCreditScore: 800,
      creditHistoryYears: 10,
      lifetimeSpendingByCategory: {
        travel: 15000000,    // $150k lifetime = $15k/year
        dining: 10000000,    // $100k lifetime = $10k/year
        gas: 5000000,        // $50k lifetime = $5k/year
        groceries: 8000000,  // $80k lifetime = $8k/year
        general: 12000000,   // $120k lifetime = $12k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      shouldIncludeRewardType: ['TRAVEL'],
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 3: Good Credit, Moderate Spending - CASHBACK
  await runTest(
    'Good Credit (720), Moderate Spender - CASHBACK',
    {
      rewardPreference: 'CASHBACK',
      userCreditScore: 720,
      creditHistoryYears: 5,
      lifetimeSpendingByCategory: {
        gas: 2500000,        // $25k lifetime = $5k/year
        groceries: 3000000,  // $30k lifetime = $6k/year
        dining: 1500000,     // $15k lifetime = $3k/year
        online: 2000000,     // $20k lifetime = $4k/year
        general: 6000000,    // $60k lifetime = $12k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 4: Good Credit, Moderate Spending - TRAVEL
  await runTest(
    'Good Credit (720), Moderate Spender - TRAVEL',
    {
      rewardPreference: 'TRAVEL',
      userCreditScore: 720,
      creditHistoryYears: 5,
      lifetimeSpendingByCategory: {
        travel: 3000000,     // $30k lifetime = $6k/year
        dining: 2500000,     // $25k lifetime = $5k/year
        gas: 1500000,        // $15k lifetime = $3k/year
        groceries: 3000000,  // $30k lifetime = $6k/year
        general: 5000000,    // $50k lifetime = $10k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 5: Fair Credit, Low Spending - CASHBACK
  await runTest(
    'Fair Credit (670), Low Spender - CASHBACK',
    {
      rewardPreference: 'CASHBACK',
      userCreditScore: 670,
      creditHistoryYears: 2,
      lifetimeSpendingByCategory: {
        gas: 240000,         // $2.4k lifetime = $1.2k/year
        groceries: 360000,   // $3.6k lifetime = $1.8k/year
        dining: 120000,      // $1.2k lifetime = $600/year
        general: 480000,     // $4.8k lifetime = $2.4k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 6: Poor Credit, Very Low Spending - CASHBACK
  await runTest(
    'Poor Credit (620), Very Low Spender - CASHBACK',
    {
      rewardPreference: 'CASHBACK',
      userCreditScore: 620,
      creditHistoryYears: 1,
      lifetimeSpendingByCategory: {
        gas: 120000,         // $1.2k lifetime = $1.2k/year
        groceries: 180000,   // $1.8k lifetime = $1.8k/year
        general: 300000,     // $3k lifetime = $3k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      shouldIncludeRewardType: [null], // Should include credit-building cards
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 7: Poor Credit, Very Low Spending - TRAVEL
  await runTest(
    'Poor Credit (620), Very Low Spender - TRAVEL',
    {
      rewardPreference: 'TRAVEL',
      userCreditScore: 620,
      creditHistoryYears: 1,
      lifetimeSpendingByCategory: {
        travel: 60000,       // $600 lifetime = $600/year
        dining: 120000,      // $1.2k lifetime = $1.2k/year
        general: 240000,     // $2.4k lifetime = $2.4k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 8: Excellent Credit, Grocery-Heavy Spending - CASHBACK
  await runTest(
    'Excellent Credit (800), Grocery-Heavy Spender - CASHBACK',
    {
      rewardPreference: 'CASHBACK',
      userCreditScore: 800,
      creditHistoryYears: 8,
      lifetimeSpendingByCategory: {
        groceries: 16000000, // $160k lifetime = $20k/year (primary category)
        gas: 2400000,        // $24k lifetime = $3k/year
        dining: 1600000,     // $16k lifetime = $2k/year
        general: 4000000,    // $40k lifetime = $5k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 9: Excellent Credit, Gas-Heavy Spending - CASHBACK
  await runTest(
    'Excellent Credit (800), Gas-Heavy Spender - CASHBACK',
    {
      rewardPreference: 'CASHBACK',
      userCreditScore: 800,
      creditHistoryYears: 8,
      lifetimeSpendingByCategory: {
        gas: 12000000,       // $120k lifetime = $15k/year (primary category)
        groceries: 3200000,  // $32k lifetime = $4k/year
        dining: 1600000,     // $16k lifetime = $2k/year
        general: 4000000,    // $40k lifetime = $5k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 10: Excellent Credit, Dining-Heavy Spending - TRAVEL
  await runTest(
    'Excellent Credit (800), Dining-Heavy Spender - TRAVEL',
    {
      rewardPreference: 'TRAVEL',
      userCreditScore: 800,
      creditHistoryYears: 8,
      lifetimeSpendingByCategory: {
        dining: 16000000,    // $160k lifetime = $20k/year (primary category)
        travel: 8000000,     // $80k lifetime = $10k/year
        groceries: 3200000,  // $32k lifetime = $4k/year
        general: 6400000,    // $64k lifetime = $8k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 11: New to Credit, Minimal History - CASHBACK
  await runTest(
    'New to Credit (680), Minimal History (6 months) - CASHBACK',
    {
      rewardPreference: 'CASHBACK',
      userCreditScore: 680,
      creditHistoryYears: 0.5,
      lifetimeSpendingByCategory: {
        groceries: 90000,    // $900 lifetime = $1.8k/year
        gas: 60000,          // $600 lifetime = $1.2k/year
        general: 150000,     // $1.5k lifetime = $3k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 12: MISCELLANEOUS preference
  await runTest(
    'Good Credit (720), MISCELLANEOUS preference',
    {
      rewardPreference: 'MISCELLANEOUS',
      userCreditScore: 720,
      creditHistoryYears: 3,
      lifetimeSpendingByCategory: {
        utilities: 1800000,  // $18k lifetime = $6k/year
        streaming: 900000,   // $9k lifetime = $3k/year
        general: 3600000,    // $36k lifetime = $12k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 13: Very High Spender with Annual Fees OK - TRAVEL
  await runTest(
    'Excellent Credit (820), Very High Spender - TRAVEL (Premium Cards)',
    {
      rewardPreference: 'TRAVEL',
      userCreditScore: 820,
      creditHistoryYears: 15,
      lifetimeSpendingByCategory: {
        travel: 45000000,    // $450k lifetime = $30k/year
        dining: 30000000,    // $300k lifetime = $20k/year
        online: 22500000,    // $225k lifetime = $15k/year
        general: 37500000,   // $375k lifetime = $25k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 14: Online Shopping Heavy - CASHBACK
  await runTest(
    'Good Credit (740), Online Shopping Heavy - CASHBACK',
    {
      rewardPreference: 'CASHBACK',
      userCreditScore: 740,
      creditHistoryYears: 6,
      lifetimeSpendingByCategory: {
        online: 12000000,    // $120k lifetime = $20k/year (primary)
        groceries: 3600000,  // $36k lifetime = $6k/year
        general: 6000000,    // $60k lifetime = $10k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      allCardsShouldMeetCreditScore: true,
    }
  );

  // Test 15: Balanced Spending Across Categories - CASHBACK
  await runTest(
    'Good Credit (730), Balanced Spender - CASHBACK',
    {
      rewardPreference: 'CASHBACK',
      userCreditScore: 730,
      creditHistoryYears: 4,
      lifetimeSpendingByCategory: {
        gas: 2000000,        // $20k lifetime = $5k/year
        groceries: 2000000,  // $20k lifetime = $5k/year
        dining: 2000000,     // $20k lifetime = $5k/year
        online: 2000000,     // $20k lifetime = $5k/year
        general: 2000000,    // $20k lifetime = $5k/year
      },
      limit: 10,
      testMode: false,
    },
    {
      minResults: 1,
      allCardsShouldMeetCreditScore: true,
    }
  );

  // =================================================================
  // SUMMARY
  // =================================================================

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 TEST SUITE SUMMARY\n');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (failedTests === 0) {
    console.log('🎉 All tests passed! Algorithm is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Review the failures above.');
  }

  console.log('\n' + '='.repeat(80));
}

// Run tests
runProductionTests().catch(console.error);
