import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

let pc;

export const initializePinecone = () => {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is missing");
  }
  pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
};

export const ensureIndex = async () => {
  if (!pc) initializePinecone();
  const indexName = process.env.PINECONE_INDEX_NAME || 'ecom-price-agent';
  
  const existingIndexesResponse = await pc.listIndexes();
  const existingIndexes = existingIndexesResponse.indexes || [];
  
  if (!existingIndexes.find(idx => idx.name === indexName)) {
    await pc.createIndex({
      name: indexName,
      dimension: 768,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: process.env.PINECONE_CLOUD || 'aws',
          region: process.env.PINECONE_REGION || 'us-east-1'
        }
      }
    });
  }
  return pc.Index(indexName);
};

export const upsertChunks = async (chunks, userId) => {
  const index = await ensureIndex();
  
  const records = chunks.map(chunk => ({
    id: chunk.chunkId,
    values: chunk.embedding,
    metadata: {
      chunkId: chunk.chunkId,
      productId: chunk.productId.toString(),
      userId: chunk.userId.toString(),
      chunkType: chunk.chunkType,
      title: chunk.metadata?.title || '',
      platform: chunk.metadata?.platform || '',
      currentPrice: chunk.metadata?.currentPrice || 0,
      minPrice: chunk.metadata?.minPrice || 0,
      maxPrice: chunk.metadata?.maxPrice || 0,
      avgPrice: chunk.metadata?.avgPrice || 0,
      trend: chunk.metadata?.trend || ''
    }
  }));

  const namespace = index.namespace(`user_${userId}`);
  await namespace.upsert(records);
};

export const querySimilarChunks = async (queryEmbedding, userId, topK = 5, filters = {}) => {
  const index = await ensureIndex();
  const namespace = index.namespace(`user_${userId}`);

  const queryResponse = await namespace.query({
    topK,
    vector: queryEmbedding,
    includeMetadata: true,
    includeValues: false,
    filter: filters && Object.keys(filters).length > 0 ? filters : undefined
  });

  return queryResponse.matches || [];
};
