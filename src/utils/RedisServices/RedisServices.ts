import { createClient } from "redis";
import zlib from "zlib";

export class RedisServices{
    static tradeClient = createClient();
    static balanceClient = createClient();

    static async connect(){
        await this.tradeClient.connect();
        await this.balanceClient.connect();
    }

    static async updateLatestTradeInRedis(trades: any) {
        try {
            const compressedPreviousState = await this.tradeClient.get("latestTokenTrade") || "";
            const previousState = compressedPreviousState
                ? JSON.parse(this.decompressData(compressedPreviousState))
                : [];
            console.log("PreviousData===> 1", previousState?.length);
            const newData: any[] = [];
            trades.forEach((trade: any) => {
                const findTrade = previousState?.find((state: any) =>
                    trade?.MintAddress?.toLowerCase() === state?.SmartContract?.toLowerCase()
                );
                if (findTrade) {
                    newData.push(findTrade);
                } else {
                    newData.push(trade);
                }
            });
            const compressedData = this.compressData(JSON.stringify(newData)); // Compress data before saving
            await RedisServices.tradeClient.set("latestTokenTrade", compressedData);
        } catch (error) {
            console.log("Error updating data in Redis", error);
        }
    }

    static compressData(data: string): string {
        return zlib.deflateSync(data).toString("base64"); // Compress and encode to base64
    }
    
    static decompressData(data: string): string {
        const buffer = Buffer.from(data, "base64"); // Decode from base64
        return zlib.inflateSync(buffer).toString(); // Decompress to string
    }
}