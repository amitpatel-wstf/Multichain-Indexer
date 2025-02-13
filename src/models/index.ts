import { Model } from "mongoose";
import config from "../config";
import { getBaseTokenModel, getBaseTokenTradeModel, ITokenBase } from "./Base/TokenSchema";
import { BaseUserBalance } from "./Base/UserBalancesSchema";
import { getSolanaTokenModel, getSolanaTokenTradeModel, ITokenSolana } from "./Solana/TokenSchema";
import { SolanaUserBalance } from "./Solana/UserBalanceSchema";

export function getTokenModel() : Model<ITokenBase | ITokenSolana | any>{
    switch(config.chainName?.toLowerCase()){
        case "base":
            return getBaseTokenModel("base");
        case "solana":
            return getSolanaTokenModel("solana");
        default:
            return getBaseTokenModel("base");
    }
}

export function getTokenTradeModel(time:string) : Model<ITokenBase | ITokenSolana | any>{
    switch(config.chainName?.toLowerCase()){
        case "base":
            return getBaseTokenTradeModel("base",time);
        case "solana":
            return getSolanaTokenTradeModel("solana",time);
        default:
            return getBaseTokenTradeModel("base",time);
    }
}

export function getUserBalanceModel() : Model<any>{
    switch(config.chainName?.toLowerCase()){
        case "base":
            return BaseUserBalance;
        case "solana":
            return SolanaUserBalance;
        default:
            return BaseUserBalance;
    }
}