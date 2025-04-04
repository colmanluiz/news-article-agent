import mongoose from "mongoose";
import express from "express";
import { runConsumer } from "./ingestion/kafkaConsumer";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.port || 3001;

app.use(express.json());

// mongoDB initialization
const mongoURI = `${process.env.MONGO_URI}`;

mongoose
  .connect(mongoURI)
  .then(() => console.log("connected to MongoDB."))
  .catch((err) => console.log("failed to connecting to MongoDB, error: ", err));

// kafka consumer initialization
runConsumer().catch((err) =>
  console.log("failed to connecting to Kafka: ", err)
);

app.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});
