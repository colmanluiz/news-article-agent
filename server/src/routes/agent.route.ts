import express, { Request, Response } from "express";
import { searchArticle } from "../services/search.service";
import dotenv from "dotenv";
import { llm } from "../utils/openAiGPT";
dotenv.config();

const router = express.Router();

router.post("/agent", async (req: Request, res: Response): Promise<any> => {
  // typescript was with an strange error: No overload matches this call if do not pass Promise<any>.
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Missing 'query' parameter." });
  }

  const searchResults = await searchArticle(query);

  const sources = searchResults.map((article: any) => ({
    title: article.title,
    url: article.url,
    date: article.date,
  }));

  let context = "";
  sources.forEach((src) => {
    context += `Title: ${src.title}\nURL: ${src.url}\nDate: ${src.date}\n\n`;
  });

  const systemMessage = `
You are an assistant that helps answer user queries by referencing relevant news articles.
Based on the provided sources, generate a concise answer to the query and list the sources used.
Ensure your answer is clear and direct.
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

  const answer = aiMsg.text;

  res.status(200).json({
    answer,
    sources,
  });
});

export default router;
