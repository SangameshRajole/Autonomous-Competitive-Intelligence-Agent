import { embedText } from './embeddingService.js';
import { querySimilarChunks } from './pineconeService.js';
import ProductChunk from '../../models/ProductChunk.js';

export const retrieveRelevantContext = async ({ userId, query, topK = 5, filters = {} }) => {
  // 1. Embed query
  const queryEmbedding = await embedText(query);
  
  // 2. Query Pinecone
  const matches = await querySimilarChunks(queryEmbedding, userId, topK, filters);
  if (!matches.length) {
    return { query, topK, matches: [] };
  }

  // 3. Extract chunk IDs
  const chunkIds = matches.map(match => match.metadata.chunkId || match.id);

  // 4. Fetch chunks from MongoDB
  const chunks = await ProductChunk.find({
    userId,
    chunkId: { $in: chunkIds }
  });

  // 5. Preserve Pinecone ranking order
  const chunkMap = new Map(chunks.map(c => [c.chunkId, c]));
  const orderedChunks = chunkIds
    .map((id, index) => {
      const c = chunkMap.get(id);
      if (!c) return null;
      return {
        chunkId: c.chunkId,
        score: matches[index].score,
        chunkType: c.chunkType,
        productId: c.productId,
        title: c.metadata?.title || '',
        chunkText: c.chunkText,
        metadata: c.metadata
      };
    })
    .filter(Boolean);

  // 6. Return structured result
  return {
    query,
    topK,
    matches: orderedChunks
  };
};
