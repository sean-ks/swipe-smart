/**
 * Test script for card recommendation algorithm
 * Run with: npx tsx src/services/recommendations/testRecommendations.ts
 */

import { getTopCardRecommendations } from './cardRecommendations';
import { CardRecommendationInput } from './types';

async function runTests() {
  console.log('🧪 Testing Card Recommendation Algorithm\n');
  console.log('='.repeat(60));

  // Test Scenario 1: High credit score, CASHBACK preference, high spending
  console.log('\n📊 Test 1: High Credit Score User (750) - CASHBACK');
  console.log('-'.repeat(60));

  const test1Input: CardRecommendationInput = {
    rewardPreference: 'CASHBACK',
    userCreditScore: 750,
    creditHistoryYears: 5,
    lifetimeSpendingByCategory: {
      gas: 3000000,        // $30,000 lifetime = $6,000/year
      groceries: 2500000,  // $25,000 lifetime = $5,000/year
      dining: 2000000,     // $20,000 lifetime = $4,000/year
      online: 1500000,     // $15,000 lifetime = $3,000/year
      general: 5000000,    // $50,000 lifetime = $10,000/year
    },
    limit: 5,
    testMode: true,
  };

  try {
    const results1 = await getTopCardRecommendations(test1Input);
    console.log(`\n✅ Found ${results1.length} recommendations`);

    results1.forEach((card, index) => {
      console.log(`\n${index + 1}. ${card.cardName} (${card.issuer})`);
      console.log(`   Reward Type: ${card.rewardType || 'Credit Building'}`);
      console.log(`   Total 2-Year Value: $${(card.totalTwoYearValue / 100).toFixed(2)}`);
      console.log(`   - Cashback: $${(card.twoYearCashback / 100).toFixed(2)}`);
      console.log(`   - Bonus: $${(card.bonusValue / 100).toFixed(2)}`);
      console.log(`   - Fees: -$${(card.twoYearFees / 100).toFixed(2)}`);
      console.log(`   Min Credit Score: ${card.minCreditScore || 'None'}`);
      console.log(`   Annual Fee: $${(card.annualFeeCents / 100).toFixed(2)}`);
      if (card.categoryRates.length > 0) {
        console.log(`   Top Rates:`);
        card.categoryRates.slice(0, 3).forEach(rate => {
          console.log(`     - ${rate.category}: ${rate.ratePct}%`);
        });
      }
    });
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  // Test Scenario 2: Low credit score, should get credit-building cards
  console.log('\n\n📊 Test 2: Low Credit Score User (620) - CASHBACK');
  console.log('-'.repeat(60));

  const test2Input: CardRecommendationInput = {
    rewardPreference: 'CASHBACK',
    userCreditScore: 620,
    creditHistoryYears: 1,
    lifetimeSpendingByCategory: {
      gas: 120000,        // $1,200 lifetime = $1,200/year
      groceries: 180000,  // $1,800 lifetime = $1,800/year
      general: 300000,    // $3,000 lifetime = $3,000/year
    },
    limit: 5,
    testMode: true,
  };

  try {
    const results2 = await getTopCardRecommendations(test2Input);
    console.log(`\n✅ Found ${results2.length} recommendations`);

    if (results2.length === 0) {
      console.log('⚠️  No cards found - user may not qualify for any cards');
    } else {
      results2.forEach((card, index) => {
        console.log(`\n${index + 1}. ${card.cardName} (${card.issuer})`);
        console.log(`   Reward Type: ${card.rewardType || 'Credit Building'}`);
        console.log(`   Total 2-Year Value: $${(card.totalTwoYearValue / 100).toFixed(2)}`);
        console.log(`   Min Credit Score: ${card.minCreditScore || 'None'}`);
      });
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  // Test Scenario 3: TRAVEL preference, moderate spending
  console.log('\n\n📊 Test 3: Travel Enthusiast (720) - TRAVEL');
  console.log('-'.repeat(60));

  const test3Input: CardRecommendationInput = {
    rewardPreference: 'TRAVEL',
    userCreditScore: 720,
    creditHistoryYears: 3,
    lifetimeSpendingByCategory: {
      travel: 900000,      // $9,000 lifetime = $3,000/year
      dining: 720000,      // $7,200 lifetime = $2,400/year
      gas: 540000,         // $5,400 lifetime = $1,800/year
      groceries: 1080000,  // $10,800 lifetime = $3,600/year
      general: 1800000,    // $18,000 lifetime = $6,000/year
    },
    limit: 5,
    testMode: true,
  };

  try {
    const results3 = await getTopCardRecommendations(test3Input);
    console.log(`\n✅ Found ${results3.length} recommendations`);

    results3.forEach((card, index) => {
      console.log(`\n${index + 1}. ${card.cardName} (${card.issuer})`);
      console.log(`   Reward Type: ${card.rewardType || 'Credit Building'}`);
      console.log(`   Total 2-Year Value: $${(card.totalTwoYearValue / 100).toFixed(2)}`);
      console.log(`   - Points Value: $${(card.twoYearCashback / 100).toFixed(2)}`);
      console.log(`   - Bonus: $${(card.bonusValue / 100).toFixed(2)}`);
      console.log(`   - Fees: -$${(card.twoYearFees / 100).toFixed(2)}`);
    });
  } catch (error) {
    console.error('❌ Test 3 failed:', error);
  }

  // Test Scenario 4: User who can't hit bonus requirements
  console.log('\n\n📊 Test 4: Low Spender (680) - CASHBACK');
  console.log('-'.repeat(60));
  console.log('Testing bonus feasibility filtering...');

  const test4Input: CardRecommendationInput = {
    rewardPreference: 'CASHBACK',
    userCreditScore: 680,
    creditHistoryYears: 2,
    lifetimeSpendingByCategory: {
      groceries: 60000,   // $600 lifetime = $300/year = $25/month
      gas: 48000,         // $480 lifetime = $240/year = $20/month
      general: 120000,    // $1,200 lifetime = $600/year = $50/month
    },
    limit: 5,
    testMode: true,
  };

  try {
    const results4 = await getTopCardRecommendations(test4Input);
    console.log(`\n✅ Found ${results4.length} recommendations`);
    console.log(`   (Cards with high bonus requirements should be filtered out)`);

    results4.forEach((card, index) => {
      console.log(`\n${index + 1}. ${card.cardName}`);
      console.log(`   Bonus: $${(card.bonusValue / 100).toFixed(2)}`);
      console.log(`   Total Value: $${(card.totalTwoYearValue / 100).toFixed(2)}`);
    });
  } catch (error) {
    console.error('❌ Test 4 failed:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!\n');
}

// Run tests
runTests().catch(console.error);
