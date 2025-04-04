import axios from "axios";
import { parse } from "node-html-parser";

export const htmlExtractor = async (url: string) => {
  try {
    const { data } = await axios.get(url);
    const dom = parse(data);

    const title =
      dom.querySelector("title")?.text || dom.querySelector("h1")?.text || "";

    const isCaptchaPage =
      data.includes("captcha") ||
      data.includes("Captcha") ||
      data.includes("captcha-delivery") ||
      data.includes("security check") ||
      dom.querySelector("title")?.text?.toLowerCase().includes("captcha");

    if (isCaptchaPage) {
      console.warn(`CAPTCHA detected for URL: ${url}, skipping...`);
      return sanitizeContent(
        `This article from ${url} couldn't be accessed due to CAPTCHA protection.`,
        "Access Blocked by CAPTCHA"
      );
    }

    const content =
      dom.querySelector("article")?.structuredText ||
      dom.querySelector('[itemprop="articleBody"]')?.structuredText ||
      dom.querySelector(".post-content")?.structuredText ||
      dom.querySelector(".article-body")?.structuredText ||
      dom.querySelector(".entry-content")?.structuredText ||
      dom.querySelector("main")?.structuredText ||
      dom.querySelector(".content")?.structuredText;

    if (!content) {
      console.warn(`No content found for URL: ${url}`);
      return sanitizeContent(
        "No content could be extracted from this URL.",
        title
      );
    }

    return sanitizeContent(content, title);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        console.warn(`Unauthorized (401) for URL: ${url}, skipping...`);
        return sanitizeContent(
          `This article from ${url} couldn't be accessed due to authorization restrictions.`,
          "Access Unauthorized"
        );
      }

      if (err.response?.status === 403) {
        console.warn(`Forbidden (403) for URL: ${url}, skipping...`);
        return sanitizeContent(
          `This article from ${url} couldn't be accessed due to access restrictions.`,
          "Access Forbidden"
        );
      }

      if (err.response?.status === 429) {
        console.warn(`Rate limited (429) for URL: ${url}, skipping...`);
        return sanitizeContent(
          `This article from ${url} couldn't be accessed due to rate limiting.`,
          "Rate Limited"
        );
      }
    }

    console.error("HTML extraction failed:", err);
    throw new Error(`Content extraction failed for ${url}: ${err}`);
  }
};

const sanitizeContent = (content: string, title?: string) => {
  let cleaned = content
    .replace(/\s+/g, " ")
    .replace(/(\r\n|\n|\r)/gm, " ")
    .replace(/\s*([,:;.!?])/g, "$1")
    .replace(/\[.*?\]/g, "")
    .replace(/…/g, "...")
    .trim();

  // Prepend title if available
  if (title) {
    cleaned = `${title}\n\n${cleaned}`;
  }

  const MAX_TOKENS = 8000;
  return cleaned.slice(0, MAX_TOKENS);
};
