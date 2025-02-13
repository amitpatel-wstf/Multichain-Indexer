import { ErrorEventCallback, Job } from "bull";
import { QueueServices } from "../../utils/QueueServices/QueueServices";
import axios from "axios";
import { getUserBalanceModel } from "../../models";

export class SolanaServices {
    static SOL_TOKEN_ADDRESS = "So11111111111111111111111111111111111111112";
    static USDC_TOKEN_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    static solPriceInUSD:any=false;
    static tokenInformatonObject:any = {};

    static UserModel = getUserBalanceModel();

    static async TradeConsumer(trades: any[], partition: number) {
        try {
          const tempArr: any[] = [];
          const tempArr2: any[] = [];
          for (const trade of trades) {
            const processedTrade = await this.DataProcessing(trade?.Trade);
            if (processedTrade) {
              // delete processedTrade.EditionNonce;
              tempArr.push({
                updateOne: {
                  // @ts-ignore
                  filter: { MintAddress: processedTrade?.MintAddress },
                  update: { ...processedTrade },
                  upsert: true
                }
              })
              tempArr2.push({ ...processedTrade, updateAt: new Date().getTime() });
            }
      
          }
      
          if (tempArr.length > 0) {
            QueueServices.tradeQueue.add({ tempArr, tempArr2}).then((job:Job) => {
                // console.log(`Job added with ID: ${job.id}`);
              })
              .catch((err:ErrorEventCallback) => {
                console.error('Error adding job:', err);
              });;
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
            const sellAmount = trade.Sell.Amount / Math.pow(10, trade.Sell.Currency.Decimals);
            const buyAmount = trade.Buy.Amount / Math.pow(10, trade.Buy.Currency.Decimals);
            // Calculate token prices
            const buyTokenPrice = sellAmount / buyAmount;
            const sellTokenPrice = buyAmount / sellAmount;
      // fetching the native price if not found
            const solPrice = !this.solPriceInUSD ? await this.fetchPriceInUSD(this.SOL_TOKEN_ADDRESS) : this.solPriceInUSD;
            // console.log("Solana Price==>",solPriceInUSD);
            this.tokenInformatonObject[this.SOL_TOKEN_ADDRESS] = solPrice;
      
            let tokenPrice;
            // find out sol price if the trade happend with USDC
            // if(trade?.Sell?.Currency?.MintAddress===this.USDC_TOKEN_ADDRESS && trade?.Buy?.Currency?.MintAddress===this.SOL_TOKEN_ADDRESS){
            //   // console.log("Solana Price in Usd by Trade====>",buyTokenPrice);
            //   // solPriceInUSD = buyTokenPrice;
            //   this.updateNativePrice({...trade?.Buy?.Currency,priceInUSD:buyTokenPrice,priceInNative:1,solPriceInUSD:buyTokenPrice});
            // }
            // if(trade?.Buy?.Currency?.MintAddress===this.USDC_TOKEN_ADDRESS && trade?.Sell?.Currency?.MintAddress===this.SOL_TOKEN_ADDRESS){
            //   // console.log("Solana Price in Usd by Trade====>",sellTokenPrice);
            //   // solPriceInUSD = sellTokenPrice;
            //   this.updateNativePrice({...trade?.Sell?.Currency,priceInUSD:sellTokenPrice,priceInNative:1,solPriceInUSD:sellTokenPrice});
            // }
            // if token trade against with SOL
            if(trade?.Sell.Currency.MintAddress=== this.SOL_TOKEN_ADDRESS){
              tokenPrice = buyTokenPrice*solPrice;
              this.tokenInformatonObject[trade?.Buy?.Currency?.MintAddress] =  {priceInUSD:tokenPrice,priceInNative:buyTokenPrice,solPriceUSD:this.solPriceInUSD ,...trade?.Buy?.Currency};;
              const token =  this.tokenInformatonObject[trade?.Buy?.Currency?.MintAddress];
              if(token?.priceInUSD>0){
                  return token;
              }
            }else{
              if(trade?.Buy.Currency?.MintAddress===this.SOL_TOKEN_ADDRESS){
                tokenPrice = sellTokenPrice*solPrice;
                this.tokenInformatonObject[trade?.Sell?.Currency?.MintAddress] = {priceInUSD:tokenPrice,priceInNative:sellTokenPrice,solPriceUSD:this.solPriceInUSD,...trade?.Sell?.Currency};
                const token = this.tokenInformatonObject[trade?.Sell?.Currency?.MintAddress]
                if(token?.priceInUSD>0){
                  return token;
                }
              }else{
            // if token trade against with Non-Native Token
                let tokenPriceInUSD = this.tokenInformatonObject[trade?.Buy?.Currency?.MintAddress]?.priceInUSD;
                if(tokenPriceInUSD){
                  const tokenPrice = sellTokenPrice*tokenPriceInUSD;
                  this.tokenInformatonObject[trade?.Sell?.Currency?.MintAddress] = {priceInUSD:tokenPrice,priceInNative:tokenPrice/this.solPriceInUSD,solPriceUSD:this.solPriceInUSD,...trade?.Sell?.Currency};
                  const token = this.tokenInformatonObject[trade?.Sell?.Currency?.MintAddress];
                  if(token?.priceInUSD>0){
                      return token;
                  }
                }
                if(!tokenPriceInUSD){
                  tokenPriceInUSD = this.tokenInformatonObject[trade?.Sell?.Currency?.MintAddress]?.priceInUSD;
                }
                if(tokenPriceInUSD){
                  const tokenPrice = buyTokenPrice*tokenPriceInUSD;
                  this.tokenInformatonObject[trade?.Buy?.Currency?.MintAddress] = {priceInUSD:tokenPrice,priceInNative:tokenPrice/this.solPriceInUSD,solPriceUSD:this.solPriceInUSD,...trade?.Buy?.Currency};
                  const token =  this.tokenInformatonObject[trade?.Buy?.Currency?.MintAddress];
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

      // Fetch token price in USD
static async fetchPriceInUSD(mintAddress:string) {
    try {
      // const response = await axios.get(
      //   `https://solana-gateway.moralis.io/token/mainnet/${mintAddress}/price`,
      //   {
      //     headers: {
      //       'accept': 'application/json',
      //       'X-API-Key': process.env.MORALIS_API_KEY
      //     }
      //   }
      // );
      // console.log("response data===>",response?.data?.usdPrice);
      // solPriceInUSD = response?.data?.usdPrice;
      // return response?.data?.usdPrice;
      const response = await axios.get(`https://api.geckoterminal.com/api/v2/simple/networks/solana/token_price/${mintAddress}`)
      // console.log("Response==>",response?.data?.data?.attributes.token_prices);
      this.solPriceInUSD = Number(response?.data?.data?.attributes.token_prices[mintAddress]);
      return Number(response?.data?.data?.attributes.token_prices[mintAddress]);
    } catch (error) {
      console.error(`Error fetching price for ${mintAddress} in USD:`, error);
      return 210;
    }
  };

  // update user by address
  async updateUserByAddress(address:string, balances:any){
    try {
        await SolanaServices.UserModel.findOneAndUpdate({address : address},{address:address, balances : balances})
    } catch (error) {
        console.log("error while updating the user ",error);
    }
  }
}