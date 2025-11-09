/**
 * Quick script to check how ratePct is stored in the database
 */
import { prisma } from '../../utils/prisma';

async function checkCardData() {
  const cards = await prisma.cardsCatalog.findMany({
    where: {
      RewardType: 'CASHBACK',
    },
    include: {
      earnRates: true,
    },
    take: 3,
  });

  console.log('📊 Checking how ratePct is stored in database:\n');

  cards.forEach(card => {
    console.log(`Card: ${card.name} (${card.issuer})`);
    console.log(`Reward Type: ${card.RewardType}`);
    console.log(`Earn Rates:`);
    card.earnRates.forEach(rate => {
      console.log(`  - ${rate.category}: ${rate.ratePct} (type: ${typeof rate.ratePct})`);
    });
    console.log('');
  });

  await prisma.$disconnect();
}

checkCardData();
