import config from "../config";
import { getBaseTokenModel, getBaseTokenTradeModel } from "./Base/TokenSchema";
import { UserBalance } from "./Base/UserBalancesSchema";

export function getTokenModel(){
    switch(config.chainName?.toLowerCase()){
        case "base":
            return getBaseTokenModel("base");
        // case "solana":
        default:
            return getBaseTokenModel("base");
    }
}

export function getTokenTradeModel(time:string){
    switch(config.chainName?.toLowerCase()){
        case "base":
            return getBaseTokenTradeModel("base",time);
        // case "solana":
        default:
            return getBaseTokenTradeModel("base",time);
    }
}

export function getUserBalanceModel(){
    switch(config.chainName?.toLowerCase()){
        case "base":
            return UserBalance;
        // case "solana":
        default:
            return UserBalance;
    }
}