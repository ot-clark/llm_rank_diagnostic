# LLM Rank Diagnostic

A comprehensive web application that analyzes website URLs for AI visibility and LLM-friendliness, providing page-by-page analysis with overlays, suggestions, and visualizations.

## 🎯 **Objective Scoring System**

The application uses a **deterministic, objective scoring system** based on concrete, measurable criteria instead of random scores. Each website receives a consistent score across multiple analyses.

### **Scoring Dimensions (Total: 100 points)**

#### **1. Semantic Structure (25 points)**
- **H1 → H2 → H3 hierarchy consistency** (5 points)
- **Semantic HTML tags** (`<table>`, `<dl>`, `<ul>`, `<ol>`, `<blockquote>`, `<code>`) (10 points)
- **Definition lists and glossaries** (5 points)
- **Internal linking structure** (5 points)

#### **2. Schema Validation (20 points)**
- **JSON-LD structured data** (8 points)
- **Schema.org types** (Article, FAQPage, BreadcrumbList, etc.) (6 points)
- **Canonical URL presence** (3 points)
- **Lastmod tags & sitemap entries** (3 points)

#### **3. Embedding Clarity (20 points)**
- **Term consistency index** (6 points)
- **Self-containment score** (6 points)
- **Redundancy detection** (4 points)
- **Section clarity** (768+ dimension embeddings) (4 points)

#### **4. GPTBot Accessibility (15 points)**
- **HTTP status codes** (200 OK) (5 points)
- **Redirect handling** (3 points)
- **No Cloudflare/Captcha blocks** (5 points)
- **GPTBot user agent access** (2 points)

#### **5. Freshness (10 points)**
- **Lastmod timestamps** (4 points)
- **Cache headers optimization** (3 points)
- **Content age assessment** (3 points)

#### **6. LLM Echo Probability (10 points)**
- **Prompt simulation** (10 test queries) (4 points)
- **Cosine similarity analysis** (3 points)
- **Response overlap percentage** (3 points)

## 🚀 **Features**

### **1. Comprehensive Analysis**
- **Page-by-page scoring** with detailed breakdowns
- **Radar chart visualization** showing performance across all dimensions
- **Detailed scoring criteria** with specific recommendations
- **Consistent, objective results** (no random scoring)

### **2. Live Overlay System**
- **Real website embedding** in iframe
- **Interactive highlighting** similar to Grammarly
- **Severity-based overlays**:
  - 🔴 **High** - Critical issues (red highlighting)
  - 🟡 **Medium** - Important improvements (yellow highlighting)
  - 🔵 **Low** - Minor suggestions (blue highlighting)
- **Click-to-view suggestions** with specific recommendations

### **3. Advanced Analytics**
- **Semantic structure analysis** with heading hierarchy validation
- **Schema.org validation** with structured data detection
- **Embedding-based content analysis** for clarity and consistency
- **GPTBot accessibility testing** to ensure AI crawler access
- **Content freshness evaluation** with cache and timestamp analysis
- **LLM echo probability estimation** through prompt simulation

## 🛠 **Tech Stack**

- **Frontend**: Next.js 15, React, Tailwind CSS, Framer Motion
- **Backend**: Express.js, Node.js
- **Analysis Engine**: Python microservice with BeautifulSoup, OpenAI embeddings
- **Database**: PostgreSQL, Redis
- **Web Scraping**: Puppeteer, requests
- **AI Integration**: OpenAI API for embeddings and analysis

## 📊 **Scoring Examples**

### **High-Performing Site (80+ points)**
- ✅ Proper heading hierarchy (H1 → H2 → H3)
- ✅ Rich semantic HTML (tables, lists, blockquotes)
- ✅ Comprehensive structured data (JSON-LD)
- ✅ GPTBot accessible with no blocks
- ✅ Recent content with proper cache headers
- ✅ High LLM echo probability

### **Medium-Performing Site (60-79 points)**
- ⚠️ Some heading structure issues
- ⚠️ Limited semantic HTML elements
- ⚠️ Basic structured data
- ⚠️ Generally accessible to GPTBot
- ⚠️ Moderate content freshness
- ⚠️ Moderate LLM echo probability

### **Low-Performing Site (<60 points)**
- ❌ Poor heading hierarchy
- ❌ Missing semantic HTML elements
- ❌ No structured data
- ❌ GPTBot access issues
- ❌ Outdated content
- ❌ Low LLM echo probability

## 🎨 **UI Components**

### **Analysis Dashboard**
- **Overall score card** with color-coded performance
- **Radar chart** showing dimensional breakdown
- **Detailed scoring criteria** with specific metrics
- **Page-by-page analysis** with individual scores
- **Top recommendations** for improvement

### **Overlay Explorer**
- **Real website viewer** with embedded iframe
- **Interactive highlighting** on content issues
- **Sidebar navigation** between pages
- **Issue details panel** with specific suggestions
- **Toggle overlays** on/off for comparison

## 🔧 **Installation & Setup**

```bash
# Clone the repository
git clone <repository-url>
cd llm_rank_diagnostic

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your OpenAI API key to .env

# Start the development server
npm run dev
```

## 📈 **Usage**

1. **Enter a domain** (e.g., "descript.com")
2. **View comprehensive analysis** with objective scoring
3. **Explore the radar chart** to understand dimensional performance
4. **Click "View Live Overlays"** to see issues on the actual website
5. **Browse pages** and click highlighted text for specific suggestions
6. **Implement recommendations** to improve AI visibility

## 🎯 **Use Cases**

- **Content creators** optimizing for AI visibility
- **SEO professionals** improving search engine performance
- **Web developers** ensuring LLM-friendly content structure
- **Marketing teams** maximizing content discoverability
- **Business owners** improving online presence

## 🔮 **Future Enhancements**

- **Real-time analysis** with live website crawling
- **Competitive analysis** comparing multiple domains
- **Historical tracking** of score improvements over time
- **Custom scoring weights** for different industries
- **API integration** for automated analysis workflows

## 📝 **License**

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the AI-first web**
