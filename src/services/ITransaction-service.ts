export default interface ITransactionService {
  getPrice(currency: string, convert: string): Promise<number>;
  validateTransaction(
    rangeBidValue: string,
    currency: string,
    convert: string
  ): Promise<boolean>;
  separateBidValues(rangeBidValue: string): ISeparateBidValues;
  isTransactionValid(
    minValue: number,
    maxValue: number,
    currentPrice: number
  ): boolean;
}

export interface ISeparateBidValues {
  minValue: number;
  maxValue: number;
}
