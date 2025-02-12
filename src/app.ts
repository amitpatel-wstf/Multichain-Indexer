import { startServer } from "./routes";
import { ConsumerServices } from "./utils/Kafka/ConsumerServices";
import { RedisServices } from "./utils/RedisServices/RedisServices";
import { QueueServices } from "./utils/QueueServices/QueueServices";
import mongoose from "mongoose";
import config from "./config";

mongoose.connect(config.mongoUrl).then(()=>console.log("MongoDB connected")).catch((err)=>console.log(err));
startServer();
QueueServices.startTradeQueue()
ConsumerServices.runConsumers();
RedisServices.connect();
