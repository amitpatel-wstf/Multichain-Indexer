import { CompressionCodecs, CompressionTypes, Kafka } from "kafkajs";
import config from "../../config";
import fs from "fs";
import LZ4 from "kafkajs-lz4";

CompressionCodecs[CompressionTypes.LZ4] = new LZ4().codec;

export class KafkaServices {
    // kafka service state variables
    
    static username: string = config.kafka.username!;
    static password: string = config.kafka.password!;
    static tradeTopic: string = config.kafka.tradeTopic!;

    static kafka = this.initializeKafka();

    static initializeKafka(){
        return new Kafka({
            clientId: config.kafka.username,
            brokers: ["rpk0.bitquery.io:9093", "rpk1.bitquery.io:9092", "rpk2.bitquery.io:9093"],
            ssl: {
              rejectUnauthorized: false,
              ca: [fs.readFileSync(__dirname + "/server.cer.pem", "utf-8")],
              key: fs.readFileSync(__dirname + "/client.key.pem", "utf-8"),
              cert: fs.readFileSync(__dirname + "/client.cer.pem", "utf-8"),
            },
            sasl: {
              mechanism: "scram-sha-512",
              username: KafkaServices.username,
              password: KafkaServices.password,
            },
        });
    }

    private constructor(){}
   
    static getInstance(){
        if(!KafkaServices.kafka){
            KafkaServices.kafka = this.initializeKafka();
        }
        return KafkaServices.kafka;
    }
}