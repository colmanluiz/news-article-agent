import { htmlExtractor } from "../ingestion/htmlExtractor";

const testUrls = [
  "https://www.bbc.com/news/articles/cy4m84d2xz2o",
  "https://edition.cnn.com/2025/01/20/politics/analysis-trump-inaugural-speech-great-power/index.html",
  "https://www.dw.com/en/indonesia-officially-becomes-full-member-of-brics-bloc/a-71233628",
];
async function testHtmlExtractor() {
  for (const url of testUrls) {
    try {
      console.log(`\n--- Testing HTML extraction from: ${url} ---`);

      const extractedContent = await htmlExtractor(url);

      console.log(`Content extracted (first 300 chars):`);
      console.log(extractedContent.substring(0, 300) + "...");

      console.log(`Content length: ${extractedContent.length} characters`);
      console.log("Extraction successful ✅");
    } catch (error) {
      console.error(`Error extracting from ${url}:`, error);
    }
  }
}

testHtmlExtractor()
  .then(() => console.log("\nAll tests completed."))
  .catch((err) => console.error("Test failed with error:", err));
