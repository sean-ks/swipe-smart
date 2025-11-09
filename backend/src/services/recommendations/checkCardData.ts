/**
 * Check key card configurations to understand why certain cards aren't appearing
 */
import { prisma } from '../../utils/prisma';

async function checkCardData() {
  console.log('=== Checking Key Cards Configuration ===\n');

  const keyCards = [
    'Capital One Savor',
    'Blue Cash Preferred',
    'Citi Custom Cash',
    'Chase Freedom Flex',
    'Citi Double Cash',
    'Wells Fargo Active Cash',
    'Capital One Platinum',
  ];

  for (const cardName of keyCards) {
    const card = await prisma.cardsCatalog.findFirst({
      where: { name: cardName },
      include: {
        earnRates: true,
        bonuses: { where: { kind: 'WELCOME' } },
        eligibility: true,
      },
    });

    if (!card) {
      console.log(`❌ ${cardName}: NOT FOUND IN DATABASE\n`);
      continue;
    }

    console.log(`📋 ${card.name} (${card.issuer})`);
    console.log(`  Reward Type: ${card.RewardType || 'Credit Builder'}`);
    console.log(`  Min Credit Score: ${card.minCreditScore || 'None'}`);
    console.log(`  Annual Fee: $${(card.annualFeeCents / 100).toFixed(2)}`);
    console.log(`  Suggested History: ${card.eligibility?.suggestedHistoryYears || 'None'} years`);

    console.log(`  Earn Rates:`);
    card.earnRates.forEach(rate => {
      console.log(`    - ${rate.category}: ${rate.ratePct}%`);
      if (rate.capAmountCents) {
        console.log(`      Cap: $${rate.capAmountCents / 100} per ${rate.capWindowMonths} months`);
      }
    });

    if (card.bonuses.length > 0) {
      const bonus = card.bonuses[0];
      console.log(`  Welcome Bonus:`);
      if (bonus.cashCents) {
        console.log(`    - Cash: $${bonus.cashCents / 100}`);
      }
      if (bonus.points) {
        console.log(`    - Points: ${bonus.points}`);
      }
      console.log(`    - Min Spend: $${bonus.minSpendCents / 100} in ${bonus.windowMonths} months`);
    }
    console.log();
  }

  await prisma.$disconnect();
}

checkCardData().catch(console.error);
