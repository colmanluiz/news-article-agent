import kafka from "../config/kafka.config";
import { storeArticle } from "../services/vectorDB.service";
import { cleaningService } from "./cleaningService";
import { htmlExtractor } from "./htmlExtractor";

const consumer = kafka.consumer({
  groupId: `${process.env.KAFKA_GROUP_ID_PREFIX}`,
});

export const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: process.env.KAFKA_TOPIC_NAME || "default-topic",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const messageValue = message.value?.toString();
      console.log(`New message received: ${messageValue}`);

      const processMessage = async (message: string) => {
        const urlRegex =
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

        const urls = message.match(urlRegex);

        if (urls && urls.length > 0) {
          for (const url of urls) {
            try {
              console.log(`Found URL: ${url}`);

              const rawContent = await htmlExtractor(url);

              if (!rawContent) {
                console.warn(`Extraction failed for ${url}, skipping...`);
                continue;
              }

              const cleanedResult = await cleaningService(rawContent, url);

              if (!cleanedResult.url) {
                console.log(
                  "URL missing in cleaned result, adding original URL"
                );
                cleanedResult.url = url;
              }

              if (!cleanedResult.title || !cleanedResult.content) {
                console.warn(`Incomplete article data for ${url}, skipping...`);
                continue;
              }

              await storeArticle(cleanedResult);
            } catch (error) {
              console.error(`Error processing URL ${url}:`, error);
            }
          }
        } else {
          console.log("No URLs found in the message");
        }
      };

      if (messageValue) {
        await processMessage(messageValue);
      }
    },
  });
};
