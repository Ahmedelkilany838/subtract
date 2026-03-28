export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'EGP' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

export const EXCHANGE_RATE_API_URL = 'https://open.er-api.com/v6/latest';

export async function getExchangeRates(base: string = 'USD') {
  try {
    const response = await fetch(`${EXCHANGE_RATE_API_URL}/${base}`);
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return null;
  }
}
