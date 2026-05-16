import * as dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import rateLimit from "express-rate-limit";

import TransactionRouter from "./routes/transaction-router";
import healthRouter from "./routes/health-router";
import { swaggerSpec } from "./swagger";

/** 60 requests per minute per IP */
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again after a minute.",
    error: true,
  },
});

export class App {
  private app: express.Application;
  private transactionRouter: TransactionRouter;

  constructor() {
    this.transactionRouter = new TransactionRouter();
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(limiter);
  }

  private setupRoutes() {
    this.app.use("/api/v1", this.transactionRouter.getRouter());
    this.app.use("/health", healthRouter);
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  /** Expose the internal Express app for testing (supertest). */
  getApp(): express.Application {
    return this.app;
  }

  startServer(port: number) {
    this.app.listen(port, () => {
      console.log(`App Running on http://localhost:${port} 🚀`);
      console.log(`Swagger Docs:  http://localhost:${port}/api-docs`);
      console.log(`Health Check:  http://localhost:${port}/health`);
    });
  }
}

const PORT = parseInt(process.env.PORT) || 3000;
const app = new App();

app.startServer(PORT);
