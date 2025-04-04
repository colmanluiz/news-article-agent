import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import dotenv from "dotenv";
import { embeddings } from "../utils/openAiEmbeddings";
import { llm } from "../utils/openAiGPT";
dotenv.config();

export const cleaningService = async (rawHtml: string, articleUrl: string) => {
  try {
    const systemMessage = `  
    You are an AI assistant tasked with cleaning raw HTML content. Your role is to:
    1. Remove any unnecessary HTML tags, scripts, and styling
    2. Extract the main article content
    3. Organize the content into a clean, readable format
    4. Keep important semantic structure (headings, paragraphs, lists)
    5. Remove ads, navigation menus, footers, and other irrelevant content

    Output clean, well-structured content that maintains the article's meaning and hierarchy.

    IMPORTANT: Please, only return a VALID JSON (and nothing else) object without any markdown formatting, code blocks, or backticks.
    The JSON response NEEDS to directly follow this format:
      {
        "title": "Article Title",
        "content": "Cleaned article content...",
        "url": "${articleUrl}",
        "date": "YYYY-MM-DD"
      }
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
      console.error("Failed to parse JSON. Response text:", responseText);
      throw new Error("LLM returned invalid JSON.");
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
    throw new Error("Failed to clean HTML content.");
  }
};
