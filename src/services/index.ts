import config from "../config";
import { BalanceServices } from "./base/BalanceServices";
import { BaseChainService } from "./base/BaseChainService";
import { BaseTokenService } from "./base/TokenServices";

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

export function getTokenService(){
    switch (config.chainName?.toLowerCase()) {
        case "base":
            return BaseTokenService;
        default:
            return BaseTokenService;
    }
}