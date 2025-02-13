import { getTokenModel } from "../../models";

export class BaseTokenService{
    static async getAllTokens(offset: number, limit: number){
        return await getTokenModel().find({}).skip(offset).limit(limit);
    }

    static async getTokenByAddress(tokenAddress: string){
        // apply regex to the address
        return await getTokenModel().findOne({SmartContract: {$regex: tokenAddress, $options: "i"}});
    }
}