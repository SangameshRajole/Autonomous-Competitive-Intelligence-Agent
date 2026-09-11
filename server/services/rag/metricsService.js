export const calculatePriceMetrics = (priceHistory, currentPrice) => {
  if (!priceHistory || priceHistory.length === 0) {
    return {
      count: 0,
      minPrice: currentPrice || 0,
      maxPrice: currentPrice || 0,
      meanPrice: currentPrice || 0,
      medianPrice: currentPrice || 0,
      priceRange: 0,
      variance: 0,
      standardDeviation: 0,
      currentVsAverage: 0,
      currentVsAveragePercent: 0,
      currentVsLowest: 0,
      currentVsLowestPercent: 0,
      currentVsHighest: 0,
      currentVsHighestPercent: 0,
      trend: "stable",
      volatilityLevel: "low"
    };
  }

  const prices = priceHistory.map(entry => entry.price);
  const count = prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const meanPrice = Number((prices.reduce((a, b) => a + b, 0) / count).toFixed(2));
  
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const medianPrice = count % 2 !== 0 
    ? sortedPrices[Math.floor(count / 2)] 
    : (sortedPrices[count / 2 - 1] + sortedPrices[count / 2]) / 2;
    
  const priceRange = maxPrice - minPrice;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - meanPrice, 2), 0) / count;
  const standardDeviation = Number(Math.sqrt(variance).toFixed(2));

  const currentVsAverage = Number((currentPrice - meanPrice).toFixed(2));
  const currentVsAveragePercent = Number(((currentVsAverage / meanPrice) * 100).toFixed(2));
  const currentVsLowest = Number((currentPrice - minPrice).toFixed(2));
  const currentVsLowestPercent = Number(((currentVsLowest / minPrice) * 100).toFixed(2));
  const currentVsHighest = Number((currentPrice - maxPrice).toFixed(2));
  const currentVsHighestPercent = Number(((currentVsHighest / maxPrice) * 100).toFixed(2));

  // Trend logic: compare first 20% average to last 20% average
  let trend = "stable";
  if (count >= 5) {
    const chunkCount = Math.max(1, Math.floor(count * 0.2));
    const firstAvg = prices.slice(0, chunkCount).reduce((a, b) => a + b, 0) / chunkCount;
    const lastAvg = prices.slice(-chunkCount).reduce((a, b) => a + b, 0) / chunkCount;
    
    if (lastAvg > firstAvg * 1.02) trend = "increasing";
    else if (lastAvg < firstAvg * 0.98) trend = "decreasing";
  }

  // Volatility logic
  const volatilityRatio = meanPrice > 0 ? standardDeviation / meanPrice : 0;
  let volatilityLevel = "low";
  if (volatilityRatio >= 0.03 && volatilityRatio <= 0.08) volatilityLevel = "medium";
  else if (volatilityRatio > 0.08) volatilityLevel = "high";

  return {
    count,
    minPrice,
    maxPrice,
    meanPrice,
    medianPrice,
    priceRange,
    variance,
    standardDeviation,
    currentVsAverage,
    currentVsAveragePercent,
    currentVsLowest,
    currentVsLowestPercent,
    currentVsHighest,
    currentVsHighestPercent,
    trend,
    volatilityLevel
  };
};
