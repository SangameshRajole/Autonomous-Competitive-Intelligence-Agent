import mongoose from 'mongoose';

const productChunkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  chunkId: {
    type: String,
    unique: true,
    required: true
  },
  chunkType: {
    type: String,
    enum: [
      "product_summary",
      "price_history_summary",
      "weekly_price_analysis",
      "recommendation_context",
      "product_description",
      "product_features"
    ],
    required: true
  },
  chunkText: {
    type: String,
    required: true
  },
  metadata: {
    title: String,
    platform: String,
    url: String,
    currentPrice: Number,
    currency: String,
    minPrice: Number,
    maxPrice: Number,
    avgPrice: Number,
    medianPrice: Number,
    priceVolatility: Number,
    trend: String
  },
  indexedInPinecone: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productChunkSchema.index({ userId: 1 });
productChunkSchema.index({ productId: 1 });
productChunkSchema.index({ chunkId: 1 });
productChunkSchema.index({ chunkType: 1 });

export default mongoose.model('ProductChunk', productChunkSchema);
