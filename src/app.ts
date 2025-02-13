import { startServer } from "./server";
import { ConsumerServices } from "./utils/Kafka/ConsumerServices";
import { RedisServices } from "./utils/RedisServices/RedisServices";
import { QueueServices } from "./utils/QueueServices/QueueServices";
import mongoose from "mongoose";
import config from "./config";
import { WebSocketServices } from "./utils/WebSocketServices/WebSockerServices";
import { CronJob } from "./utils/Cron-Job/CronJob";
import { getBalanceService } from "./services";

async function main(){
    await mongoose.connect(config.mongoUrl).then(()=>console.log("MongoDB connected")).catch((err)=>console.log(err));
    // START THE NODE JS SERVER
    startServer();
    // START THE TRADE QUEUE
    QueueServices.startTradeQueue()
    // RUN THE CONSUMERS
    ConsumerServices.runConsumers();
    // CONNECT TO REDIS
    RedisServices.connect();
    WebSocketServices.StartSocket();
    getBalanceService().Initialize();
    CronJob.start()
}

main(); 