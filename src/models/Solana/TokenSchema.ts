// src/models/TokenSchema.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITokenSolana extends Document {
  priceInUSD: number;
  priceInNative: number;
  solPriceUSD: number;
  CollectionAddress: string;
  Decimals: number;
  EditionNonce: number | null;
  Fungible: boolean;
  IsMutable: boolean;
  Key: string;
  MetadataAddress: string;
  MintAddress: string;
  Name: string;
  Native: boolean;
  PrimarySaleHappened: boolean;
  ProgramAddress: string;
  SellerFeeBasisPoints: number;
  Symbol: string;
  TokenCreators: any; // Adjust type as necessary
  TokenStandard: string;
  UpdateAuthority: string;
  Uri: string;
  VerifiedCollection: boolean;
  Wrapped: boolean;
}

const TokenSchema: Schema = new Schema({
  priceInUSD: { type: Number, required: true },
  priceInNative: { type: Number, required: true },
  solPriceUSD: { type: Number, required: true },
  CollectionAddress: { type: String, required: true },
  Decimals: { type: Number, required: true },
  Fungible: { type: Boolean, required: true },
  IsMutable: { type: Boolean, required: true },
  Key: { type: String, required: true },
  MetadataAddress: { type: String, required: true },
  MintAddress: { type: String, required: true },
  Name: { type: String, required: true },
  Native: { type: Boolean, required: true },
  PrimarySaleHappened: { type: Boolean, required: true },
  ProgramAddress: { type: String, required: true },
  SellerFeeBasisPoints: { type: Number, required: true },
  Symbol: { type: String, required: true },
  TokenCreators: { type: Schema.Types.Mixed }, // Adjust type as necessary
  TokenStandard: { type: String, required: true },
  UpdateAuthority: { type: String, required: true },
  Uri: { type: String, required: true },
  VerifiedCollection: { type: Boolean, required: true },
  Wrapped: { type: Boolean, required: true },
},{timestamps:true});


export function getTokenModel(chainName:string){
  return mongoose.model<ITokenSolana>(`${chainName}Token`, TokenSchema);
}

const TokenTradeSchema: Schema = new Schema({
    priceInUSD: { type: Number },
    priceInNative: { type: Number },
    solPriceUSD: { type: Number },
    CollectionAddress: { type: String },
    Decimals: { type: Number },
    Fungible: { type: Boolean },
    IsMutable: { type: Boolean },
    Key: { type: String },
    MetadataAddress: { type: String },
    MintAddress: { type: String },
    Name: { type: String  },
    Native: { type: Boolean },
    PrimarySaleHappened: { type: Boolean },
    ProgramAddress: { type: String },
    SellerFeeBasisPoints: { type: Number  },
    Symbol: { type: String },
    TokenCreators: { }, // Adjust type as necessary
    TokenStandard: { type: String },
    UpdateAuthority: { type: String },
    Uri: { type: String },
    VerifiedCollection: { type: Boolean },
    Wrapped: { type: Boolean },
  },{timestamps:true});



export function getSolanaTokenModel(chainName:string){
// create index for address
return mongoose.model<ITokenSolana>(`${chainName}Token`, TokenSchema);
}

export function getSolanaTokenTradeModel(chainName:string,time:string){
return mongoose.model<ITokenSolana>(`${chainName}TokenTrade${time}`, TokenTradeSchema);
}
  