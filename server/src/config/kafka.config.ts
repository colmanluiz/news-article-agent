import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.KAFKA_USERNAME || !process.env.KAFKA_PASSWORD) {
  throw new Error(
    "KAFKA_USERNAME and KAFKA_PASSWORD must be defined in environment variables"
  );
}

const kafka = new Kafka({
  clientId: "my-rag-app",
  brokers: [`${process.env.KAFKA_BROKER}`],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
});

export default kafka;
