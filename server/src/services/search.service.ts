import { embeddings } from "../utils/openAiEmbeddings";
import { Article, IArticle } from "./vectorDB.service";

export const searchArticle = async (query: string) => {
  try {
    const embeddedQuery = await embeddings.embedQuery(query);

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

    const formattedResults = results.map((result: IArticle) => ({
      title: result.title,
      content: result.content,
      url: result.url,
      date: result.date,
    }));

    return formattedResults;
  } catch (error) {
    console.error("Error during vector search:", error);
    throw new Error("Failed to execute search query.");
  }
};
