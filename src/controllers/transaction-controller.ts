import { Request, Response } from "express";
import { TransactionService } from "../services/transaction-service";
import ITransactionController from "./ITransaction-controller";

export class TransactionController implements ITransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  /**
   * GET /api/v1/price?currency=ETH&convert=BRL
   * Query params (all optional, defaults to ETH and BRL):
   *   currency – the crypto ticker (ETH, BTC, SOL, BNB, …)
   *   convert  – the fiat or crypto to convert to (BRL, USD, EUR, …)
   */
  getPrice = async (request: Request, response: Response): Promise<any> => {
    try {
      const currency = (request.query.currency as string) || "ETH";
      const convert = (request.query.convert as string) || "BRL";

      const price = await this.transactionService.getPrice(currency, convert);

      return response.status(200).json({
        currency: currency.toUpperCase(),
        convert: convert.toUpperCase(),
        price: price.toFixed(2),
        error: false,
      });
    } catch (error) {
      return response.status(500).json({ message: String(error), error: true });
    }
  };

  /**
   * POST /api/v1/validate-transaction
   * Body:
   *   rangeBidValue – "minValue-maxValue" string (required)
   *   currency      – crypto ticker (optional, default "ETH")
   *   convert       – fiat/crypto to convert to (optional, default "BRL")
   */
  validateTransaction = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const { rangeBidValue, currency = "ETH", convert = "BRL" } = request.body;

      if (!rangeBidValue) {
        return response
          .status(400)
          .json({ message: "rangeBidValue is required", error: true });
      }

      const isTransactionValid =
        await this.transactionService.validateTransaction(
          rangeBidValue,
          currency,
          convert
        );

      if (isTransactionValid) {
        return response
          .status(202)
          .json({ message: "Transaction Valid", error: false });
      } else {
        return response
          .status(406)
          .json({ message: "Increase the amount", error: false });
      }
    } catch (error) {
      return response.status(500).json({ message: String(error), error: true });
    }
  };
}
