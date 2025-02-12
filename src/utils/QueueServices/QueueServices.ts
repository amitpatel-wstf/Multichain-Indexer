import Queue from 'bull'
import { RedisServices } from '../RedisServices/RedisServices';
import { getTokenModel } from '../../models';

export class QueueServices {
    static redisConfig = {
        host: '127.0.0.1', // Redis host
        port: 6379,        // Redis port
    };

    static tradeQueue = new Queue('tradeQueue', { redis: this.redisConfig });
    static tokenModel = getTokenModel();

    static startsQueues(){
        if(!this.tradeQueue){
            this.tradeQueue = new Queue('tradeQueue', { redis: this.redisConfig });
        }
        console.log("tradeQueue==>", this.tradeQueue);
        QueueServices.StartQueueProcessing(this.tradeQueue);
    }

    static startTradeQueue(){
        if(!this.tradeQueue){
            this.tradeQueue = new Queue('tradeQueue', { redis: this.redisConfig });
        }
        this.tradeQueue.process(async (job: any) => {
            // console.log(`Processing job with ID: ${job.id}`);
            return await this.processJob(job);
        });
        this.tradeQueue.on('completed', (job: any, result: any  ) => {
            // console.log(`Job ${job.id} completed with result:`, result);
        });
        this.tradeQueue.on('failed', (job: any, err: any) => {
            console.error(`Job ${job.id} failed with error:`, err.message);
        });
    }

    static StartQueueProcessing(queue: any){
        queue.process(async (job: any) => {
            // console.log(`Processing job with ID: ${job.id}`);
            return await this.processJob(job);
        });
        queue.tradeQueue.on('completed', (job: any, result: any  ) => {
            // console.log(`Job ${job.id} completed with result:`, result);
        });
        queue.tradeQueue.on('failed', (job: any, err: any) => {
            console.error(`Job ${job.id} failed with error:`, err.message);
        });
    }

    static async processJob(job: any){
        try {
            const { tempArr, tempArr2 } = job.data;
            // console.log("BulkArray==>", tempArr?.length);
            // Execute your functions
            // broadcast(tempArr2);
            await RedisServices.updateLatestTradeInRedis(tempArr2);
            // updateTradeInRedis(tempArr2); // Uncomment if needed
            await QueueServices.tokenModel.bulkWrite(tempArr);
            // TokenService.insertTokenTradeData(tempArr2);
            return { success: true, message: "Job processed successfully" };
        } catch (error) {
            console.error("Error processing job:", error);
            return { success: false, message: "Job processing failed" };
        }
    }
}  