import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
dotenv.config();

export const cleaningService = async (rawHtml: string) => {
  try {
    const llm = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.2,
      maxTokens: 500,
    });

    const systemMessage = `  
    You are an AI assistant tasked with cleaning raw HTML content. Your role is to:
    1. Remove any unnecessary HTML tags, scripts, and styling
    2. Extract the main article content
    3. Organize the content into a clean, readable format
    4. Keep important semantic structure (headings, paragraphs, lists)
    5. Remove ads, navigation menus, footers, and other irrelevant content

    Output clean, well-structured content that maintains the article's meaning and hierarchy.

    IMPORTANT: Return a valid JSON object without any markdown formatting, code blocks, or backticks.
    The JSON response should directly follow this format:
      {
        "title": "Article Title",
        "content": "Cleaned article content...",
        "url": "https://...",
        "date": "YYYY-MM-DD"
      }
    `;

    const userMessage = `  
    HTML: ${rawHtml} 
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

    const jsonResponse = JSON.parse(responseText);

    const { title, content, url, date } = jsonResponse;
    return {
      title,
      content,
      url,
      date,
    };
  } catch (error) {
    console.error("Error in cleaningService: ", error);
    throw new Error("Failed to clean HTML content.");
  }
};
