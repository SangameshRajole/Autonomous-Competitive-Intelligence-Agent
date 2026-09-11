import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

export const embedText = async (text) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";
  const model = genAI.getGenerativeModel({ model: embeddingModel });

  let cleanText = text.replace(/\s+/g, ' ').trim();
  if (cleanText.length > 8000) cleanText = cleanText.substring(0, 8000);

  const result = await model.embedContent(cleanText);
  return result.embedding.values;
};

export const embedBatch = async (texts) => {
  return await Promise.all(texts.map(text => embedText(text)));
};
