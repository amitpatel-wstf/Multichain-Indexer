import axios from "axios";
import { ErrorEventCallback, Job } from "bull";
import { QueueServices } from "../../utils/QueueServices/QueueServices";

export class BaseChainService {

    static ETH_TOKEN_ADDRESS = "0x4200000000000000000000000000000000000006";
    static USDC_TOKEN_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    static ETHPriceInUSD:any=false;
    static tokenInformatonObject:any = {};
    static instance:BaseChainService;

    private constructor(){}

    static getInstance(){
        if(!BaseChainService.instance){
            BaseChainService.instance = new BaseChainService();
        }
        return BaseChainService.instance;
    }

    static async TradeConsumer(trades: any[], partition: number) {
        console.log("trades==>",trades?.length);
        try {
          const tempArr: any[] = [];
          const tempArr2: any[] = [];
          for (const trade of trades) {
            const processedTrade = await this.DataProcessing(trade?.Trade);
            // console.log("Processed Data===>",processedTrade);
            // process.exit(0);
            if (processedTrade) {
              // delete processedTrade.EditionNonce;
              tempArr.push({
                updateOne: {
                  // @ts-ignore
                  filter: { SmartContract: processedTrade?.SmartContract },
                  update: { ...processedTrade },
                  upsert: true
                }
              })
              tempArr2.push({ ...processedTrade, updateAt: new Date().getTime() });
            }
      
          }
          if (tempArr.length > 0) {
            QueueServices.tradeQueue.add({ tempArr, tempArr2 })
              .then((job:Job) => {
                // console.log(`Job added with ID: ${job.id}`);
              })
              .catch((err:ErrorEventCallback) => {
                console.error('Error adding job:', err);
              });
          }
        } catch (err) {
          console.error("Error parsing message or processing data:", err);
          process.exit(1);
      
        }
    }

    static async DataProcessing(trade:any){
        if (trade?.Sell && trade?.Buy) {
          try {
            // Normalize amounts
            const Sell_TRADE = trade.Sell?.Assets[0];
            const Buy_TRADE = trade.Buy?.Assets[0];
      
            const sellAmount = Sell_TRADE?.Amount / Math.pow(10, Sell_TRADE?.Currency.Decimals);
            const buyAmount = Buy_TRADE.Amount / Math.pow(10, Buy_TRADE?.Currency.Decimals);
            // Calculate token prices
            const buyTokenPrice = sellAmount / buyAmount;
            const sellTokenPrice = buyAmount / sellAmount;
      // fetching the native price if not found
            const ethPrice = !this.ETHPriceInUSD ? await this.fetchPriceInUSD(this.ETH_TOKEN_ADDRESS) : this.ETHPriceInUSD;
            // console.log("Solana Price==>",solPriceInUSD);
            this.tokenInformatonObject[this.ETH_TOKEN_ADDRESS] = ethPrice;
      
            let tokenPrice;
            // find out sol price if the trade happend with USDC
            // if(Sell_TRADE.Currency?.SmartContract===USDC_TOKEN_ADDRESS && Buy_TRADE?.Currency?.SmartContract===ETH_TOKEN_ADDRESS){
            //   // console.log("Solana Price in Usd by Trade====>",buyTokenPrice);
            //   ETHPriceInUSD = buyTokenPrice;
            //   updateNativePrice({...Buy_TRADE?.Currency,priceInUSD:buyTokenPrice,priceInNative:1,ethPriceInUSD:buyTokenPrice});
            // }
            // if(Buy_TRADE.Currency?.SmartContract===USDC_TOKEN_ADDRESS && Sell_TRADE?.Currency?.SmartContract===ETH_TOKEN_ADDRESS){
            //   // console.log("Solana Price in Usd by Trade====>",sellTokenPrice);
            //   ETHPriceInUSD = sellTokenPrice;
            //   updateNativePrice({...Sell_TRADE?.Currency,priceInUSD:sellTokenPrice,priceInNative:1,ethPriceInUSD:sellTokenPrice});
            // }
            // if token trade against with SOL
            if(Sell_TRADE?.Currency.SmartContract=== this.ETH_TOKEN_ADDRESS){
              tokenPrice = buyTokenPrice*this.ETHPriceInUSD;
              this.tokenInformatonObject[Buy_TRADE?.Currency?.SmartContract] =  {priceInUSD:tokenPrice,priceInNative:buyTokenPrice,ethPriceUSD:this.ETHPriceInUSD ,...Buy_TRADE?.Currency};;
              const token =  this.tokenInformatonObject[Buy_TRADE?.Currency?.SmartContract];
              if(token?.priceInUSD>0){
                  return token;
              }
            }else{
              if(Buy_TRADE?.Currency?.SmartContract===this.ETH_TOKEN_ADDRESS){
                tokenPrice = sellTokenPrice*ethPrice;
                this.tokenInformatonObject[Sell_TRADE?.Currency?.SmartContract] = {priceInUSD:tokenPrice,priceInNative:sellTokenPrice,ethPriceUSD:this.ETHPriceInUSD,...Sell_TRADE?.Currency};
                const token = this.tokenInformatonObject[Sell_TRADE?.Currency?.SmartContract]
                if(token?.priceInUSD>0){
                  return token;
                }
              }else{
            // if token trade against with Non-Native Token
                let tokenPriceInUSD = this.tokenInformatonObject[Buy_TRADE?.Currency?.SmartContract]?.priceInUSD;
                if(tokenPriceInUSD){
                  const tokenPrice = sellTokenPrice*tokenPriceInUSD;
                  this.tokenInformatonObject[Sell_TRADE?.Currency?.SmartContract] = {priceInUSD:tokenPrice,priceInNative:tokenPrice/this.ETHPriceInUSD,ethPriceUSD:this.ETHPriceInUSD,...Sell_TRADE?.Currency};
                  const token = this.tokenInformatonObject[Sell_TRADE?.Currency?.SmartContract];
                  if(token?.priceInUSD>0){
                      return token;
                  }
                }
                if(!tokenPriceInUSD){
                  tokenPriceInUSD = this.tokenInformatonObject[Sell_TRADE?.Currency?.SmartContract]?.priceInUSD;
                }
                if(tokenPriceInUSD){
                  const tokenPrice = buyTokenPrice*tokenPriceInUSD;
                  this.tokenInformatonObject[Buy_TRADE?.Currency?.SmartContract] = {priceInUSD:tokenPrice,priceInNative:tokenPrice/this.ETHPriceInUSD,ethPriceUSD:this.ETHPriceInUSD,...Buy_TRADE?.Currency};
                  const token =  this.tokenInformatonObject[Buy_TRADE?.Currency?.SmartContract];
                  if(token?.priceInUSD>0){
                      return token;
                  }
                }
                
              }
            }
            return false;
            
          } catch (error) {
            console.error("Error processing trade data:", error);
            return false;
          }
        } else {
            console.warn("Incomplete trade data received:", trade);
            return false;
        }
      }
      
    static fetchPriceInUSD = async (tokenAddress:string) => {
      try {
          const url = `https://api.geckoterminal.com/api/v2/simple/networks/base/token_price/${tokenAddress}`
          const response = await axios.get(url);
          console.log(response?.data?.data?.attributes?.token_prices[tokenAddress]);
          this.ETHPriceInUSD = response?.data?.data?.attributes?.token_prices[tokenAddress];
          return response?.data?.data?.attributes?.token_prices[tokenAddress];
      } catch (error) {
        console.error(`Error fetching price for ${tokenAddress} in USD:`, error);
        return 0;
      }
    };

    // update user by address
    async updateUserByAddress(address:string, balances:any){
      console.log("address==>",address);
      console.log("balances==>",balances);
    }

}