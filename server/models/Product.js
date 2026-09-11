import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  platform: {
    type: String,
    default: 'Unknown'
  },
  description: {
    type: String,
    default: ''
  },
  features: [{
    type: String
  }],
  priceHistory: [{
    price: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastChecked: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Product', productSchema);
