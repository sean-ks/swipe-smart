import { Category } from '../../../../generated/prisma';

/**
 * Test the upgrade-path API endpoint
 *
 * Prerequisites:
 * 1. Ensure the backend server is running (npm run dev)
 * 2. Run with: npx tsx src/services/recommendations/testUpgradePathEndpoint.ts
 */

const BASE_URL = 'http://localhost:5001';
const ENDPOINT = '/api/recommendations/upgrade-path';

interface TestCase {
  name: string;
  payload: any;
  expectedMinCards: number;
  expectedMaxCards: number;
}

async function testEndpoint(testCase: TestCase) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n🧪 Test: ${testCase.name}\n`);
  console.log('Request payload:');
  console.log(JSON.stringify(testCase.payload, null, 2));

  try {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('\n❌ Request failed');
      console.log(`Status: ${response.status}`);
      console.log('Error:', data);
      return false;
    }

    console.log('\n✅ Response received');
    console.log(`Status: ${response.status}`);
    console.log('\nResponse data:');
    console.log(JSON.stringify(data, null, 2));

    // Validate response structure
    if (!data.success) {
      console.log('\n❌ Response success is false');
      return false;
    }

    if (!data.data || !Array.isArray(data.data.cards)) {
      console.log('\n❌ Invalid response structure - cards array missing');
      return false;
    }

    const cardCount = data.data.cards.length;

    // Validate card count
    if (cardCount < testCase.expectedMinCards || cardCount > testCase.expectedMaxCards) {
      console.log(`\n❌ Card count ${cardCount} outside expected range [${testCase.expectedMinCards}-${testCase.expectedMaxCards}]`);
      return false;
    }

    console.log(`\n✅ Card count: ${cardCount} (within expected range)`);
    console.log('\n📋 Upgrade Path:');
    data.data.cards.forEach((cardName: string, idx: number) => {
      console.log(`  ${idx + 1}. ${cardName}`);
    });

    console.log('\n📊 Meta:');
    console.log(`  Total Cards: ${data.meta.totalCards}`);
    console.log(`  Reward Preference: ${data.meta.rewardPreference}`);
    console.log(`  Credit Score: ${data.meta.startingCreditScore} → ${data.meta.endingCreditScore}`);

    return true;
  } catch (error) {
    console.log('\n❌ Request error:', error);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(70));
  console.log('🎯 UPGRADE PATH API ENDPOINT TESTS');
  console.log('='.repeat(70));
  console.log(`\nTesting endpoint: ${BASE_URL}${ENDPOINT}\n`);

  const testCases: TestCase[] = [
    {
      name: 'Poor Credit → Premium (CASHBACK)',
      payload: {
        rewardPreference: 'CASHBACK',
        userCreditScore: 600,
        creditHistoryYears: 1,
        lifetimeSpendingByCategory: {
          [Category.groceries]: 100000,
          [Category.dining]: 60000,
          [Category.gas]: 80000,
          [Category.travel]: 20000,
          [Category.general]: 140000,
        },
        currentCardIds: [],
        testMode: false,
      },
      expectedMinCards: 3,
      expectedMaxCards: 5,
    },
    {
      name: 'Good Credit → Premium (TRAVEL)',
      payload: {
        rewardPreference: 'TRAVEL',
        userCreditScore: 680,
        creditHistoryYears: 3,
        lifetimeSpendingByCategory: {
          [Category.groceries]: 270000,
          [Category.dining]: 360000,
          [Category.gas]: 135000,
          [Category.travel]: 900000,
          [Category.general]: 450000,
        },
        currentCardIds: [],
        testMode: false,
      },
      expectedMinCards: 2,
      expectedMaxCards: 5,
    },
    {
      name: 'High Spender - Grocery Heavy (CASHBACK)',
      payload: {
        rewardPreference: 'CASHBACK',
        userCreditScore: 640,
        creditHistoryYears: 2,
        lifetimeSpendingByCategory: {
          [Category.groceries]: 480000,
          [Category.dining]: 240000,
          [Category.gas]: 192000,
          [Category.travel]: 96000,
          [Category.general]: 384000,
        },
        currentCardIds: [],
        testMode: false,
      },
      expectedMinCards: 3,
      expectedMaxCards: 5,
    },
    {
      name: 'User with Existing Card (filtered path)',
      payload: {
        rewardPreference: 'CASHBACK',
        userCreditScore: 700,
        creditHistoryYears: 4,
        lifetimeSpendingByCategory: {
          [Category.groceries]: 240000,
          [Category.dining]: 180000,
          [Category.gas]: 120000,
          [Category.travel]: 60000,
          [Category.general]: 200000,
        },
        // This will be updated dynamically after first request
        currentCardIds: [],
        testMode: false,
      },
      expectedMinCards: 0,  // Could be 0 if they're already at top tier
      expectedMaxCards: 4,
    },
  ];

  const results: boolean[] = [];

  // Run test cases 1-3
  for (let i = 0; i < 3; i++) {
    const result = await testEndpoint(testCases[i]);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }

  // Test case 4: Simulate user with existing card
  console.log(`\n${'='.repeat(70)}`);
  console.log('\n🧪 Test 4: User with Existing Card (two-part test)\n');

  // Part A: Get full path
  console.log('Part A: Getting full path...');
  const fullPathResponse = await fetch(`${BASE_URL}${ENDPOINT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testCases[3].payload),
  });

  const fullPathData = await fullPathResponse.json();

  if (fullPathData.success && fullPathData.data.cards.length > 0) {
    console.log(`Full path has ${fullPathData.data.cards.length} cards`);

    // Part B: Test with existing card (simulate user having first card)
    // We need to get the card ID, but API only returns names
    // For this test, we'll just demonstrate the validation works
    console.log('\nPart B: Testing with currentCardIds validation...');

    const filteredPayload = {
      ...testCases[3].payload,
      currentCardIds: ['some-card-id'], // Mock card ID
    };

    const filteredResponse = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filteredPayload),
    });

    const filteredData = await filteredResponse.json();

    if (filteredResponse.ok) {
      console.log('✅ Endpoint accepts currentCardIds parameter');
      console.log(`   Returned ${filteredData.data.cards.length} cards`);
      results.push(true);
    } else {
      console.log('❌ Endpoint rejected currentCardIds parameter');
      results.push(false);
    }
  } else {
    console.log('❌ Could not get full path for test');
    results.push(false);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 TEST SUMMARY\n');

  const passed = results.filter(r => r).length;
  const total = results.length;

  results.forEach((result, idx) => {
    console.log(`  Test ${idx + 1}: ${result ? '✅ PASSED' : '❌ FAILED'}`);
  });

  console.log(`\nTotal: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n🎉 All tests passed!\n');
  } else {
    console.log(`\n⚠️  ${total - passed} test(s) failed\n`);
  }

  return passed === total;
}

// Run the tests
runTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed with error:');
    console.error(error);
    process.exit(1);
  });
