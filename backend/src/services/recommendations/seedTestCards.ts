/**
 * Seed test credit cards into database for testing recommendation algorithm
 * Run with: npx tsx src/services/recommendations/seedTestCards.ts
 */

import { prisma } from '../../utils/prisma';

async function seedTestCards() {
  console.log('🌱 Seeding test credit cards...\n');

  try {
    // Card 1: Chase Freedom Unlimited (Great cashback, moderate requirements)
    const cfu = await prisma.cardsCatalog.upsert({
      where: { issuer_name: { issuer: 'Chase', name: 'Freedom Unlimited' } },
      update: {},
      create: {
        name: 'Freedom Unlimited',
        issuer: 'Chase',
        network: 'VISA',
        RewardType: 'CASHBACK',
        isTestCard: true,
        annualFeeCents: 0,
        minCreditScore: 670,
        earnRates: {
          create: [
            { category: 'general', ratePct: 1.5 },
            { category: 'dining', ratePct: 3.0 },
            { category: 'drugstore', ratePct: 3.0 },
          ],
        },
        bonuses: {
          create: {
            kind: 'WELCOME',
            cashCents: 20000, // $200
            windowMonths: 3,
            minSpendCents: 50000, // $500
            footnotes: [],
          },
        },
        eligibility: {
          create: {
            suggestedHistoryYears: 1,
            otherNotes: [],
          },
        },
      },
    });
    console.log('✅ Created: Chase Freedom Unlimited');

    // Card 2: Discover it Cash Back (Good cashback, rotating categories)
    const discover = await prisma.cardsCatalog.upsert({
      where: { issuer_name: { issuer: 'Discover', name: 'it Cash Back' } },
      update: {},
      create: {
        name: 'it Cash Back',
        issuer: 'Discover',
        network: 'DISCOVER',
        RewardType: 'CASHBACK',
        isTestCard: true,
        annualFeeCents: 0,
        minCreditScore: 700,
        earnRates: {
          create: [
            { category: 'general', ratePct: 1.0 },
            { category: 'gas', ratePct: 5.0 },
            { category: 'groceries', ratePct: 5.0 },
          ],
        },
        bonuses: {
          create: {
            kind: 'WELCOME',
            cashCents: 0, // Cashback match instead
            windowMonths: 12,
            minSpendCents: 0,
            footnotes: ['Cashback Match'],
          },
        },
        eligibility: {
          create: {
            suggestedHistoryYears: 1,
            otherNotes: [],
          },
        },
      },
    });
    console.log('✅ Created: Discover it Cash Back');

    // Card 3: Chase Sapphire Preferred (Travel card with good value)
    const csp = await prisma.cardsCatalog.upsert({
      where: { issuer_name: { issuer: 'Chase', name: 'Sapphire Preferred' } },
      update: {
        valuationCpp: 2.0, // Update to correct value
        isTestCard: true,
      },
      create: {
        name: 'Sapphire Preferred',
        issuer: 'Chase',
        network: 'VISA',
        RewardType: 'TRAVEL',
        isTestCard: true,
        annualFeeCents: 9500, // $95
        minCreditScore: 690,
        valuationCpp: 2.0, // 2 cents per point
        earnRates: {
          create: [
            { category: 'general', ratePct: 1.0 },
            { category: 'travel', ratePct: 2.0 },
            { category: 'dining', ratePct: 3.0 },
            { category: 'online', ratePct: 3.0 },
          ],
        },
        bonuses: {
          create: {
            kind: 'WELCOME',
            points: 60000, // 60k points = $1,200 @ 2cpp
            windowMonths: 3,
            minSpendCents: 400000, // $4,000
            footnotes: [],
          },
        },
        eligibility: {
          create: {
            suggestedHistoryYears: 2,
            otherNotes: [],
          },
        },
      },
    });
    console.log('✅ Created: Chase Sapphire Preferred');

    // Card 4: American Express Platinum (Premium travel, high requirements)
    const amexPlat = await prisma.cardsCatalog.upsert({
      where: { issuer_name: { issuer: 'American Express', name: 'Platinum Card' } },
      update: {
        valuationCpp: 2.0, // Update to correct value
        isTestCard: true,
      },
      create: {
        name: 'Platinum Card',
        issuer: 'American Express',
        network: 'AMEX',
        RewardType: 'TRAVEL',
        isTestCard: true,
        annualFeeCents: 69500, // $695
        minCreditScore: 700,
        valuationCpp: 2.0, // 2 cents per point
        earnRates: {
          create: [
            { category: 'general', ratePct: 1.0 },
            { category: 'travel', ratePct: 5.0 },
          ],
        },
        bonuses: {
          create: {
            kind: 'WELCOME',
            points: 80000, // 80k points = $1,600 @ 2cpp
            windowMonths: 6,
            minSpendCents: 600000, // $6,000
            footnotes: [],
          },
        },
        eligibility: {
          create: {
            suggestedHistoryYears: 3,
            otherNotes: [],
          },
        },
      },
    });
    console.log('✅ Created: American Express Platinum');

    // Card 5: Secured Credit Card (Credit building, no rewards)
    const secured = await prisma.cardsCatalog.upsert({
      where: { issuer_name: { issuer: 'Capital One', name: 'Secured Card' } },
      update: {},
      create: {
        name: 'Secured Card',
        issuer: 'Capital One',
        network: 'MASTERCARD',
        RewardType: null, // Credit building
        isTestCard: true,
        annualFeeCents: 0,
        minCreditScore: null, // No minimum
        earnRates: {
          create: [], // No rewards
        },
        bonuses: {
          create: [], // No bonuses
        },
        eligibility: {
          create: {
            suggestedHistoryYears: 0,
            otherNotes: ['Requires security deposit'],
          },
        },
      },
    });
    console.log('✅ Created: Capital One Secured Card');

    // Card 6: Citi Double Cash (Simple 2% cashback)
    const citiDouble = await prisma.cardsCatalog.upsert({
      where: { issuer_name: { issuer: 'Citi', name: 'Double Cash' } },
      update: {},
      create: {
        name: 'Double Cash',
        issuer: 'Citi',
        network: 'MASTERCARD',
        RewardType: 'CASHBACK',
        isTestCard: true,
        annualFeeCents: 0,
        minCreditScore: 670,
        earnRates: {
          create: [
            { category: 'general', ratePct: 2.0 },
          ],
        },
        bonuses: {
          create: [], // No sign-up bonus
        },
        eligibility: {
          create: {
            suggestedHistoryYears: 1,
            otherNotes: [],
          },
        },
      },
    });
    console.log('✅ Created: Citi Double Cash');

    // Card 7: Blue Cash Everyday (Groceries cashback, no fee)
    const bce = await prisma.cardsCatalog.upsert({
      where: { issuer_name: { issuer: 'American Express', name: 'Blue Cash Everyday' } },
      update: {},
      create: {
        name: 'Blue Cash Everyday',
        issuer: 'American Express',
        network: 'AMEX',
        RewardType: 'CASHBACK',
        isTestCard: true,
        annualFeeCents: 0,
        minCreditScore: 670,
        earnRates: {
          create: [
            { category: 'general', ratePct: 1.0 },
            { category: 'groceries', ratePct: 3.0, capAmountCents: 600000 }, // 3% up to $6k/year
            { category: 'gas', ratePct: 2.0 },
            { category: 'online', ratePct: 2.0 },
          ],
        },
        bonuses: {
          create: {
            kind: 'WELCOME',
            cashCents: 20000, // $200
            windowMonths: 3,
            minSpendCents: 200000, // $2,000
            footnotes: [],
          },
        },
        eligibility: {
          create: {
            suggestedHistoryYears: 1,
            otherNotes: [],
          },
        },
      },
    });
    console.log('✅ Created: American Express Blue Cash Everyday');

    console.log('\n✅ Successfully seeded 7 test credit cards!');
    console.log('\n📝 Summary:');
    console.log('   - 4 Cashback cards (CFU, Discover, Citi, Amex BCE)');
    console.log('   - 2 Travel cards (CSP, Amex Platinum)');
    console.log('   - 1 Credit-building card (Capital One Secured)');
    console.log('   - Various credit score requirements (None, 670, 690, 700)');
    console.log('   - Different bonus structures and spending requirements');

  } catch (error) {
    console.error('❌ Error seeding test cards:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedTestCards();
