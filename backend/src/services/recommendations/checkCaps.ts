/**
 * Check which cards have caps set in database
 */
import { prisma } from '../../utils/prisma';

async function checkCaps() {
  console.log('🔍 Checking cap data in database...\n');
  console.log('='.repeat(80));

  // Check Blue Cash Everyday
  const blueCash = await prisma.cardsCatalog.findFirst({
    where: {
      name: { contains: 'Blue Cash Everyday' },
    },
    include: {
      earnRates: true,
    },
  });

  if (blueCash) {
    console.log('\n📋 Blue Cash Everyday:');
    console.log(`   ID: ${blueCash.id}`);
    console.log('   Earn Rates:');
    blueCash.earnRates.forEach(rate => {
      console.log(`     • ${rate.category}: ${rate.ratePct}`);
      console.log(`       Cap: ${rate.capAmountCents ? `$${rate.capAmountCents / 100}` : 'NONE'}`);
      console.log(`       Window: ${rate.capWindowMonths ? `${rate.capWindowMonths} months` : 'N/A'}`);
    });
  }

  // Check Citi Custom Cash
  const citiCustom = await prisma.cardsCatalog.findFirst({
    where: {
      name: { contains: 'Custom Cash' },
    },
    include: {
      earnRates: true,
    },
  });

  if (citiCustom) {
    console.log('\n📋 Citi Custom Cash:');
    console.log(`   ID: ${citiCustom.id}`);
    console.log('   Earn Rates:');
    citiCustom.earnRates.forEach(rate => {
      console.log(`     • ${rate.category}: ${rate.ratePct}`);
      console.log(`       Cap: ${rate.capAmountCents ? `$${rate.capAmountCents / 100}` : 'NONE'}`);
      console.log(`       Window: ${rate.capWindowMonths ? `${rate.capWindowMonths} months` : 'N/A'}`);
    });
  }

  // Check all cards with caps
  const cardsWithCaps = await prisma.cardsCatalog.findMany({
    where: {
      earnRates: {
        some: {
          capAmountCents: { not: null },
        },
      },
    },
    include: {
      earnRates: {
        where: {
          capAmountCents: { not: null },
        },
      },
    },
  });

  console.log('\n\n📊 All cards with earn rate caps:');
  if (cardsWithCaps.length === 0) {
    console.log('   ⚠️  NO CARDS HAVE CAPS SET IN DATABASE!');
  } else {
    cardsWithCaps.forEach(card => {
      console.log(`\n   • ${card.name} (${card.issuer})`);
      card.earnRates.forEach(rate => {
        console.log(`     - ${rate.category}: ${rate.ratePct} (cap: $${rate.capAmountCents! / 100} per ${rate.capWindowMonths} months)`);
      });
    });
  }

  console.log('\n' + '='.repeat(80));

  await prisma.$disconnect();
}

checkCaps();
