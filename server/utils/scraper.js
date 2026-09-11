import axios from 'axios';

// Python scraper service URL
const PYTHON_SCRAPER_URL = process.env.PYTHON_SCRAPER_URL || 'http://localhost:5001';

// Main scraper function - calls Python service
const scrapeProductPrice = async (url) => {
  try {
    console.log(`Scraping product from: ${url}`);
    
    // Call Python scraper service
    const response = await axios.post(`${PYTHON_SCRAPER_URL}/scrape`, {
      url: url
    }, {
      timeout: 120000, // 120 second timeout for Selenium
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.success) {
      const { title, price, currency, imageUrl, platform, description, features } = response.data;
      
      console.log(`Successfully scraped: ${title} - ${currency} ${price}`);
      
      return {
        title: title.substring(0, 200), // Limit title length
        price,
        currency: currency || 'INR',
        imageUrl: imageUrl || '',
        platform: platform || 'Unknown',
        description: description || '',
        features: features || []
      };
    }

    console.error('Python scraper returned unsuccessful response');
    return null;

  } catch (error) {
    console.error('Scraping error:', error.message);
    
    // If Python service is not available, return a helpful error
    if (error.code === 'ECONNREFUSED') {
      console.error('Python scraper service is not running. Please start it with: python scraper/scraper_service.py');
    }
    
    return null;
  }
};

export { scrapeProductPrice };
