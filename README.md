# News Article Agent

A Retrieval-Augmented Generation (RAG) system that ingests news articles, extracts their content, and allows users to query information about recent news events.

## Architecture Overview

This application combines several components to create a powerful news query system:

- **Kafka Consumer:** Ingests links to news articles in real-time.
- **Content Extraction:** Scrapes and cleans HTML content from news sites.
- **Vector Database:** Stores article content with embeddings for semantic search.
- **LLM Integration:** Uses OpenAI models to provide accurate answers based on retrieved content.
- **REST API:** Provides a query endpoint for users to ask questions about news.

## Design Decisions & Optimization Strategies

### 1. Robust HTML Extraction

The system uses a multi-layered approach to extract content from news websites:

- Multiple CSS selectors to target different article layouts.
- CAPTCHA and error detection to gracefully handle blocked sites.
- HTTP error code handling (401, 403, 429) to manage access restrictions.

### 2. Content Optimization

To reduce token usage and improve quality:

- Articles are cleaned and summarized to ~1000 words maximum.
- Only the most important information is preserved.
- Content is processed to remove HTML artifacts, excessive whitespace, and irrelevant sections.

### 3. Fault Tolerance

The system implements several strategies to ensure reliable operation:

- JSON parsing recovery mechanisms for LLM responses.
- Fallback content generation for failed extractions.
- Duplicate article detection to prevent redundant processing.
- Try/catch blocks around critical operations to prevent cascade failures.

### 4. Vector Search Efficiency

- MongoDB vector search is used for semantic similarity matching.
- Embeddings are generated using OpenAI's `text-embedding-3-small` model.
- Results are limited to top 10 matches to maintain relevance and performance.

### 5. Token Usage Optimization

- Context is carefully managed to minimize token consumption.
- System prompts are concise yet effective.
- Article content is summarized while maintaining information density.

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (with Atlas Vector Search capability)
- Kafka
- OpenAI API key

### Environment Variables

Create a `.env` file with the following variables:

```env
# Example environment variables
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=your_mongodb_connection_string
KAFKA_SERVER=your_kafka_server_address
```

### Installation & Setup

1. Clone the repository.
2. Install dependencies.
3. Build the TypeScript code.
4. Start the application.

## API Reference

### POST `/agent`

**Request body:**

```json
{
  "query": "your question here"
}
```

**Response:**

```json
{
  "answer": "An answer from LLM example",
  "sources": [
     {
        “title”: "What's the latest on Los Angeles wildfires and how did they start?",
        “url”: "https://www.bbc.com/news/articles/clyxypryrnko",
        “date”: "2025-01-21T13:17:36Z"
     }
   ]
}
```

## Future Improvements

Potential enhancements include:

- Response streaming for better user experience.
- GraphQL API implementation with Yoga.
- Advanced caching strategies.
- Support for more data sources beyond Kafka.
