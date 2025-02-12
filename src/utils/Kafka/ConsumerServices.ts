
import { getBaseService } from "../../services";
import { KafkaServices } from "./KafkaServices";

export class ConsumerServices{
    static async runConsumers() {
        // run instances of the consumer
        for (let i = 0; i < 1; i++) {
            const consumer = KafkaServices.kafka.consumer({ groupId: `${KafkaServices.username}-group-${i}`, sessionTimeout: 30000 });
            await ConsumerServices.startTradeConsumer(consumer);
        }
    }

    static async startTradeConsumer(consumer: any) {
        try {
            await consumer.connect();
            console.log(`Subscribing to topic: ${KafkaServices.tradeTopic}`);
            await consumer.subscribe({ topic: KafkaServices.tradeTopic, fromBeginning: true });
            await consumer.run({
                autoCommit: false,
                eachMessage: async ({ partition, message, topic }: any) => {
                try {
                    const value = message.value.toString("utf-8");
                    const trades = JSON.parse(value);
                    if (topic === KafkaServices.tradeTopic) {
                        await getBaseService()?.TradeConsumer(trades, partition);
                    }
                } catch (err) {
                        console.error("Error parsing message or processing data:", err);
                    }
                },
            });
        } catch (error) {
            console.error("Error connecting to consumer:", error);
        }
    }
}
