import WebSocket from "ws";
import { getBalanceUpdateQuery } from "../Query/Query";
import config from "../../config";
import { getBalanceService } from "../../services";

export class WebSocketServices{

    static ws: any = this.initializeWebSocket();

    static initializeWebSocket(){
        return new WebSocket("https://streaming.bitquery.io/graphql", ["graphql-ws"], {
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": process.env.BIT_QUERY_API_KEY, //process.env.BITQUERY_API_KEY,
            },
            // followRedirects: true,
            // maxRedirects:100,
            // maxPayload:500000000
        });
    }

    static StartSocket() {
        this.ws = this.initializeWebSocket();
        console.log("Start Working....");
        try {
            this.ws.on("open", () => {
                console.log("Balance WebSocket connected");
                const initMessage = JSON.stringify({ type: "connection_init" });
                this.ws.send(initMessage);
            });

            this.ws.on("message", (data: any) => {
                const response = JSON.parse(data);
                if (response.type === "connection_ack") {
                    console.log("Connection acknowledged by server.");
                    this.SubscribeToBalanceUpdate();

                } else if (response.type === "data") {
                    const parsedData = JSON.parse(data.toString()).payload;
                    // console.log("Parsed Data ==>" ,parsedData.data);
                    if (parsedData?.data?.EVM) {
                        const balanceUpdates = parsedData.data.EVM.BalanceUpdates;
                        console.log("balanceUpdates==>",balanceUpdates?.length);
                        getBalanceService().StartProcessingBalanceUpdates(balanceUpdates);
                    }else if(parsedData?.data?.Solana){
                        const balanceUpdates = parsedData.data.Solana.BalanceUpdates;
                        console.log("balanceUpdates==>",balanceUpdates?.length);
                        getBalanceService().StartProcessingBalanceUpdates(balanceUpdates);
                    }
                    // Handle keep-alive messages (ka)
                } else if (response.type === "ka") {
                    console.log("Keep-alive message received.");
                    // No action required; just acknowledgment that the connection is alive.
                } else if (response.type === "error") {
                    console.error("Error message received:", response.payload.errors, response);
                } else {
                    console.warn("Unknown message type received:", response.type); // Added handling for unknown types
                }
            });

            this.ws.on("close", () => {
                console.log("Balance WebSocket disconnected");
                this.StartSocket();
            });

            this.ws.on("error", (error: any) => {
                console.error("Balance WebSocket error:", error);
                this.StartSocket();
            });

        } catch (error) {
            console.error("Error processing WebSocket message:", error);
            // this.StartSocket();
        }

    }

    static SubscribeToBalanceUpdate(){
        if(this.ws.readyState === WebSocket.OPEN){
            this.ws.send(JSON.stringify({
                type: "start",
                id: "balance update trade",
                payload: {
                    query: getBalanceUpdateQuery(config.chainName)
                }
            }))
            console.log("Subscribe to Balance Update Trade");
        }
    }
}