/**
 * Transaction Analysis Service
 * Handles categorization and aggregation of transaction data
 */

/**
 * Transaction interface matching Plaid transaction format
 */
export interface Transaction {
  date_transacted: string;
  date_posted: string;
  amount: number;
  description: string;
  currency: string;
}

/**
 * Category totals dictionary with "User." prefix
 * Example: { "User.Dining": 15000, "User.Groceries": 8000 }
 */
export type CategoryTotals = Record<string, number>;

/**
 * Maps transaction description to standardized category names
 * @param description - The transaction description (e.g., "DINING", "GROCERIES")
 * @returns Standardized category name with "User." prefix (e.g., "User.Dining")
 */
function mapDescriptionToCategory(description: string): string {
  const normalizedDesc = description.toUpperCase().trim();

  // Map common transaction descriptions to user categories
  const categoryMap: Record<string, string> = {
    'DINING': 'User.Dining',
    'GROCERIES': 'User.Groceries',
    'GAS': 'User.Gas',
    'TRAVEL': 'User.Travel',
    'GENERAL': 'User.General',
    'PAYMENT RECEIVED': 'User.PaymentReceived',
  };

  return categoryMap[normalizedDesc] || `User.${normalizedDesc.charAt(0) + normalizedDesc.slice(1).toLowerCase()}`;
}

/**
 * Calculates total spending by category from transaction data
 * Only includes negative amounts (purchases/charges), excludes positive amounts (payments/credits)
 *
 * @param transactions - Array of transactions with amount and description fields
 * @returns Dictionary mapping category names to total costs in cents (absolute value)
 *
 * @example
 * const transactions = [
 *   { amount: -48.48, description: "DINING", ... },
 *   { amount: -42.59, description: "GROCERIES", ... },
 *   { amount: 226.01, description: "PAYMENT RECEIVED", ... }
 * ];
 *
 * const totals = calculateCategoryTotals(transactions);
 * // Returns: { "User.Dining": 4848, "User.Groceries": 4259 }
 * // Note: PAYMENT RECEIVED is excluded as it's positive (credit)
 */
export function calculateCategoryTotals(transactions: Transaction[]): CategoryTotals {
  const categoryTotals: CategoryTotals = {};

  for (const transaction of transactions) {
    // Only process negative amounts (purchases/charges)
    // Skip positive amounts (payments, credits, refunds)
    if (transaction.amount >= 0) {
      continue;
    }

    // Map description to category name
    const category = mapDescriptionToCategory(transaction.description);

    // Convert dollar amount to cents and take absolute value
    // Amount is negative for purchases, so we negate to get positive cost
    const amountInCents = Math.abs(Math.round(transaction.amount * 100));

    // Add to category total
    if (categoryTotals[category]) {
      categoryTotals[category] += amountInCents;
    } else {
      categoryTotals[category] = amountInCents;
    }
  }

  return categoryTotals;
}

/**
 * Formats category totals for display (converts cents to dollars)
 * @param categoryTotals - Dictionary of category totals in cents
 * @returns Dictionary of category totals in dollars (formatted to 2 decimal places)
 *
 * @example
 * const totalsInCents = { "User.Dining": 4848, "User.Groceries": 4259 };
 * const totalsInDollars = formatCategoryTotals(totalsInCents);
 * // Returns: { "User.Dining": "$48.48", "User.Groceries": "$42.59" }
 */
export function formatCategoryTotals(categoryTotals: CategoryTotals): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const [category, totalCents] of Object.entries(categoryTotals)) {
    const dollars = (totalCents / 100).toFixed(2);
    formatted[category] = `$${dollars}`;
  }

  return formatted;
}
