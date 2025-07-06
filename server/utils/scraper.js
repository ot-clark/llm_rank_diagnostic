const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

// Scrape website and return array of pages
async function scrapeWebsite(url) {
  try {
    console.log(`Starting scrape for: ${url}`);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set user agent to avoid being blocked
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the main page
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Get the main page content
    const mainPageContent = await page.content();
    const $ = cheerio.load(mainPageContent);
    
    // Extract sitemap URL if available
    let sitemapUrl = null;
    $('link[rel="sitemap"]').each((i, elem) => {
      sitemapUrl = $(elem).attr('href');
    });
    
    // If no sitemap link found, try common sitemap locations
    if (!sitemapUrl) {
      const domain = new URL(url).origin;
      const commonSitemaps = [
        `${domain}/sitemap.xml`,
        `${domain}/sitemap_index.xml`,
        `${domain}/sitemap/sitemap.xml`
      ];
      
      for (const sitemap of commonSitemaps) {
        try {
          const response = await axios.get(sitemap, { timeout: 5000 });
          if (response.status === 200) {
            sitemapUrl = sitemap;
            break;
          }
        } catch (error) {
          // Continue to next sitemap
        }
      }
    }
    
    // Get all internal links from the main page
    const internalLinks = new Set();
    const domain = new URL(url).hostname;
    
    $('a[href]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        try {
          const fullUrl = new URL(href, url).href;
          if (new URL(fullUrl).hostname === domain) {
            internalLinks.add(fullUrl);
          }
        } catch (error) {
          // Invalid URL, skip
        }
      }
    });
    
    // If we have a sitemap, parse it for additional URLs
    if (sitemapUrl) {
      try {
        const sitemapResponse = await axios.get(sitemapUrl);
        const sitemap$ = cheerio.load(sitemapResponse.data, { xmlMode: true });
        
        sitemap$('loc').each((i, elem) => {
          const sitemapUrl = sitemap$(elem).text();
          if (sitemapUrl && new URL(sitemapUrl).hostname === domain) {
            internalLinks.add(sitemapUrl);
          }
        });
      } catch (error) {
        console.log('Failed to parse sitemap:', error.message);
      }
    }
    
    // Limit to first 10 pages for demo purposes
    const urlsToScrape = Array.from(internalLinks).slice(0, 10);
    urlsToScrape.unshift(url); // Add main page first
    
    const scrapedPages = [];
    
    // Scrape each page
    for (const pageUrl of urlsToScrape) {
      try {
        console.log(`Scraping: ${pageUrl}`);
        
        await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        const pageContent = await page.content();
        const page$ = cheerio.load(pageContent);
        
        // Extract page data
        const title = page$('title').text().trim() || page$('h1').first().text().trim();
        const description = page$('meta[name="description"]').attr('content') || 
                           page$('meta[property="og:description"]').attr('content') || '';
        
        // Extract main content (simplified)
        const mainContent = page$('main, article, .content, .main, #content, #main').text() || 
                           page$('body').text();
        
        // Clean up content
        const cleanContent = mainContent
          .replace(/\s+/g, ' ')
          .replace(/\n+/g, '\n')
          .trim()
          .substring(0, 10000); // Limit content length
        
        const pageData = {
          url: pageUrl,
          title: title,
          description: description,
          html: pageContent,
          content: cleanContent,
          metadata: {
            title: title,
            description: description,
            h1: page$('h1').text().trim(),
            h2: page$('h2').map((i, el) => page$(el).text().trim()).get(),
            h3: page$('h3').map((i, el) => page$(el).text().trim()).get(),
            links: page$('a[href]').map((i, el) => page$(el).attr('href')).get(),
            images: page$('img').map((i, el) => page$(el).attr('alt')).get()
          }
        };
        
        scrapedPages.push(pageData);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`Failed to scrape ${pageUrl}:`, error.message);
      }
    }
    
    await browser.close();
    
    console.log(`Scraped ${scrapedPages.length} pages`);
    return scrapedPages;
    
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }
}

// Parse sitemap XML
async function parseSitemap(sitemapUrl) {
  try {
    const response = await axios.get(sitemapUrl);
    const $ = cheerio.load(response.data, { xmlMode: true });
    const urls = [];
    
    $('loc').each((i, elem) => {
      urls.push($(elem).text());
    });
    
    return urls;
  } catch (error) {
    console.error('Sitemap parsing error:', error);
    return [];
  }
}

module.exports = {
  scrapeWebsite,
  parseSitemap
}; 