/**
 * Add missing earning caps to cards in database
 * Run with: npx tsx src/services/recommendations/addMissingCaps.ts
 */

import { prisma } from '../../utils/prisma';

async function addMissingCaps() {
  console.log('🔧 Adding missing earning caps to cards...\n');
  console.log('='.repeat(80));

  // Blue Cash Everyday: 3% on groceries, gas, online up to $6,000/year each
  console.log('\n📝 Updating Blue Cash Everyday caps...');

  const blueCash = await prisma.cardsCatalog.findFirst({
    where: {
      name: { contains: 'Blue Cash Everyday' },
      issuer: 'American Express',
    },
    include: {
      earnRates: true,
    },
  });

  if (blueCash) {
    const categoriesToCap = ['groceries', 'gas', 'online'];

    for (const category of categoriesToCap) {
      const earnRate = blueCash.earnRates.find(r => r.category === category);

      if (earnRate) {
        await prisma.cardEarnRate.update({
          where: { id: earnRate.id },
          data: {
            capAmountCents: 600000, // $6,000
            capWindowMonths: 12,    // per year
          },
        });
        console.log(`   ✓ Updated ${category}: $6,000 cap per 12 months`);
      }
    }
    console.log('   ✅ Blue Cash Everyday updated!');
  } else {
    console.log('   ⚠️  Blue Cash Everyday not found');
  }

  // Blue Cash Preferred: 6% on groceries up to $6,000/year, 3% on gas/transit up to $6,000/year combined
  console.log('\n📝 Updating Blue Cash Preferred caps...');

  const bluePreferred = await prisma.cardsCatalog.findFirst({
    where: {
      name: { contains: 'Blue Cash Preferred' },
      issuer: 'American Express',
    },
    include: {
      earnRates: true,
    },
  });

  if (bluePreferred) {
    // Groceries: 6% up to $6,000/year
    const groceriesRate = bluePreferred.earnRates.find(r => r.category === 'groceries');
    if (groceriesRate) {
      await prisma.cardEarnRate.update({
        where: { id: groceriesRate.id },
        data: {
          capAmountCents: 600000, // $6,000
          capWindowMonths: 12,    // per year
        },
      });
      console.log(`   ✓ Updated groceries: $6,000 cap per 12 months`);
    }

    // Gas and transit: 3% up to $6,000/year combined
    // Note: This is a combined cap which our current logic doesn't support
    // For now, we'll cap each individually at $6,000
    const gasRate = bluePreferred.earnRates.find(r => r.category === 'gas');
    if (gasRate) {
      await prisma.cardEarnRate.update({
        where: { id: gasRate.id },
        data: {
          capAmountCents: 600000, // $6,000
          capWindowMonths: 12,    // per year
        },
      });
      console.log(`   ✓ Updated gas: $6,000 cap per 12 months`);
    }

    const transitRate = bluePreferred.earnRates.find(r => r.category === 'transit');
    if (transitRate) {
      await prisma.cardEarnRate.update({
        where: { id: transitRate.id },
        data: {
          capAmountCents: 600000, // $6,000
          capWindowMonths: 12,    // per year
        },
      });
      console.log(`   ✓ Updated transit: $6,000 cap per 12 months`);
    }

    console.log('   ✅ Blue Cash Preferred updated!');
  } else {
    console.log('   ⚠️  Blue Cash Preferred not found');
  }

  // Add any other cards with known caps here
  // Example: Chase Freedom cards, Discover it, etc.

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Cap updates complete!');
  console.log('   Run testCapEnforcement.ts again to verify.\n');

  await prisma.$disconnect();
}

addMissingCaps().catch(console.error);
