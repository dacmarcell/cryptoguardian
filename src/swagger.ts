import * as swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CryptoGuardian API",
      version: "1.0.0",
      description:
        "API para consulta e validação de transações com Ethereum em BRL, utilizando dados em tempo real da Coinbase.",
      contact: {
        name: "CryptoGuardian",
      },
    },
    servers: [
      {
        url: "http://localhost:{port}/api/v1",
        description: "Servidor local",
        variables: {
          port: {
            default: process.env.PORT || "3001",
            description: "Porta configurada no .env",
          },
        },
      },
    ],
    tags: [
      {
        name: "Transaction",
        description: "Operações relacionadas a transações com ETH/BRL",
      },
    ],
    components: {
      schemas: {
        SuccessPrice: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "19854.23",
              description: "Preço atual do ETH em BRL",
            },
            error: {
              type: "boolean",
              example: false,
            },
          },
        },
        ValidateRequest: {
          type: "object",
          required: ["rangeBidValue"],
          properties: {
            rangeBidValue: {
              type: "string",
              example: "18000-21000",
              description:
                "Intervalo de valores em BRL no formato 'minValue-maxValue'",
            },
          },
        },
        ValidateSuccess: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Transaction Valid",
            },
            error: {
              type: "boolean",
              example: false,
            },
          },
        },
        ValidateRejected: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Increase the amount",
            },
            error: {
              type: "boolean",
              example: false,
            },
          },
        },
        ServerError: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Error on fetching data",
            },
            error: {
              type: "boolean",
              example: true,
            },
          },
        },
      },
    },
    paths: {
      "/transaction": {
        get: {
          tags: ["Transaction"],
          summary: "Obter preço atual do ETH em BRL",
          description:
            "Consulta a API da Coinbase e retorna o preço atual do Ethereum convertido para Real Brasileiro (BRL).",
          operationId: "getEthBrlPrice",
          responses: {
            "200": {
              description: "Preço retornado com sucesso",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessPrice" },
                  example: {
                    message: "19854.23",
                    error: false,
                  },
                },
              },
            },
            "500": {
              description: "Erro ao consultar a API da Coinbase",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ServerError" },
                },
              },
            },
          },
        },
      },
      "/validate-transaction": {
        post: {
          tags: ["Transaction"],
          summary: "Validar se o preço do ETH está dentro de um intervalo",
          description:
            "Recebe um intervalo de valores em BRL (ex: '18000-21000') e verifica se o preço atual do ETH está dentro desse range. Retorna 202 se válido ou 406 se o valor estiver fora do intervalo.",
          operationId: "validateTransaction",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidateRequest" },
                examples: {
                  withinRange: {
                    summary: "Intervalo que contém o preço atual",
                    value: { rangeBidValue: "15000-25000" },
                  },
                  belowRange: {
                    summary: "Intervalo abaixo do preço atual",
                    value: { rangeBidValue: "1000-5000" },
                  },
                },
              },
            },
          },
          responses: {
            "202": {
              description: "Transação válida — preço dentro do intervalo",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidateSuccess" },
                },
              },
            },
            "406": {
              description: "Transação inválida — preço fora do intervalo",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidateRejected" },
                },
              },
            },
            "500": {
              description: "Erro interno ao processar a validação",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ServerError" },
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
