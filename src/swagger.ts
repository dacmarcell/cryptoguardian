import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CryptoGuardian API",
      version: "1.0.0",
      description:
        "API para consulta e validação de transações com criptomoedas (ETH, BTC, SOL, BNB…) em qualquer moeda fiat ou crypto suportada pela Coinbase.\n\n**Cache:** preços são cacheados por 30 segundos.\n**Rate limit:** 60 requests/minuto por IP.",
    },
    servers: [
      {
        url: "http://localhost:{port}",
        description: "Servidor local",
        variables: {
          port: {
            default: process.env.PORT || "3001",
          },
        },
      },
    ],
    tags: [
      {
        name: "Price",
        description: "Consulta de preços em tempo real",
      },
      {
        name: "Transaction",
        description: "Validação de faixas de preço",
      },
      {
        name: "Health",
        description: "Status e disponibilidade da API",
      },
    ],
    components: {
      schemas: {
        PriceResponse: {
          type: "object",
          properties: {
            currency: { type: "string", example: "ETH" },
            convert: { type: "string", example: "BRL" },
            price: { type: "string", example: "19854.23" },
            error: { type: "boolean", example: false },
          },
        },
        ValidateRequest: {
          type: "object",
          required: ["rangeBidValue"],
          properties: {
            rangeBidValue: {
              type: "string",
              example: "18000-21000",
              description: "Intervalo no formato 'minValue-maxValue'",
            },
            currency: {
              type: "string",
              example: "ETH",
              description: "Ticker da criptomoeda (default: ETH)",
            },
            convert: {
              type: "string",
              example: "BRL",
              description: "Moeda de conversão (default: BRL)",
            },
          },
        },
        ValidateSuccess: {
          type: "object",
          properties: {
            message: { type: "string", example: "Transaction Valid" },
            error: { type: "boolean", example: false },
          },
        },
        ValidateRejected: {
          type: "object",
          properties: {
            message: { type: "string", example: "Increase the amount" },
            error: { type: "boolean", example: false },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            version: { type: "string", example: "1.0.0" },
            uptime: { type: "number", example: 3600 },
            timestamp: { type: "string", example: "2025-05-16T07:00:00.000Z" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Error on fetching data" },
            error: { type: "boolean", example: true },
          },
        },
      },
    },
    paths: {
      "/api/v1/price": {
        get: {
          tags: ["Price"],
          summary: "Preço atual de uma criptomoeda",
          description:
            "Retorna o preço atual de qualquer criptomoeda suportada pela Coinbase convertido para a moeda desejada. **Resultado cacheado por 30s.**",
          operationId: "getPrice",
          parameters: [
            {
              in: "query",
              name: "currency",
              schema: { type: "string", default: "ETH" },
              description: "Ticker da criptomoeda (ETH, BTC, SOL, BNB…)",
              examples: {
                ethereum: { summary: "Ethereum", value: "ETH" },
                bitcoin: { summary: "Bitcoin", value: "BTC" },
                solana: { summary: "Solana", value: "SOL" },
              },
            },
            {
              in: "query",
              name: "convert",
              schema: { type: "string", default: "BRL" },
              description: "Moeda de destino (BRL, USD, EUR, USDT…)",
              examples: {
                brl: { summary: "Real Brasileiro", value: "BRL" },
                usd: { summary: "Dólar Americano", value: "USD" },
              },
            },
          ],
          responses: {
            "200": {
              description: "Preço retornado com sucesso",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PriceResponse" },
                },
              },
            },
            "429": {
              description: "Rate limit excedido (60 req/min)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "500": {
              description: "Erro ao consultar a Coinbase ou par não encontrado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/v1/validate-transaction": {
        post: {
          tags: ["Transaction"],
          summary: "Validar se o preço está dentro de um intervalo",
          operationId: "validateTransaction",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidateRequest" },
                examples: {
                  eth_brl: {
                    summary: "ETH em BRL (padrão)",
                    value: { rangeBidValue: "18000-21000" },
                  },
                  btc_usd: {
                    summary: "BTC em USD",
                    value: {
                      rangeBidValue: "60000-70000",
                      currency: "BTC",
                      convert: "USD",
                    },
                  },
                  out_of_range: {
                    summary: "Fora do intervalo",
                    value: { rangeBidValue: "1000-5000" },
                  },
                },
              },
            },
          },
          responses: {
            "202": {
              description: "Transação válida",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidateSuccess" },
                },
              },
            },
            "400": {
              description: "rangeBidValue ausente no body",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "406": {
              description: "Preço fora do intervalo informado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidateRejected" },
                },
              },
            },
            "500": {
              description: "Erro interno",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Verificação de disponibilidade da API",
          operationId: "healthCheck",
          responses: {
            "200": {
              description: "API online",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthResponse" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
