import NodeCache from "node-cache";

/**
 * Singleton in-memory cache with a 30-second TTL.
 * Cache keys follow the pattern: "CURRENCY:CONVERT" (e.g. "ETH:BRL", "BTC:USD").
 */
export const priceCache = new NodeCache({ stdTTL: 30, checkperiod: 10 });
