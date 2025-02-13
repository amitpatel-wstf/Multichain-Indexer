import config from "../config";
import { BaseBalanceServices } from "./base/BalanceServices";
import { BaseChainService } from "./base/BaseService";
import { BaseTokenService } from "./base/TokenServices";
import { SolanaUserServices } from "./base/UserServices";
import { SolanaBalanceServices } from "./solana/BalanceServices";
import { SolanaServices } from "./solana/SolanaService";
import { BaseUserServices } from "./solana/UserServices";

export function getBaseService() : any {
    switch (config.chainName?.toLowerCase()) {
        case "base":
            return BaseChainService;
        case "solana":
            return SolanaServices;
        default:
            return BaseChainService;
    }
}

export function getBalanceService(){
    switch (config.chainName?.toLowerCase()) {
        case "base":
            return BaseBalanceServices;
        case "solana":
            return SolanaBalanceServices;
        default:
            return BaseBalanceServices;
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

export function getUserBalanceService(){
    switch (config.chainName?.toLowerCase()) {
        case "base":
            return BaseBalanceServices;
        case "solana":
            return SolanaBalanceServices
        default:
            return BaseBalanceServices;
    }
}

export function getUserServices () : any {
    switch(config.chainName?.toLowerCase()){
        case "base" :
            return BaseUserServices;
        case "solana":
            return SolanaUserServices;
        default:
            return BaseUserServices;
    }
}