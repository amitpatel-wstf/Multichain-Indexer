import mongoose from 'mongoose';
import config from '../../config';

const UserBalanceSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  balances: [{
    mintAddress: { type: String, required: true },
    rawBalance: { type : Number, required : true },
    balance: { type: Number, required: true },
    decimals: { type: Number, required: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true }
  }]
},{timestamps:true});

// UserBalanceSchema.index({address:1});

export const UserBalance = mongoose.model(`${config.chainName}UserBalance`, UserBalanceSchema);