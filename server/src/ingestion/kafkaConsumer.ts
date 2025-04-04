import kafka from "../config/kafka.config";

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
      // 1- procurar o link na mensagem
      // 2- dar um fetch no html do link
      // 3- mandar para a llm o html com o contexto da noticia
      // 4- tem que ter uma checagem de erros/ checagem se é realmente uma noticia.
    },
  });
};
