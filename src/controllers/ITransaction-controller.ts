import { Request, Response } from "express";

export default interface ITransactionController {
  getPrice(request: Request, response: Response): Promise<any>;
  validateTransaction(request: Request, response: Response): Promise<any>;
}
