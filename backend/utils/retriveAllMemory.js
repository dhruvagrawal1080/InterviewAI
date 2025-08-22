import dotenv from "dotenv";
import { Memory } from 'mem0ai/oss';
import { QdrantClient } from "@qdrant/js-client-rest";

dotenv.config({ quiet: true });

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

// Function to ensure required indexes exist
async function ensureIndexesForRetrieval(userId) {
  const collectionName = `user_memories_${userId}`;
  
  try {
      // Create userId index if it doesn't exist
      await qdrantClient.createPayloadIndex(collectionName, {
          field_name: "userId",
          field_schema: { type: "keyword" }
      });
      console.log("Index created for userId");
  } catch (err) {
      if (err?.response?.status === 409) {
          console.log("Index already exists for userId");
      } else {
          console.error("❌ Error creating userId index:", err);
          throw err;
      }
  }
}

export async function retriveAllMemory(userId) {
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
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        embeddingModelDims: 768,
        dimension: 768,
      },
    },
  };
  const memory = new Memory(config);

  try {
    await ensureIndexesForRetrieval(userId);
    const allMemories = await memory.getAll({ userId });
    return allMemories;
  }
  catch (error) {
    console.log(error)
  }
}