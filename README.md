# LLM Rank Diagnostic

A comprehensive web application that analyzes website content for LLM (Large Language Model) visibility and ranking potential. Get AI-powered insights with visual overlays and actionable recommendations.

## 🚀 Features

- **AI Visibility Scoring**: Comprehensive analysis across 5 key dimensions
- **Visual Overlays**: Grammarly-style highlights showing content issues
- **Page-by-Page Analysis**: Detailed breakdown for each page on your website
- **Interactive Explorer**: Navigate through pages with real-time suggestions
- **Modern UI**: Beautiful, responsive design with smooth animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Scraping**: Puppeteer, Cheerio
- **LLM Integration**: OpenAI API (GPT-4)
- **Database**: PostgreSQL
- **Caching**: Redis
- **Python Service**: FastAPI for advanced scraping and scoring

## 📋 Prerequisites

- Node.js 18+ 
- Python 3.8+
- PostgreSQL
- Redis
- OpenAI API key

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd llm_rank_diagnostic

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install Python dependencies
cd ../scraper
pip install -r requirements.txt
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/llm_diagnostic

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Server Ports
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Database Setup

```bash
# Start PostgreSQL and create database
psql -U postgres
CREATE DATABASE llm_diagnostic;
\q

# Run the schema
psql -U postgres -d llm_diagnostic -f database/schema.sql
```

### 4. Start Services

```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start PostgreSQL (if not running as service)
pg_ctl start

# Terminal 3: Start Python scraper service
cd scraper
python main.py

# Terminal 4: Start backend server
cd server
npm run dev

# Terminal 5: Start frontend
npm run dev
```

### 5. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

1. **Enter Website URL**: Input any website URL on the landing page
2. **Wait for Analysis**: The system will scrape and analyze your website
3. **View Results**: See your AI visibility score and recommendations
4. **Explore Overlays**: Click "Explore Overlays" to see visual suggestions
5. **Implement Changes**: Follow the recommendations to improve your content

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Python        │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (FastAPI)     │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   OpenAI API    │
│   Database      │    │     Cache       │    │   (External)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Scoring Dimensions

The application scores content across 5 key dimensions:

1. **Structure & Semantics (25 pts)**: Content organization and markup
2. **Relevance & Intent (25 pts)**: Topic relevance and user intent matching
3. **Token Efficiency (20 pts)**: Information density and conciseness
4. **Link Graph (15 pts)**: Internal linking and external references
5. **LLM Output Likelihood (15 pts)**: Probability of appearing in AI responses

## 🎨 Features in Detail

### Landing Page
- Modern, futuristic design with dark theme
- URL input with validation
- Animated demo preview
- Feature highlights

### Analysis Dashboard
- Overall AI visibility score
- Radar chart showing score breakdown
- Top 3 improvement recommendations
- Page-by-page score list

### Overlay Explorer
- Visual highlights on content
- Tooltip explanations for each issue
- Severity-based color coding
- Sidebar navigation between pages
- Interactive suggestions

## 🔧 Configuration

### Customizing Scoring

Edit `server/utils/scorer.js` to modify the scoring algorithm:

```javascript
// Adjust scoring weights
const structureSemantics = scoreStructureSemantics(content, title);
const relevanceIntent = scoreRelevanceIntent(content, title, description);
// ... etc
```

### Adding New Analysis Types

Extend the Python service in `scraper/scorer.py`:

```python
async def score_content(self, content, title, description, metadata):
    # Add your custom analysis logic here
    pass
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env
   - Verify database exists

2. **Redis Connection Error**
   - Start Redis server: `redis-server`
   - Check REDIS_URL in .env

3. **OpenAI API Error**
   - Verify OPENAI_API_KEY is set
   - Check API key permissions
   - Ensure sufficient credits

4. **Scraping Issues**
   - Some sites may block automated requests
   - Check robots.txt compliance
   - Adjust user agent in scraper

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=true npm run dev

# Python service
python main.py --debug
```

## 📈 Performance

- **Caching**: Redis caches analysis results for 1 hour
- **Concurrent Scraping**: Up to 10 pages analyzed simultaneously
- **Rate Limiting**: 1-second delay between page requests
- **Timeout Handling**: 30-second timeout for page loads

## 🔒 Security

- Input validation on all endpoints
- CORS configuration for frontend-backend communication
- Environment variable protection
- Rate limiting on API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the troubleshooting section
- Review the architecture documentation
- Open an issue on GitHub

## 🚀 Deployment

### Production Setup

1. **Environment Variables**: Set production values
2. **Database**: Use managed PostgreSQL service
3. **Redis**: Use managed Redis service
4. **Scaling**: Deploy Python service separately
5. **Monitoring**: Add logging and monitoring

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

---

**Built with ❤️ for better AI visibility**
