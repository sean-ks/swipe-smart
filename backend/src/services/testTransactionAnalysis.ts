/**
 * Test file for transaction analysis service
 * Demonstrates usage with the discover_student_custom_sandbox_user.json data
 */

import { calculateCategoryTotals, formatCategoryTotals, Transaction } from './transactionAnalysis';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface for the Plaid sandbox JSON structure
 */
interface PlaidSandboxData {
  version: number;
  seed: number;
  override_accounts: Array<{
    type: string;
    subtype: string;
    starting_balance: number;
    force_available_balance: number | null;
    currency: string;
    meta: {
      name: string;
      official_name: string;
      limit: number;
    };
    numbers: any;
    transactions: Transaction[];
    identity: any;
  }>;
}

/**
 * Loads transaction data from the Plaid sandbox JSON file
 * @param filePath - Path to the JSON file
 * @returns Array of transactions
 */
function loadTransactionsFromFile(filePath: string): Transaction[] {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: PlaidSandboxData = JSON.parse(fileContent);

    // Extract transactions from the first account
    if (data.override_accounts && data.override_accounts.length > 0) {
      return data.override_accounts[0].transactions;
    }

    return [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
}

/**
 * Main test function
 */
function runTest() {
  console.log('=== Transaction Category Analysis Test ===\n');

  // Load transactions from JSON file
  const jsonFilePath = path.join(__dirname, '../../../discover_student_custom_sandbox_user.json');
  const transactions = loadTransactionsFromFile(jsonFilePath);

  console.log(`Loaded ${transactions.length} transactions\n`);

  // Calculate category totals
  const categoryTotals = calculateCategoryTotals(transactions);

  console.log('Category Totals (in cents):');
  console.log(JSON.stringify(categoryTotals, null, 2));
  console.log('\n');

  // Format for display
  const formattedTotals = formatCategoryTotals(categoryTotals);

  console.log('Category Totals (formatted):');
  console.log(JSON.stringify(formattedTotals, null, 2));
  console.log('\n');

  // Calculate grand total
  const grandTotal = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  console.log(`Grand Total: $${(grandTotal / 100).toFixed(2)}`);
  console.log(`Grand Total (cents): ${grandTotal}`);
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest();
}

export { runTest };
