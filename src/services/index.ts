import config from "../config";
import { BalanceServices } from "./base/BalanceServices";
import { BaseChainService } from "./base/BaseChainService";

export function getBaseService() {
    switch (config.chainName?.toLowerCase()) {
        case "base":
            return BaseChainService;
        case "solana":
            return BaseChainService;
        default:
            return BaseChainService;
    }
}

export function getBalanceService(){
    switch (config.chainName?.toLowerCase()) {
        case "base":
            return BalanceServices;
        case "solana":
            return BalanceServices;
        default:
            return BalanceServices;
    }
}