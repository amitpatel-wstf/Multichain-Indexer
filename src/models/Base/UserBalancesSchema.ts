import mongoose from 'mongoose';
import config from '../../config';

const UserBalanceSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  balances: [{
    tokenAddress: { type: String, required: true },
    rawBalance : {},
    balance: { type: Number, required: true },
    decimals: { type: String },
    name: { type: String, required: true },
    symbol: { type: String, required: true }
  }]
},{timestamps:true});



UserBalanceSchema.index({address:1});

export const BaseUserBalance = mongoose.model(`${config.chainName}UserBalance`, UserBalanceSchema);