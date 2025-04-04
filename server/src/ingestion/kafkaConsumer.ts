import kafka from "../config/kafka.config";
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

      // funcao para processar o link
      const processMessage = async (message: string) => {
        const urlRegex =
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

        const urls = message.match(urlRegex);

        if (urls && urls.length > 0) {
          for (const url of urls) {
            console.log(`Found URL: ${url}`);

            const rawContent = await htmlExtractor(url);
            const cleanedResult = await cleaningService(rawContent);
            console.log("Processed content:", cleanedResult);
            // await storeArticle(cleanedResult); // Função para armazenar no DB
          }
        } else {
          console.log("No URLs found in the message");
        }
      };
      // 1- procurar o link na mensagem
      // 2- dar um fetch no html do link
      // 3- mandar para a llm o html com o contexto da noticia
      // 4- tem que ter uma checagem de erros/ checagem se é realmente uma noticia.
    },
  });
};
