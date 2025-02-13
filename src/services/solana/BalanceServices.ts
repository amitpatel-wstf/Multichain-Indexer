import { getTokenModel, getUserBalanceModel } from "../../models";
import { RedisServices } from "../../utils/RedisServices/RedisServices";

export class SolanaBalanceServices {

    static Hash = new Map<string, any>();
    static SOL_USER_MODEL = getTokenModel();
    static USER_BALANCE_MODEL = getUserBalanceModel();
    static SOL_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

    static isProcessing = false;

    static async Initialize(){
        try {
            const allUsers = await this.SOL_USER_MODEL.find({});
            console.log("All Users ===>",allUsers?.length);
            for(const user of allUsers){
                this.Hash.set(user?.address?.toLowerCase(),{address:user?.address,balances:user?.balances});
            }
            RedisServices.balanceClient.set('AllUsers', JSON.stringify(this.Hash));

        } catch (error) {
            console.log("Error in Initialize:", error);
        }
    }

    static StartProcessingBalanceUpdates(trades:any){
        console.log("trades==>",trades?.length);
    }
}