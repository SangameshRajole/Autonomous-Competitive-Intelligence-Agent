import { retrieveRelevantContext } from './retrieverService.js';
import { buildSellerIntelligencePrompt } from './promptBuilder.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ProductChunk from '../../models/ProductChunk.js';
import { buildChunks } from './chunkBuilder.js';
import { embedText } from './embeddingService.js';
import { upsertChunks } from './pineconeService.js';
import dotenv from 'dotenv';
dotenv.config();

export const answerRagQuestion = async ({ userId, query, topK = 5, filters = {} }) => {
  // 1. Retrieve context
  const retrievalResult = await retrieveRelevantContext({ userId, query, topK, filters });
  
  if (!retrievalResult.matches || retrievalResult.matches.length === 0) {
    return {
      answer: "No relevant indexed context found. Please index products first.",
      retrievedChunks: [],
      sources: [],
      topK
    };
  }

  // 2. Build prompt
  const prompt = buildSellerIntelligencePrompt({
    query,
    retrievedChunks: retrievalResult.matches,
    metrics: null 
  });

  // 3. Call Gemini
  let answer = "";
  if (!process.env.GEMINI_API_KEY) {
    answer = "GEMINI_API_KEY is missing. Fallback response: Based on retrieved chunks, the context is visible below.";
  } else {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      answer = result.response.text();
    } catch (e) {
      console.error("Gemini generation error:", e);
      answer = `Error generating response from LLM: ${e.message}`;
    }
  }

  const sources = retrievalResult.matches.map(m => m.title);

  return {
    answer,
    retrievedChunks: retrievalResult.matches,
    sources: [...new Set(sources)],
    topK
  };
};

export const indexSingleProduct = async (product, userId) => {
  if (!process.env.GEMINI_API_KEY || !process.env.PINECONE_API_KEY) {
    console.warn("Skipping RAG indexing: Missing API keys");
    return { skipped: true, reason: "Missing API keys" };
  }

  // Generate chunks
  const chunks = buildChunks(product);
  
  // Delete existing chunks for this product in DB
  await ProductChunk.deleteMany({ productId: product._id, userId });

  // Store new chunks in DB
  const savedChunks = await ProductChunk.insertMany(chunks);

  // Generate embeddings and prep for Pinecone
  const pineconeChunks = [];
  for (const chunk of savedChunks) {
    const embedding = await embedText(chunk.chunkText);
    pineconeChunks.push({
      ...chunk.toObject(),
      embedding
    });
  }

  // Upsert to Pinecone
  await upsertChunks(pineconeChunks, userId);

  // Mark as indexed
  await ProductChunk.updateMany(
    { _id: { $in: savedChunks.map(c => c._id) } },
    { $set: { indexedInPinecone: true } }
  );

  return {
    productId: product._id,
    chunksCreated: chunks.length,
    chunksIndexed: pineconeChunks.length
  };
};
