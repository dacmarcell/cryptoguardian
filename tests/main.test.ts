import * as dotenv from "dotenv";
dotenv.config();

import nock from "nock";
import request from "supertest";
import { App } from "../src/main";
import { priceCache } from "../src/cache/price-cache";

const COINBASE_HOST = "https://api.coinbase.com";
const ETH_BRL_RATE = "19000";

const mockCoinbaseResponse = (currency = "ETH", rate = ETH_BRL_RATE) => ({
  data: {
    currency,
    rates: { BRL: rate, USD: "3600" },
  },
});

describe("Transaction API (integration)", () => {
  let app: App;

  beforeAll(() => {
    app = new App();
  });

  beforeEach(() => {
    priceCache.flushAll(); // ensure no stale cache between tests
    nock.cleanAll();
  });

  afterAll(() => {
    nock.restore();
  });

  // ── GET /api/v1/price ──────────────────────────────────────────────────────

  describe("GET /api/v1/price", () => {
    it("returns 200 with ETH price in BRL (default)", async () => {
      nock(COINBASE_HOST)
        .get("/v2/exchange-rates?currency=ETH")
        .reply(200, mockCoinbaseResponse());

      const res = await request(app.getApp()).get("/api/v1/price");

      expect(res.status).toBe(200);
      expect(res.body.error).toBe(false);
      expect(res.body.currency).toBe("ETH");
      expect(res.body.convert).toBe("BRL");
      expect(parseFloat(res.body.price)).toBeCloseTo(19000, 0);
    });

    it("returns 200 with BTC price in USD when query params provided", async () => {
      nock(COINBASE_HOST)
        .get("/v2/exchange-rates?currency=BTC")
        .reply(200, {
          data: { currency: "BTC", rates: { USD: "65000", BRL: "320000" } },
        });

      const res = await request(app.getApp()).get(
        "/api/v1/price?currency=BTC&convert=USD"
      );

      expect(res.status).toBe(200);
      expect(res.body.currency).toBe("BTC");
      expect(res.body.convert).toBe("USD");
      expect(parseFloat(res.body.price)).toBeCloseTo(65000, 0);
    });

    it("returns 200 from cache on second request (no extra Coinbase call)", async () => {
      nock(COINBASE_HOST)
        .get("/v2/exchange-rates?currency=ETH")
        .once()
        .reply(200, mockCoinbaseResponse());

      // first call — populates cache
      await request(app.getApp()).get("/api/v1/price");
      // second call — must hit cache (nock would throw if Coinbase were called again)
      const res = await request(app.getApp()).get("/api/v1/price");

      expect(res.status).toBe(200);
      expect(nock.isDone()).toBe(true); // only one HTTP call was made
    });

    it("returns 500 when Coinbase is unreachable", async () => {
      nock(COINBASE_HOST)
        .get("/v2/exchange-rates?currency=ETH")
        .replyWithError("Connection refused");

      const res = await request(app.getApp()).get("/api/v1/price");

      expect(res.status).toBe(500);
      expect(res.body.error).toBe(true);
    });

    it("returns 500 when conversion rate is not found for the requested pair", async () => {
      nock(COINBASE_HOST)
        .get("/v2/exchange-rates?currency=ETH")
        .reply(200, { data: { currency: "ETH", rates: {} } }); // empty rates

      const res = await request(app.getApp()).get(
        "/api/v1/price?currency=ETH&convert=XYZ"
      );

      expect(res.status).toBe(500);
      expect(res.body.error).toBe(true);
    });
  });

  // ── POST /api/v1/validate-transaction ─────────────────────────────────────

  describe("POST /api/v1/validate-transaction", () => {
    it("returns 202 when price is within the given range", async () => {
      nock(COINBASE_HOST)
        .get("/v2/exchange-rates?currency=ETH")
        .reply(200, mockCoinbaseResponse()); // price = 19000

      const res = await request(app.getApp())
        .post("/api/v1/validate-transaction")
        .send({ rangeBidValue: "18000-21000" });

      expect(res.status).toBe(202);
      expect(res.body.message).toBe("Transaction Valid");
    });

    it("returns 406 when price is outside the given range", async () => {
      nock(COINBASE_HOST)
        .get("/v2/exchange-rates?currency=ETH")
        .reply(200, mockCoinbaseResponse()); // price = 19000

      const res = await request(app.getApp())
        .post("/api/v1/validate-transaction")
        .send({ rangeBidValue: "1000-5000" });

      expect(res.status).toBe(406);
      expect(res.body.message).toBe("Increase the amount");
    });

    it("returns 400 when rangeBidValue is missing", async () => {
      const res = await request(app.getApp())
        .post("/api/v1/validate-transaction")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });

    it("returns 500 when rangeBidValue format is invalid", async () => {
      const res = await request(app.getApp())
        .post("/api/v1/validate-transaction")
        .send({ rangeBidValue: "invalid" });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe(true);
    });

    it("accepts optional currency and convert fields", async () => {
      nock(COINBASE_HOST)
        .get("/v2/exchange-rates?currency=BTC")
        .reply(200, {
          data: { currency: "BTC", rates: { USD: "65000" } },
        });

      const res = await request(app.getApp())
        .post("/api/v1/validate-transaction")
        .send({ rangeBidValue: "60000-70000", currency: "BTC", convert: "USD" });

      expect(res.status).toBe(202);
    });

    it("returns 500 when Coinbase is unreachable during validation", async () => {
      nock(COINBASE_HOST)
        .get("/v2/exchange-rates?currency=ETH")
        .replyWithError("timeout");

      const res = await request(app.getApp())
        .post("/api/v1/validate-transaction")
        .send({ rangeBidValue: "18000-21000" });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe(true);
    });
  });

  // ── GET /health ────────────────────────────────────────────────────────────

  describe("GET /health", () => {
    it("returns 200 with status ok", async () => {
      const res = await request(app.getApp()).get("/health");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(typeof res.body.uptime).toBe("number");
      expect(typeof res.body.version).toBe("string");
      expect(typeof res.body.timestamp).toBe("string");
    });
  });
});
