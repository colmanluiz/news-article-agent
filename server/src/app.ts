import mongoose from "mongoose";
import express from "express";
import { runConsumer } from "./ingestion/kafkaConsumer";
import { connectDB } from "./services/vectorDB.service";
import agentRouter from "./routes/agent.route";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.port || 3001;

app.use(express.json());

// mongoDB connection
connectDB();

// routers
app.use("/", agentRouter);

// kafka consumer initialization
runConsumer().catch((err) =>
  console.log("failed to connecting to Kafka: ", err)
);

app.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});
