import { htmlExtractor } from "../ingestion/htmlExtractor";
import { cleaningService } from "../ingestion/cleaningService";

async function testFullPipeline(url: string) {
  try {
    console.log(`Testing full pipeline with URL: ${url}`);

    console.log("Step 1: Extracting HTML...");
    const extractedContent = await htmlExtractor(url);
    console.log(`Extracted ${extractedContent.length} characters of content`);

    console.log("Step 2: Cleaning with LLM...");
    const cleanedContent = await cleaningService(extractedContent);

    console.log("\nFinal result:");
    console.log(JSON.stringify(cleanedContent, null, 2));

    return cleanedContent;
  } catch (error) {
    console.error("Pipeline test failed:", error);
  }
}

testFullPipeline("https://www.bbc.com/news/articles/cy4m84d2xz2o");
