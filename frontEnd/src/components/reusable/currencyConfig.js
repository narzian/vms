// currencyConfig.js
export const currencyRates = {
    INR: 1,
    USD: 83.24,
    EUR: 89.87,
    GBP: 105.24,
    JPY: 0.56
};

/**
 * Currency formatting utility functions
 */

// Format a number as currency
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Parse a currency string back to a number
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  return parseFloat(currencyString.replace(/[^\d.-]/g, ''));
};