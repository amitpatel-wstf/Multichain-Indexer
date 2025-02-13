import mongoose, { Schema, Document } from 'mongoose';
import config from '../../config';

export interface ISolanaUserBalance extends Document {
  address: string;
  balances: {
    mintAddress: string;
    rawBalance: number;
    balance: number;
    decimals: number;
    name: string;
    symbol: string;
  }[];
}

const UserBalanceSchema = new Schema<ISolanaUserBalance>({
  address: { type: String, required: true, unique: true },
  balances: [{
    mintAddress: { type: String, required: true },
    rawBalance: { type : Number, required : true },
    balance: { type: Number, required: true },
    decimals: { type: Number, required: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true }
  }],
},{timestamps:true});

// Check if the model has already been compiled.
export const SolanaUserBalance = mongoose.models.solanaUserBalance || mongoose.model<ISolanaUserBalance>(`${config.chainName}UserBalance`, UserBalanceSchema);