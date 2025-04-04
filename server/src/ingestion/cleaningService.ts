import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import dotenv from "dotenv";
import { embeddings } from "../utils/openAiEmbeddings";
import { llm } from "../utils/openAiGPT";
dotenv.config();

export const cleaningService = async (rawHtml: string, articleUrl: string) => {
  try {
    const systemMessage = `  
    You are an AI assistant that cleans and summarizes article content.
    
    Extract and clean the main content from HTML, but LIMIT THE CONTENT to 1000 words maximum.
    Focus on the most important information in the article.
    
    IMPORTANT: Return a COMPLETE, valid JSON object in this EXACT format:
    {
      "title": "Article Title",
      "content": "Cleaned, summarized content (max 1000 words)",
      "url": "${articleUrl}",
      "date": "YYYY-MM-DD"
    }
    
    Do not include any explanations, notes, or markdown formatting.
    `;

    const userMessage = `  
    HTML: ${rawHtml},
    URL: ${articleUrl}
    `;

    const aiMsg = await llm.invoke([
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: userMessage,
      },
    ]);

    let responseText = aiMsg.text;

    responseText = responseText
      .replace(/```(?:json)?\n/g, "")
      .replace(/```/g, "");

    responseText = responseText.trim();

    console.log("Cleaned response:", responseText.substring(0, 100) + "...");

    let jsonResponse;

    try {
      jsonResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error("First parse attempt failed, trying recovery...");

      // Attempt to recover by adding missing closing braces
      const fixedResponse = responseText + '"}';
      try {
        jsonResponse = JSON.parse(fixedResponse);
        console.log("JSON recovery successful");
      } catch (secondError) {
        // If recovery fails, create minimal valid response
        console.error("Recovery failed, creating fallback response");
        jsonResponse = {
          title:
            responseText.match(/"title":\s*"([^"]+)"/)?.[1] || "Unknown Title",
          content: "Content extraction failed. Please try again later.",
          url: articleUrl,
          date: new Date().toISOString().split("T")[0],
        };
      }
    }

    const { title, content, url, date } = jsonResponse;

    const embeddedContent = await embeddings.embedQuery(content);

    return {
      title,
      content,
      url,
      date,
      embeddings: embeddedContent,
    };
  } catch (error) {
    console.error("Error in cleaningService: ", error);

    return {
      title: "Error Processing Article",
      content:
        "We encountered an error processing this article. Original URL: " +
        articleUrl,
      url: articleUrl,
      date: new Date().toISOString().split("T")[0],
      embeddings: await embeddings.embedQuery(
        "Error processing article at " + articleUrl
      ),
    };
  }
};
