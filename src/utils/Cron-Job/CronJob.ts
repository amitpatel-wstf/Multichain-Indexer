import { DateTime } from "luxon";
import cron from 'node-cron';
import { getTokenModel, getTokenTradeModel } from "../../models";

export class CronJob {
        static tokenTradeModel = getTokenTradeModel("");
        static tokenTradeModel5M = getTokenTradeModel("5M");
        static tokenTradeModel1H = getTokenTradeModel("1H");
        static tokenTradeModel6H = getTokenTradeModel("6H");
        static tokenTradeModel24H = getTokenTradeModel("24H");
        static tokenTradeModel1MONTH = getTokenTradeModel("TokenTrade1MONTH");
        static tokenTradeModel3MONTH = getTokenTradeModel("TokenTrade3MONTH");
        static tokenTradeModel6MONTH = getTokenTradeModel("TokenTrade6MONTH");
        static tokenTradeModel1YEAR = getTokenTradeModel("TokenTrade1YEAR");
        static tokenTradeModelAllTIME = getTokenTradeModel("TokenTradeALLTIME");


    /**
     * Migrates data from one schema to another for records older than the provided minutes.
     * 
     * @param fromSchema - The source schema to query and remove data from.
     * @param toSchema - The destination schema to insert the migrated data.
     * @param minutes - The interval (in minutes) used to calculate the cutoff timestamp.
     */
    static async tokenFilter(fromSchema: any, toSchema: any, minutes: number): Promise<void> {
        try {
            const timeStamp = DateTime.now().minus({ minutes }).toJSDate();
            const data = await fromSchema.find(
                { updatedAt: { $lte: timeStamp } },
                { _id: false, _v: false }
            ).lean();
    
            if (data && data.length > 0) {
                await toSchema.insertMany(data);
                await fromSchema.deleteMany({ updatedAt: { $lte: timeStamp } });
            }
    
            console.log("Find, Insert and Delete Successfully...", minutes);
        } catch (error) {
            console.log("Error in tokenFilter:", error);
        }
    }

    /**
     * Sets up a single cron job using the given source and destination schemas,
     * the time interval in minutes and the cron expression.
     * 
     * @param fromSchema - The source schema.
     * @param toSchema - The destination schema.
     * @param minutes - The time interval (in minutes) for the cron job.
     * @param cronExpression - The cron expression string.
     */
    static setupCronJob(fromSchema: any, toSchema: any, minutes: number, cronExpression: string): void {
        cron.schedule(cronExpression, async () => {
            await this.tokenFilter(fromSchema, toSchema, minutes);
            console.log(`Cron job executed for interval: ${minutes} minutes`);
        });
    }

    /**
     * Initializes all cron jobs at different intervals by chaining the data migration jobs.
     */
    static start(): void {
        try {
            // Every 5 minutes
            this.setupCronJob(this.tokenTradeModel, this.tokenTradeModel5M, 5, '*/5 * * * *');

            // Every 1 hour
            this.setupCronJob(this.tokenTradeModel5M, this.tokenTradeModel1H, 60, '0 * * * *');

            // Every 6 hours
            this.setupCronJob(this.tokenTradeModel1H, this.tokenTradeModel6H, 360, '0 */6 * * *');

            // Every 24 hours
            this.setupCronJob(this.tokenTradeModel6H, this.tokenTradeModel24H, 1440, '0 0 */1 * *');

            // Every 30 days (1 month)
            this.setupCronJob(this.tokenTradeModel24H, this.tokenTradeModel1MONTH, 43200, '0 0 1 * *');

            // Every 90 days (3 months)
            this.setupCronJob(this.tokenTradeModel1MONTH, this.tokenTradeModel3MONTH, 129600, '0 0 1 */3 *');

            // Every 180 days (6 months)
            this.setupCronJob(this.tokenTradeModel3MONTH, this.tokenTradeModel6MONTH, 259200, '0 0 1 */6 *');

            // Every 365 days (1 year)
            this.setupCronJob(this.tokenTradeModel6MONTH, this.tokenTradeModel1YEAR, 518400, '0 0 1 1 *');

            // Every 15 years
            this.setupCronJob(this.tokenTradeModel1YEAR, this.tokenTradeModelAllTIME, 777600, '0 0 1 1 1');
        } catch (error) {
            console.log("Error starting cron jobs:", error);
        }
    }
}