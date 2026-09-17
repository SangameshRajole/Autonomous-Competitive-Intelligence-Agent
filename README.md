# Competitive Tracker - MERN Application

A modern full-stack web application for tracking product prices across multiple e-commerce platforms. Built with MongoDB, Express, React, and Node.js (MERN stack).

## Features

- 🔐 **User Authentication** - Secure registration and login with JWT
- 📊 **Product Tracking** - Add products from various e-commerce sites
- 💰 **Price Monitoring** - Automatically fetch and display current prices
- 🔄 **Price Refresh** - Manually update prices on demand
- 📈 **Price History** - Track price changes over time
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations
- 🌐 **Multi-Platform Support** - Works with Amazon, eBay, Walmart, and more

## Tech Stack

### Backend
- **Node.js** & **Express** - Server and API (ES Modules)
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Python Flask** - Scraping microservice
- **BeautifulSoup** & **Selenium** - Web scraping

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **CSS3** - Modern styling with gradients and animations

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Chrome Browser** (for Selenium web scraping)
- **npm** or **yarn**
- **pip** (Python package manager)

## Installation

### 1. Clone or navigate to the project directory

```bash
cd mini3
```

### 2. Install all dependencies

```bash
npm run install-all
```

This will install dependencies for the root, server, and client.

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
copy .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/price-tracker
JWT_SECRET=your_secure_jwt_secret_key_here
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

### 4. Install Python Dependencies

```bash
cd scraper
pip install -r requirements.txt
cd ..
```

### 5. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Or start manually
mongod
```

## Running the Application

### Development Mode (Recommended)

You need to run **three services**:

**1. Start Python Scraper Service (Terminal 1):**
```bash
cd scraper
python scraper_service.py
```
This starts the scraping service on `http://localhost:5001`

**2. Start Node.js Backend & React Frontend (Terminal 2):**
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- React frontend on `http://localhost:3000`

### Run Separately

**Python scraper:**
```bash
cd scraper
python scraper_service.py
```

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

**Note:** The Python scraper service must be running for product tracking to work!

## Usage

1. **Register an Account**
   - Navigate to `http://localhost:3000`
   - Click "Sign up" and create an account
   - You'll be automatically logged in

2. **Add Products**
   - Paste a product URL from supported platforms
   - Click "Add Product"
   - The app will fetch the current price and details

3. **Track Prices**
   - View all your tracked products on the dashboard
   - Click "Refresh" to update the current price
   - Click "View" to visit the product page
   - Click "Delete" to remove a product

4. **Logout**
   - Click the "Logout" button in the navigation bar

## Supported E-commerce Platforms

- **Amazon** - Full support for product pages
- **eBay** - Full support for product pages
- **Walmart** - Full support for product pages
- **Best Buy** - Full support for product pages
- **Target** - Full support for product pages
- **Flipkart** - Full support for Indian e-commerce
- **ElegantDream** (elegantdream.in) - Full support with API integration
- **Generic e-commerce sites** - Basic support with standard HTML structure

## RAG Implementation

In this project, MongoDB acts as the main knowledge base because it stores the actual readable product chunks, price history, and product data. Pinecone acts as the semantic retrieval layer. I do not pass vectors directly to the LLM. I use Pinecone to retrieve the most relevant chunk IDs, then fetch the original chunk text from MongoDB and pass that as context to Gemini.

### RAG Flow:
1. Product is scraped and saved.
2. Product price history is converted into chunks.
3. Chunks are stored in MongoDB.
4. Chunks are embedded using Gemini text-embedding.
5. Embeddings are stored in Pinecone along with lightweight metadata.
6. User asks a query.
7. Query is embedded.
8. Pinecone retrieves top_k = 5 chunk references.
9. MongoDB fetches actual chunk text based on the retrieved chunk IDs.
10. Gemini receives chunk text + metrics as context.
11. Gemini generates a competitive seller intelligence answer.

### Testing RAG Manually

1. Start the backend and ensure MongoDB is running.
2. Add one product normally via the UI or API.
3. Index the product:
   ```bash
   POST /api/rag/index-product/:productId
   ```
4. Query the RAG endpoint:
   ```bash
   POST /api/rag/query
   Content-Type: application/json
   
   {
     "query": "Is the current price near historical low and what should the seller do?",
     "topK": 5
   }
   ```
5. Expected response includes the generated `answer`, `retrievedChunks`, `sources`, and `topK`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all user's products (protected)
- `POST /api/products` - Add new product (protected)
- `PUT /api/products/:id/refresh` - Refresh product price (protected)
- `DELETE /api/products/:id` - Delete product (protected)

## Project Structure

```
mini3/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components (.jsx)
│   │   ├── context/       # React context (.jsx)
│   │   ├── pages/         # Page components (.jsx)
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── server/                # Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── index.js          # Server entry point
│   ├── .env.example
│   └── package.json
├── scraper/              # Python scraping service
│   ├── scraper_service.py  # Flask API
│   ├── requirements.txt    # Python dependencies
│   └── README.md
├── package.json          # Root package.json
└── README.md
```

## Security Notes

- Passwords are hashed using bcryptjs before storage
- JWT tokens expire after 7 days
- Protected routes require valid authentication token
- CORS is enabled for development (configure for production)
- Never commit `.env` files to version control

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check the `MONGODB_URI` in your `.env` file
- Verify MongoDB is accessible on the specified port

### Port Already in Use
- Change the `PORT` in `server/.env`
- Or stop the process using the port

### Scraping Fails
- Some websites have anti-scraping measures
- Ensure Python scraper service is running on port 5001
- Check Chrome browser is installed (required for Selenium)
- Try different product URLs
- The scraper works best with direct product pages
- Check scraper logs for detailed error messages

### Python Scraper Not Starting
- Ensure Python 3.8+ is installed
- Install all requirements: `pip install -r scraper/requirements.txt`
- Check if port 5001 is available
- Ensure Chrome browser is installed

### CORS Errors
- Ensure the backend is running on port 5000
- Check the proxy setting in `client/package.json`

## Future Enhancements

- [ ] Email notifications for price drops
- [ ] Price history charts
- [ ] Price alerts and thresholds
- [ ] Product comparison
- [ ] Mobile app
- [ ] Scheduled automatic price checks
- [ ] Export data to CSV

## License

MIT License - feel free to use this project for learning or personal use.

## Author

**Sangamesh Rajole** - *Initial work and development*

## Support

For issues or questions, please open an issue on the repository.

---

Built with ❤️ by Trishul S using the MERN stack
