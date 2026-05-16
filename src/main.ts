import * as dotenv from "dotenv";
dotenv.config();

import * as cors from "cors";
import * as express from "express";
import * as swaggerUi from "swagger-ui-express";
import TransactionRouter from "./routes/transaction-router";
import { swaggerSpec } from "./swagger";

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
  }

  private setupRoutes() {
    this.app.use("/api/v1", this.transactionRouter.getRouter());
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  startServer(port: number) {
    this.app.listen(port, () => {
      console.log(`App Running on http://localhost:${port} 🚀`);
      console.log(`Swagger Docs:  http://localhost:${port}/api-docs`);
    });
  }
}

const PORT = parseInt(process.env.PORT) || 3000;
const app = new App();

app.startServer(PORT);
