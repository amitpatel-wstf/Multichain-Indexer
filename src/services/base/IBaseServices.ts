import { BaseChainService } from "./BaseService";

export interface IBaseChainServices {
  // Static properties
  ETH_TOKEN_ADDRESS: string;
  USDC_TOKEN_ADDRESS: string;
  ETHPriceInUSD: string;
  tokenInformatonObject: any;
  instance:any;

  constructor():void;

  // Static methods
  TradeConsumer(trades: any[], partition: number): Promise<void>;
  DataProcessing(trade: any): Promise<any>;
  fetchPriceInUSD(tokenAddress: string): Promise<number>;
}
