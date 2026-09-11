export const buildSellerIntelligencePrompt = ({ query, retrievedChunks, metrics }) => {
  let prompt = `You are a competitive seller intelligence assistant.
Answer only using the retrieved product context and price metrics.
Do not invent products or prices.
If context is insufficient, say what is missing.

USER QUESTION:
${query}

RETRIEVED CONTEXT:\n`;

  retrievedChunks.forEach((chunk, index) => {
    prompt += `Source ${index + 1}:
- Product title: ${chunk.title}
- Platform: ${chunk.metadata?.platform || 'Unknown'}
- Current price: ${chunk.metadata?.currentPrice ? `₹${chunk.metadata.currentPrice}` : 'Unknown'}
- Chunk type: ${chunk.chunkType}
- Similarity score: ${chunk.score}
- Chunk text: ${chunk.chunkText}\n\n`;
  });

  if (metrics) {
    prompt += `STRUCTURED METRICS:\n${JSON.stringify(metrics, null, 2)}\n\n`;
  }

  prompt += `OUTPUT FORMAT:
## Summary
## Retrieved Evidence
## Pricing Analysis
## Seller Strategy
## Risks
## Recommended Action
`;

  return prompt;
};
