const MONTHLY_AUTHOR_PRICE_CENTS = 999;
const YEARLY_AUTHOR_PRICE_CENTS = 9999;
const MONTHS_PER_YEAR = 12;

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const yearlyPriceAtMonthlyRate = MONTHLY_AUTHOR_PRICE_CENTS * MONTHS_PER_YEAR;
const yearlySavingsCents = yearlyPriceAtMonthlyRate - YEARLY_AUTHOR_PRICE_CENTS;

export const authorPricing = {
  monthly: {
    price: formatUsd(MONTHLY_AUTHOR_PRICE_CENTS),
  },
  yearly: {
    price: formatUsd(YEARLY_AUTHOR_PRICE_CENTS),
    monthlyEquivalent: formatUsd(Math.round(YEARLY_AUTHOR_PRICE_CENTS / MONTHS_PER_YEAR)),
    savings: formatUsd(yearlySavingsCents),
    savingsPercentage: Math.round((yearlySavingsCents / yearlyPriceAtMonthlyRate) * 100),
  },
} as const;
