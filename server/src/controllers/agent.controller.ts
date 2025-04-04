import { searchArticle } from "../services/search.service";
import { llm } from "../utils/openAiGPT";

export const handleAgentQuery = async (query: string) => {
  if (!query) {
    throw new Error("Missing query parameter");
  }

  const searchResults = await searchArticle(query);

  const sources = searchResults.map((article) => ({
    title: article.title,
    url: article.url,
    date: article.date,
  }));

  let context = "";
  searchResults.forEach((src) => {
    context += `Title: ${src.title}\nDate: ${src.date}\nURL: ${src.url}\n\nContent:\n${src.content}\n\n---\n\n`;
  });

  const systemMessage = `
    You are an assistant that helps answer user queries by referencing relevant news articles.
    Based on the provided sources, generate a concise answer to the query and list the sources used.
    Generate a concise answer using ONLY the following context.
    DO NOT include URLs or sources in the answer text - they will be handled separately.
`;

  const userMessage = `
    Query: ${query}

    Sources:
    ${context}
`;

  const aiMsg = await llm.invoke([
    { role: "system", content: systemMessage },
    { role: "user", content: userMessage },
  ]);

  return {
    answer: aiMsg.text,
    sources,
  };
};
