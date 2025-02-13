import mongoose, { Schema, Document } from 'mongoose';

export interface ITokenBase extends Document {
  priceInUSD: number;
  priceInNative: number;
  ethPriceUSD: number;
  AssetId: string;
  Decimals: number;
  Delegated: boolean;
  DelegatedTo: string;
  Fungible: boolean;
  HasURI: boolean;
  Name: string;
  ProtocolName: string;
  SmartContract: string;
  Symbol: string;
  TotalSupply: number;
}

const TokenSchema: Schema = new Schema({
  priceInUSD: { type: Number }, // Removed required
  priceInNative: { type: Number }, // Removed required
  ethPriceUSD: { type: Number }, // Removed required
  AssetId: { type: String }, // Removed required
  Decimals: { type: Number }, // Removed required
  Delegated: { type: Boolean }, // Removed required
  DelegatedTo: { type: String }, // Removed required
  Fungible: { type: Boolean }, // Removed required
  HasURI: { type: Boolean }, // Removed required
  Name: { type: String }, // Removed required
  ProtocolName: { type: String }, // Removed required
  SmartContract: { type: String }, // Removed required
  Symbol: { type: String }, // Removed required
  TotalSupply: { type: Number }, // Removed required
},{timestamps:true});

TokenSchema.index({address:1});

const TokenSchema1: Schema = new Schema({
  priceInUSD: { type: Number }, // Removed required
  priceInNative: { type: Number }, // Removed required
  ethPriceUSD: { type: Number }, // Removed required
  AssetId: { type: String }, // Removed required
  Decimals: { type: Number }, // Removed required
  Delegated: { type: Boolean }, // Removed required
  DelegatedTo: { type: String }, // Removed required
  Fungible: { type: Boolean }, // Removed required
  HasURI: { type: Boolean }, // Removed required
  Name: { type: String }, // Removed required
  ProtocolName: { type: String }, // Removed required
  SmartContract: { type: String }, // Removed required
  Symbol: { type: String }, // Removed required
  TotalSupply: { type: Number }, // Removed required
},{timestamps:true});


export function getBaseTokenModel(chainName:string){
  // create index for address
  return mongoose.model<ITokenBase>(`${chainName}Token`, TokenSchema);
}

export function getBaseTokenTradeModel(chainName:string,time:string){
  return mongoose.model<ITokenBase>(`${chainName}TokenTrade${time}`, TokenSchema1);
}
