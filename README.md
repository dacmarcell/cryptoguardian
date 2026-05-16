# 🤖 Crypto Guardian API 🤖

Crypto Guardian is a robust, high-performance validation API designed for scenarios where users need to ascertain the optimal timing for purchasing cryptocurrencies. Users input their desired financial range, and the API verifies in real-time whether the current market price falls within that suitable range.

Initially conceived for Ethereum (ETH), the platform has evolved into a comprehensive **Multi-Currency** engine, capable of validating transactions for any cryptocurrency and fiat pairing supported by Coinbase.

## 🚀 Product Vision & Capabilities

The goal of Crypto Guardian is to empower financial applications, trading bots, and investment platforms with a reliable decision-making tool. By acting as a safeguard, it ensures that transactions only occur when market conditions meet the user's strict financial criteria.

**Key Features:**
- **Real-Time Validation:** Cross-references user-defined ranges with live market data.
- **Global Currency Support:** Validate pairs like ETH/BRL, BTC/USD, SOL/EUR, and more.
- **Interactive Documentation:** Fully documented with Swagger UI for easy integration and exploration.

## ⚙️ Technical Highlights

Under the hood, Crypto Guardian is built with **Node.js, Express, and TypeScript**, adhering to a clean architecture (Router → Controller → Service) that ensures scalability and maintainability.

Recent architectural improvements include:

*   🌍 **Dynamic Multi-Currency Engine:** Replaced hardcoded currency pairs with dynamic resolution via the Coinbase API, supporting custom `currency` and `convert` parameters.
*   ⚡ **In-Memory Caching (TTL):** Implemented a singleton caching layer using `node-cache` with a 30-second TTL. This drastically reduces external API calls, minimizes latency to ~1ms for cached hits, and prevents rate-limit penalties from third-party providers.
*   🛡️ **Rate Limiting:** Integrated `express-rate-limit` to protect the API against abuse and DDoS attacks, restricting traffic to 60 requests per minute per IP.
*   🏥 **Health Probes:** Added a dedicated `/health` endpoint exposing uptime, versioning, and status metrics—essential for Kubernetes, Docker, or any modern orchestration deployment.
*   🧪 **Comprehensive Testing:** High test coverage using Jest, Supertest, and Nock to mock external HTTP calls, ensuring isolated, reliable, and fast CI/CD pipelines.

---

## 📖 API Documentation

The complete, interactive API documentation is available via Swagger UI. Once the server is running, navigate to:
**`http://localhost:3001/api-docs`**

### Core Endpoints

#### 1. Get Current Price
Returns the current market price for a specified cryptocurrency and fiat/crypto conversion.

```http
GET /api/v1/price?currency=ETH&convert=BRL
```

| Query Param | Type     | Default | Description                                      |
| :---------- | :------- | :------ | :----------------------------------------------- |
| `currency`  | `string` | `ETH`   | The cryptocurrency ticker (e.g., BTC, SOL, BNB). |
| `convert`   | `string` | `BRL`   | The target currency to convert to (e.g., USD).   |

#### 2. Validate a Transaction
Validates if the current price falls within a user-defined financial range.

```http
POST /api/v1/validate-transaction
```

**Body:**
```json
{
  "rangeBidValue": "18000-21000",
  "currency": "ETH",
  "convert": "BRL"
}
```

| Param           | Type     | Required | Description                                                                 |
| :-------------- | :------- | :------- | :-------------------------------------------------------------------------- |
| `rangeBidValue` | `string` | **Yes**  | The financial range offered for the operation (format: `minValue-maxValue`).|
| `currency`      | `string` | No       | The cryptocurrency ticker (defaults to ETH).                                |
| `convert`       | `string` | No       | The target currency to convert to (defaults to BRL).                        |

#### 3. Health Check
Liveness probe for monitoring systems.

```http
GET /health
```

## 🛠️ Installation & Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(Ensure `PORT` is set, e.g., 3001)*

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```

## 👨‍💻 Author

- [@marcelldac](https://www.github.com/marcelldac)
