import { embeddings } from "../utils/openAiEmbeddings";
import { Article, IArticle } from "./vectorDB.service";

export const searchArticle = async (query: string) => {
  try {
    const embeddedQuery = await embeddings.embedQuery(query);
    console.log(embeddedQuery);

    const results = await Article.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embeddings",
          queryVector: embeddedQuery,
          numCandidates: 100,
          limit: 10,
        },
      },
    ]);

    console.log(results);

    const formattedResults = results.map((result: IArticle) => ({
      title: result.title,
      content: result.content,
      url: result.url,
      date: result.date,
    }));

    const indexes = await Article.db.collection("articles").indexes();
    console.log(
      "Existing indexes:",
      indexes.map((i) => i.name)
    );

    console.log(formattedResults);
    return formattedResults;
  } catch (error) {
    console.error("Error during vector search:", error);
    throw new Error("Failed to execute search query.");
  }
};
