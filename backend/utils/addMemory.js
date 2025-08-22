import dotenv from "dotenv";
import { Memory } from 'mem0ai/oss';
import { Queue, Worker } from 'bullmq';
import { QdrantClient } from "@qdrant/js-client-rest";

dotenv.config({ quiet: true });

const redisConfig = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
};

const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

// Create memory processing queue
const memoryQueue = new Queue('memory-processing', {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50,      // Keep last 50 failed jobs
    },
});

async function ensureCollectionAndIndexes(userId) {
    const collectionName = `user_memories_${userId}`;

    // Create userId index
    try {
        await qdrantClient.createPayloadIndex(collectionName, {
            field_name: "userId",
            field_schema: { type: "keyword" }
        });
        console.log("Index created for userId");
    } catch (err) {
        if (err?.response?.status === 409) {
            console.log("Index already exists for userId");
        } else {
            throw err;
        }
    }
}

// Worker to process memory jobs
const memoryWorker = new Worker('memory-processing', async (job) => {
    const { userId, message } = job.data;
    try {
        await processMemoryJob(userId, message);
        return { success: true, userId, processedAt: new Date().toISOString() };
    } catch (error) {
        console.error(`❌ Failed to process memory for user ${userId}:`, error);
        throw error;
    }
}, {
    connection: redisConfig,
    concurrency: 5, // Process up to 5 jobs concurrently
});

// Memory processing logic
async function processMemoryJob(userId, message) {
    await ensureCollectionAndIndexes(userId);
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
        llm: {
            provider: 'gemini',
            config: {
                apiKey: process.env.GOOGLE_API_KEY,
                model: 'gemini-2.5-flash-lite',
            },
        },
    };

    const memory = new Memory(config);
    await memory.add(message, { userId, metadata: { category: "memory" } });
}

// Event listeners for monitoring
memoryWorker.on('completed', (job, result) => {
    console.log(`🎉 Job ${job.id} completed for user ${result.userId}`);
});

memoryWorker.on('failed', (job, err) => {
    console.log(`💥 Job ${job?.id} failed: ${err.message}`);
});

memoryWorker.on('error', (err) => {
    console.error('Worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await memoryWorker.close();
    await memoryQueue.close();
    process.exit(0);
});

// Updated addMemory function - now non-blocking
export async function addMemory(userId, message) {
    try {
        const job = await memoryQueue.add('process-memory', {
            userId,
            message,
            timestamp: new Date().toISOString()
        }, {
            delay: 100, // Small delay to batch if needed
            priority: 1,
        });

        console.log(`📋 Memory job queued with ID: ${job.id} for user: ${userId}`);
        return { success: true, jobId: job.id };
    } catch (error) {
        console.error('Failed to queue memory job:', error);
        throw error;
    }
}