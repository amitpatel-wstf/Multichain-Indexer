import "dotenv/config";

export default {
    chainName: process.env.CHAIN_NAME!,
    moralisApiKey: process.env.MORALIS_API_KEY!,
    port: process.env.PORT!,
    mongoUrl: process.env.MONGO_URL!,
    kafka: {
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
        tradeTopic: process.env.TRADE_TOPIC,
    }
}