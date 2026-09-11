import { v4 as uuidv4 } from 'uuid';
import { calculatePriceMetrics } from './metricsService.js';

export const buildChunks = (product) => {
  const chunks = [];
  const metrics = calculatePriceMetrics(product.priceHistory, product.currentPrice);
  
  // 1. product_summary
  const productSummaryId = `product_${product._id}_product_summary_${uuidv4().substring(0,8)}`;
  chunks.push({
    userId: product.userId,
    productId: product._id,
    chunkId: productSummaryId,
    chunkType: 'product_summary',
    chunkText: `Product: ${product.title}\nPlatform: ${product.platform}\nCurrent Price: ₹${product.currentPrice}\nURL: ${product.url}\nTracked since: ${product.createdAt}\nLast checked: ${product.lastChecked}`,
    metadata: {
      title: product.title,
      platform: product.platform,
      url: product.url,
      currentPrice: product.currentPrice,
      currency: product.currency
    }
  });
  
  // 1.5. product_details (Description & Features)
  if (product.description) {
    const descId = `product_${product._id}_description_${uuidv4().substring(0,8)}`;
    chunks.push({
      userId: product.userId,
      productId: product._id,
      chunkId: descId,
      chunkType: 'product_description',
      chunkText: `Description for ${product.title}:\n${product.description}`,
      metadata: {
        title: product.title,
        platform: product.platform,
        type: 'description'
      }
    });
  }

  if (product.features && product.features.length > 0) {
    const featId = `product_${product._id}_features_${uuidv4().substring(0,8)}`;
    chunks.push({
      userId: product.userId,
      productId: product._id,
      chunkId: featId,
      chunkType: 'product_features',
      chunkText: `Features and Specifications for ${product.title}:\n${product.features.join('\n')}`,
      metadata: {
        title: product.title,
        platform: product.platform,
        type: 'features'
      }
    });
  }

  if (!product.priceHistory || product.priceHistory.length === 0) {
    return chunks;
  }

  // 2. price_history_summary
  const priceHistoryId = `product_${product._id}_price_history_summary_${uuidv4().substring(0,8)}`;
  chunks.push({
    userId: product.userId,
    productId: product._id,
    chunkId: priceHistoryId,
    chunkType: 'price_history_summary',
    chunkText: `Price History Summary for ${product.title}:\nLowest Price: ₹${metrics.minPrice}\nHighest Price: ₹${metrics.maxPrice}\nMean Price: ₹${metrics.meanPrice}\nMedian Price: ₹${metrics.medianPrice}\nPrice Range: ₹${metrics.priceRange}\nStandard Deviation: ${metrics.standardDeviation}\nCurrent Price vs Average: ${metrics.currentVsAverage} (${metrics.currentVsAveragePercent}%)\nCurrent Price vs Lowest: ${metrics.currentVsLowest} (${metrics.currentVsLowestPercent}%)\nCurrent Price vs Highest: ${metrics.currentVsHighest} (${metrics.currentVsHighestPercent}%)`,
    metadata: {
      title: product.title,
      platform: product.platform,
      currentPrice: product.currentPrice,
      minPrice: metrics.minPrice,
      maxPrice: metrics.maxPrice,
      avgPrice: metrics.meanPrice,
      medianPrice: metrics.medianPrice,
      trend: metrics.trend
    }
  });

  // 3. weekly_price_analysis
  const weeklySummary = generateWeeklySummary(product.priceHistory);
  let weeklyText = `Weekly Price Analysis for ${product.title}:\n`;
  weeklySummary.forEach(week => {
    weeklyText += `Week ${week.week} (${week.startDate} to ${week.endDate}): Avg ₹${week.avgPrice}, Low ₹${week.minPrice}, High ₹${week.maxPrice}, Start ₹${week.startPrice}, End ₹${week.endPrice}, Change ${week.changePercentage}%, Trend: ${week.trend}, Volatility: ${week.volatility}\n`;
  });
  
  const weeklyId = `product_${product._id}_weekly_price_analysis_${uuidv4().substring(0,8)}`;
  chunks.push({
    userId: product.userId,
    productId: product._id,
    chunkId: weeklyId,
    chunkType: 'weekly_price_analysis',
    chunkText: weeklyText,
    metadata: {
      title: product.title,
      platform: product.platform,
      currentPrice: product.currentPrice,
      trend: metrics.trend,
      priceVolatility: metrics.volatilityLevel === 'high' ? 1 : (metrics.volatilityLevel === 'medium' ? 0.5 : 0)
    }
  });

  // 4. recommendation_context
  let recommendationText = `Recommendation Context for ${product.title}:\n`;
  recommendationText += `Current price is near historical low: ${metrics.currentVsLowestPercent < 5}\n`;
  recommendationText += `Current price is near historical high: ${metrics.currentVsHighestPercent > -5}\n`;
  
  let action = "wait";
  if (metrics.currentVsLowestPercent < 5) action = "match or hold";
  if (metrics.currentVsHighestPercent > -5) action = "undercut";
  recommendationText += `Suggested seller action: ${action}\n`;
  recommendationText += `Risks of aggressive pricing: Margin erosion, price wars.\n`;
  recommendationText += `Competitor pricing trend: ${metrics.trend}\n`;

  const recId = `product_${product._id}_recommendation_context_${uuidv4().substring(0,8)}`;
  chunks.push({
    userId: product.userId,
    productId: product._id,
    chunkId: recId,
    chunkType: 'recommendation_context',
    chunkText: recommendationText,
    metadata: {
      title: product.title,
      platform: product.platform,
      currentPrice: product.currentPrice,
      trend: metrics.trend
    }
  });

  return chunks;
};

function generateWeeklySummary(priceHistory) {
  if (!priceHistory || priceHistory.length === 0) return [];
  const weeks = [];
  let currentWeek = [];
  let weekStartDate = null;
  
  priceHistory.forEach((entry, index) => {
    const entryDate = new Date(entry.date);
    if (!weekStartDate) weekStartDate = entryDate;
    currentWeek.push(entry);
    
    if (currentWeek.length === 7 || index === priceHistory.length - 1) {
      const prices = currentWeek.map(e => e.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const startPrice = currentWeek[0].price;
      const endPrice = currentWeek[currentWeek.length - 1].price;
      const priceChange = endPrice - startPrice;
      const changePercentage = startPrice > 0 ? ((priceChange / startPrice) * 100).toFixed(2) : 0;
      
      let trend = 'stable';
      if (Math.abs(changePercentage) < 1) trend = 'stable';
      else if (changePercentage > 0) trend = 'increasing';
      else trend = 'decreasing';
      
      const volatility = maxPrice - minPrice;
      
      weeks.push({
        week: weeks.length + 1,
        startDate: weekStartDate.toLocaleDateString('en-IN'),
        endDate: new Date(currentWeek[currentWeek.length - 1].date).toLocaleDateString('en-IN'),
        avgPrice, minPrice, maxPrice, startPrice, endPrice, changePercentage, trend, volatility
      });
      
      currentWeek = [];
      weekStartDate = null;
    }
  });
  return weeks;
}
