import axios from "axios";

import { priceCache } from "../cache/price-cache";
import { getCoinbaseUrl } from "../utils";
import ITransactionService, {
  ISeparateBidValues,
} from "./ITransaction-service";

export class TransactionService implements ITransactionService {
  /**
   * Returns the current price of `currency` converted to `convert`.
   * Results are cached for 30 seconds using the key "CURRENCY:CONVERT".
   */
  async getPrice(currency: string, convert: string): Promise<number> {
    const cacheKey = `${currency.toUpperCase()}:${convert.toUpperCase()}`;
    const cached = priceCache.get<number>(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    try {
      const { data } = await axios.get(getCoinbaseUrl(currency));
      const rawRate = data?.data?.rates?.[convert.toUpperCase()];

      if (rawRate === undefined) {
        throw new Error(
          `Conversion rate not found for ${currency.toUpperCase()} → ${convert.toUpperCase()}`
        );
      }

      const price = parseFloat(rawRate);
      priceCache.set(cacheKey, price);
      return price;
    } catch (error) {
      throw new Error(`Failed to fetch price: ${error}`);
    }
  }

  /**
   * Validates whether the current price of `currency` in `convert`
   * falls within the given `rangeBidValue` ("minValue-maxValue").
   */
  async validateTransaction(
    rangeBidValue: string,
    currency: string,
    convert: string
  ): Promise<boolean> {
    try {
      const { minValue, maxValue } = this.separateBidValues(rangeBidValue);
      const currentPrice = await this.getPrice(currency, convert);
      return this.isTransactionValid(minValue, maxValue, currentPrice);
    } catch (error) {
      console.error(`Error validating transaction: ${error}`);
      throw new Error("Error on fetching data");
    }
  }

  separateBidValues(rangeBidValue: string): ISeparateBidValues {
    const rangeSplit = rangeBidValue.split("-");

    if (rangeSplit.length !== 2) {
      throw new Error(
        `Invalid rangeBidValue format: "${rangeBidValue}". Expected "minValue-maxValue".`
      );
    }

    const minValue = parseFloat(rangeSplit[0]);
    const maxValue = parseFloat(rangeSplit[1]);

    if (isNaN(minValue) || isNaN(maxValue)) {
      throw new Error(
        `rangeBidValue contains non-numeric values: "${rangeBidValue}".`
      );
    }

    if (minValue >= maxValue) {
      throw new Error(
        `minValue (${minValue}) must be less than maxValue (${maxValue}).`
      );
    }

    return { minValue, maxValue };
  }

  isTransactionValid(
    min: number,
    max: number,
    currentPrice: number
  ): boolean {
    return min <= currentPrice && currentPrice <= max;
  }
}
