import express from 'express';
import auth from '../middleware/auth.js';
import Product from '../models/Product.js';
import { answerRagQuestion, indexSingleProduct } from '../services/rag/ragService.js';
import { retrieveRelevantContext } from '../services/rag/retrieverService.js';

const router = express.Router();

// 1. Index a single product
router.post('/index-product/:productId', auth, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.productId, userId: req.userId });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const result = await indexSingleProduct(product, req.userId);
    if (result.skipped) {
      return res.status(500).json({ message: "Indexing skipped", reason: result.reason });
    }

    res.json({
      message: "Product indexed successfully",
      productId: result.productId,
      chunksCreated: result.chunksCreated,
      chunksIndexed: result.chunksIndexed
    });
  } catch (error) {
    console.error("Index single product error:", error);
    res.status(500).json({ message: "Server error indexing product", error: error.message });
  }
});

// 2. Re-index all products
router.post('/reindex-all', auth, async (req, res) => {
  try {
    const products = await Product.find({ userId: req.userId });
    let productsProcessed = 0;
    let chunksCreatedTotal = 0;
    let chunksIndexedTotal = 0;

    for (const product of products) {
      try {
        const result = await indexSingleProduct(product, req.userId);
        if (!result.skipped) {
          productsProcessed++;
          chunksCreatedTotal += result.chunksCreated;
          chunksIndexedTotal += result.chunksIndexed;
        }
      } catch (err) {
        console.warn(`Failed to index product ${product._id}:`, err.message);
      }
    }

    res.json({
      productsProcessed,
      chunksCreated: chunksCreatedTotal,
      chunksIndexed: chunksIndexedTotal
    });
  } catch (error) {
    console.error("Re-index all error:", error);
    res.status(500).json({ message: "Server error re-indexing all products" });
  }
});

// 3. Query RAG
router.post('/query', auth, async (req, res) => {
  try {
    const { query, topK = 5, filters = {} } = req.body;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const result = await answerRagQuestion({ userId: req.userId, query, topK, filters });
    res.json(result);
  } catch (error) {
    console.error("RAG query error:", error);
    res.status(500).json({ message: "Server error querying RAG" });
  }
});

// 4. Retrieve context
router.post('/retrieve', auth, async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const result = await retrieveRelevantContext({ userId: req.userId, query, topK });
    res.json({
      matches: result.matches,
      topK: result.topK
    });
  } catch (error) {
    console.error("Retrieve context error:", error);
    res.status(500).json({ message: "Server error retrieving context" });
  }
});

export default router;
