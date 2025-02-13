import { getUserBalanceModel } from "../../models";

export class BaseUserServices {
    static UserModel = getUserBalanceModel();
    // get all users
    static async getAllUsers(){
        return await this.UserModel.find({});
    }

    // get user by address
    static async getUserByAddress(address: string){
        return await this.UserModel.findOne({address: address});
    }

}