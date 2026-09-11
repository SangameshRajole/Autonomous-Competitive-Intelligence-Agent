# Python Scraper Service

A Flask-based web scraping service for extracting product information from e-commerce websites.

## Features

- **Dual Scraping Methods**: Uses both `requests` (fast) and `Selenium` (reliable for JS-heavy sites)
- **Multi-Platform Support**: Amazon, eBay, Walmart, Flipkart, and generic e-commerce sites
- **Robust Price Extraction**: Advanced regex patterns for various price formats
- **Image Extraction**: Fetches product images
- **Fallback Strategy**: Automatically tries Selenium if requests method fails

## Installation

1. Install Python 3.8 or higher

2. Install dependencies:
```bash
cd scraper
pip install -r requirements.txt
```

3. Install Chrome browser (required for Selenium)

## Running the Service

```bash
python scraper_service.py
```

The service will start on `http://localhost:5001`

## API Endpoints

### POST /scrape
Scrape product data from a URL

**Request:**
```json
{
  "url": "https://www.amazon.com/product-url"
}
```

**Response:**
```json
{
  "success": true,
  "title": "Product Title",
  "price": 99.99,
  "currency": "USD",
  "imageUrl": "https://...",
  "platform": "Amazon"
}
```

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "service": "Python Scraper"
}
```

## Supported Platforms

- Amazon
- eBay
- Walmart
- Best Buy
- Target
- Flipkart
- Alibaba
- Etsy
- Generic e-commerce sites

## How It Works

1. **Platform Detection**: Identifies the e-commerce platform from URL
2. **Fast Scraping**: Attempts scraping with `requests` + `BeautifulSoup` first
3. **Fallback**: If fast method fails, uses `Selenium` with headless Chrome
4. **Data Extraction**: Uses platform-specific selectors to extract title, price, and image
5. **Price Parsing**: Robust regex-based price extraction from various formats

## Troubleshooting

### Chrome Driver Issues
- The service auto-downloads ChromeDriver using `webdriver-manager`
- Ensure Chrome browser is installed on your system

### Scraping Failures
- Some sites have anti-bot measures
- Try using a VPN or different IP
- Increase wait times in Selenium section

### Port Conflicts
- Change the port in `app.run()` if 5001 is in use
