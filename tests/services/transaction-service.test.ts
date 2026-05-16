import { TransactionService } from "../../src/services/transaction-service";
import { priceCache } from "../../src/cache/price-cache";

describe("TransactionService — unit tests", () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService();
    priceCache.flushAll();
  });

  // ── separateBidValues ──────────────────────────────────────────────────────

  describe("separateBidValues()", () => {
    it("correctly splits a valid range string", () => {
      const result = service.separateBidValues("10000-20000");
      expect(result).toEqual({ minValue: 10000, maxValue: 20000 });
    });

    it("works with decimal values", () => {
      const result = service.separateBidValues("1500.50-2000.75");
      expect(result.minValue).toBeCloseTo(1500.5);
      expect(result.maxValue).toBeCloseTo(2000.75);
    });

    it("throws when format has no dash separator", () => {
      expect(() => service.separateBidValues("invalid")).toThrow(
        /Invalid rangeBidValue format/
      );
    });

    it("throws when values are non-numeric", () => {
      expect(() => service.separateBidValues("abc-def")).toThrow(
        /non-numeric/
      );
    });

    it("throws when minValue >= maxValue", () => {
      expect(() => service.separateBidValues("20000-10000")).toThrow(
        /minValue.*must be less than maxValue/
      );
    });

    it("throws when minValue equals maxValue", () => {
      expect(() => service.separateBidValues("5000-5000")).toThrow(
        /minValue.*must be less than maxValue/
      );
    });
  });

  // ── isTransactionValid ─────────────────────────────────────────────────────

  describe("isTransactionValid()", () => {
    it("returns true when price is within range", () => {
      expect(service.isTransactionValid(10000, 20000, 15000)).toBe(true);
    });

    it("returns true when price equals minValue (boundary)", () => {
      expect(service.isTransactionValid(10000, 20000, 10000)).toBe(true);
    });

    it("returns true when price equals maxValue (boundary)", () => {
      expect(service.isTransactionValid(10000, 20000, 20000)).toBe(true);
    });

    it("returns false when price is below minValue", () => {
      expect(service.isTransactionValid(10000, 20000, 5000)).toBe(false);
    });

    it("returns false when price is above maxValue", () => {
      expect(service.isTransactionValid(10000, 20000, 25000)).toBe(false);
    });
  });
});
