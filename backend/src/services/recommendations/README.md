# Card Recommendation Algorithm

This directory contains the credit card recommendation algorithm that calculates the best cards for users based on their spending habits, credit score, and preferences.

## Algorithm Overview

The recommendation algorithm works in 3 stages:

### Stage 1: Filter Eligible Cards
- Filter by reward type: user's preference OR null (credit-building cards)
- Filter by credit score: `minCreditScore <= userScore` OR no requirement
- Filter by credit history: `suggestedHistoryYears <= userYears` OR no requirement
- Filter by bonus feasibility: Can user meet minimum spend requirements?

### Stage 2: Calculate 2-Year Value
For each eligible card:
```
Total Value = (2-year cashback) + (sign-up bonus) - (2-year fees)
```

- **2-Year Cashback**: User's yearly spending × earn rate × 2 years
- **Sign-up Bonus**:
  - Cashback cards: Use cash value directly
  - Travel cards: Convert points to cash using `valuationCpp`
- **2-Year Fees**: `annualFeeCents × 2`

### Stage 3: Sort & Return
- Sort cards by Total Value (descending)
- Return top K cards

## Files

- **`types.ts`** - TypeScript interfaces
- **`helpers.ts`** - Utility functions for calculations
- **`cardRecommendations.ts`** - Main recommendation algorithm
- **`seedTestCards.ts`** - Script to populate database with test cards
- **`testRecommendations.ts`** - Test script for test cards (testMode: true)
- **`testProductionDatabase.ts`** - Comprehensive test suite for full database (testMode: false)

## Test Mode

The algorithm supports a **test mode** that filters results to only include test cards (marked with `isTestCard: true` in the database). This ensures tests run against controlled data without interference from your production card catalog.

**Test cards** are marked with `isTestCard: true` and can be seeded using the provided script. All other cards default to `isTestCard: false`.

## Testing

### 1. Seed Test Data

First, populate the database with test credit cards (these will have `isTestCard: true`):

```bash
cd backend
npx tsx src/services/recommendations/seedTestCards.ts
```

This creates 7 test cards:
- **Cashback Cards**: Chase Freedom Unlimited, Discover it, Citi Double Cash, Amex Blue Cash Everyday
- **Travel Cards**: Chase Sapphire Preferred, Amex Platinum
- **Credit Building**: Capital One Secured Card (null reward type)

### 2. Run Test Mode Tests (Test Cards Only)

Run the test scenarios against **test cards only** (controlled environment):

```bash
npx tsx src/services/recommendations/testRecommendations.ts
```

This runs 4 test scenarios with `testMode: true`:
1. **High credit score user (750)** - Should get premium cashback cards
2. **Low credit score user (620)** - Should get credit-building cards or entry-level cards
3. **Travel enthusiast (720)** - Should get travel cards with best point values
4. **Low spender (680)** - Tests bonus feasibility filtering

### 3. Run Production Database Tests (All Cards)

Run **comprehensive tests** against your entire card database:

```bash
npx tsx src/services/recommendations/testProductionDatabase.ts
```

This runs **15 exhaustive test scenarios** with `testMode: false`:

**Test Coverage:**
- ✅ **Credit Scores**: 620 (poor) → 820 (excellent)
- ✅ **Spending Levels**: $600/year → $90,000/year
- ✅ **Reward Types**: CASHBACK, TRAVEL, MISCELLANEOUS
- ✅ **Spending Patterns**:
  - Grocery-heavy, Gas-heavy, Dining-heavy
  - Online shopping-heavy, Balanced spending
- ✅ **Credit History**: 6 months → 15 years
- ✅ **Edge Cases**: New to credit, minimal spending, bonus feasibility

**Each test validates:**
- Correct number of results returned
- All cards meet credit score requirements
- Correct reward type filtering
- Value calculations are accurate
- Bonus feasibility logic works

**Expected Output:**
```
🚀 PRODUCTION DATABASE TEST SUITE
Testing against ALL cards in database

📊 Test 1: Excellent Credit (800), High Spender - CASHBACK
✅ Found 10 recommendations
1. [Card Name] ([Issuer])
   Type: CASHBACK
   Total 2-Year Value: $X,XXX.XX
   ...
✅ PASSED

...

📊 TEST SUITE SUMMARY
Total Tests: 15
✅ Passed: 15
❌ Failed: 0
Success Rate: 100.0%
🎉 All tests passed! Algorithm is working correctly.
```

### 4. Test via API

Start the backend server:

```bash
npm run dev
```

Make a POST request to `http://localhost:5000/api/recommendations`:

```bash
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "rewardPreference": "CASHBACK",
    "userCreditScore": 720,
    "creditHistoryYears": 3,
    "lifetimeSpendingByCategory": {
      "gas": 500000,
      "groceries": 400000,
      "dining": 300000
    },
    "limit": 5
  }'
```

## API Endpoint

### POST `/api/recommendations`

**Request Body:**
```typescript
{
  rewardPreference: "CASHBACK" | "TRAVEL" | "MISCELLANEOUS",
  userCreditScore: number,        // 300-850
  creditHistoryYears: number,     // Years of credit history
  lifetimeSpendingByCategory: {
    [category]: number            // Total lifetime spending in cents
  },
  limit: number,                  // Number of cards to return (1-50)
  testMode?: boolean              // Optional: Only include test cards (for testing)
}
```

**Response:**
```typescript
{
  success: true,
  data: CardRecommendation[],
  meta: {
    count: number,
    requestedLimit: number
  }
}
```

## Null Handling

The algorithm properly handles:
- **Cards with `RewardType = null`** (credit-building cards with no rewards)
- **Cards with no `earnRates`** (0% cashback on all categories)
- **Cards with no `bonuses`** (no sign-up bonus value)
- **Cards with `minCreditScore = null`** (no credit score requirement)

Credit-building cards are automatically included in results but will rank low due to zero rewards/bonuses.

## Example Output

```json
{
  "success": true,
  "data": [
    {
      "cardId": "uuid",
      "cardName": "Freedom Unlimited",
      "issuer": "Chase",
      "rewardType": "CASHBACK",
      "annualFeeCents": 0,
      "totalTwoYearValue": 145000,
      "twoYearCashback": 125000,
      "bonusValue": 20000,
      "twoYearFees": 0,
      "categoryRates": [
        { "category": "dining", "ratePct": 3.0 },
        { "category": "general", "ratePct": 1.5 }
      ],
      "minCreditScore": 670
    }
  ],
  "meta": {
    "count": 1,
    "requestedLimit": 5
  }
}
```

## Notes

- All monetary values are in **cents** (e.g., 20000 = $200)
- `valuationCpp` for travel cards is the cents-per-point value (e.g., 0.02 = 2 cents per point)
- Earn rates are percentages (e.g., 3.0 = 3%)
- The algorithm assumes 2-year card lifecycle for value calculations
