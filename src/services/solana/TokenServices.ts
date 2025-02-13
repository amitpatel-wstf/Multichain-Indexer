import { getTokenModel } from "../../models";

export class SolanaTokenService {

    static async getAllTokens(offset: number, limit: number){
        return await getTokenModel().find({}).skip(offset).limit(limit);
    }

    static async getTokenByAddress(tokenAddress: string){
        // apply regex to the address
        return await getTokenModel().findOne({MintAddress: {$regex: tokenAddress, $options: "i"}});
    }
}