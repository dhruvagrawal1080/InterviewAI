import dotenv from "dotenv";
import { Memory } from 'mem0ai/oss';

dotenv.config({ quiet: true });

export async function retriveRelevantMemory(userId, search_param) {
  const config = {
    version: 'v1.1',
    embedder: {
      provider: 'gemini',
      config: {
        apiKey: process.env.GOOGLE_API_KEY,
        model: 'gemini-embedding-001',
        embeddingDims: 768,
      },
    },
    vectorStore: {
      provider: 'qdrant',
      config: {
        collectionName: `user_memories_${userId}`,
        host: 'localhost',
        port: 6333,
        embeddingModelDims: 768,
        dimension: 768,
      },
    },
  };
  const memory = new Memory(config);
  try {
    const relevantMemory = await memory.search(search_param, { userId });
    return relevantMemory;
  }
  catch (error) {
    console.log(error)
  }
}