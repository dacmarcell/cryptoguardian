import { Router, json } from "express";

import { TransactionController } from "../controllers/transaction-controller";
import ITransactionRouter from "./ITransaction-router";

class TransactionRouter implements ITransactionRouter {
  private transactionController: TransactionController;

  constructor() {
    this.transactionController = new TransactionController();
  }

  public getRouter() {
    const transactionRouter = Router();
    transactionRouter.use(json());

    // GET /api/v1/price?currency=ETH&convert=BRL
    transactionRouter.get("/price", this.transactionController.getPrice);

    // POST /api/v1/validate-transaction
    transactionRouter.post(
      "/validate-transaction",
      this.transactionController.validateTransaction
    );

    return transactionRouter;
  }
}

export default TransactionRouter;
