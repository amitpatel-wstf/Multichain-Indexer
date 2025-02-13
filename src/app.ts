import { startServer } from "./server";
import { ConsumerServices } from "./utils/Kafka/ConsumerServices";
import { RedisServices } from "./utils/RedisServices/RedisServices";
import { QueueServices } from "./utils/QueueServices/QueueServices";
import mongoose from "mongoose";
import config from "./config";
import { WebSocketServices } from "./utils/WebSocketServices/WebSockerServices";
import { CronJob } from "./utils/Cron-Job/CronJob";

mongoose.connect(config.mongoUrl).then(()=>console.log("MongoDB connected")).catch((err)=>console.log(err));
startServer();
QueueServices.startTradeQueue()
ConsumerServices.runConsumers();
RedisServices.connect();
WebSocketServices.StartSocket();
CronJob.start()
