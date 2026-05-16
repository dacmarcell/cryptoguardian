export const getCoinbaseUrl = (currency: string): string =>
  `https://api.coinbase.com/v2/exchange-rates?currency=${currency.toUpperCase()}`;
