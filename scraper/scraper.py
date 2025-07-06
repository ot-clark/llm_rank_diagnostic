import asyncio
import aiohttp
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
from typing import List, Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebScraper:
    def __init__(self):
        self.session = None
        self.visited_urls = set()
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def scrape_website(self, start_url: str, max_pages: int = 10) -> List[Dict[str, Any]]:
        """Scrape a website and return structured page data"""
        if not self.session:
            self.session = aiohttp.ClientSession()
            
        try:
            domain = urlparse(start_url).netloc
            pages = []
            
            # Start with the main page
            main_page = await self._scrape_page(start_url)
            if main_page:
                pages.append(main_page)
                self.visited_urls.add(start_url)
            
            # Find internal links
            internal_links = await self._find_internal_links(start_url, domain)
            
            # Scrape additional pages
            for link in internal_links[:max_pages - 1]:
                if link not in self.visited_urls:
                    page_data = await self._scrape_page(link)
                    if page_data:
                        pages.append(page_data)
                        self.visited_urls.add(link)
                        
                    # Small delay to be respectful
                    await asyncio.sleep(1)
            
            logger.info(f"Scraped {len(pages)} pages from {domain}")
            return pages
            
        except Exception as e:
            logger.error(f"Error scraping website: {e}")
            raise
    
    async def _scrape_page(self, url: str) -> Dict[str, Any]:
        """Scrape a single page and extract structured data"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            async with self.session.get(url, headers=headers, timeout=30) as response:
                if response.status != 200:
                    logger.warning(f"Failed to fetch {url}: {response.status}")
                    return None
                    
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Extract page data
                title = self._extract_title(soup)
                description = self._extract_description(soup)
                content = self._extract_content(soup)
                metadata = self._extract_metadata(soup)
                
                return {
                    'url': url,
                    'title': title,
                    'description': description,
                    'content': content,
                    'html': html,
                    'metadata': metadata
                }
                
        except Exception as e:
            logger.error(f"Error scraping page {url}: {e}")
            return None
    
    async def _find_internal_links(self, start_url: str, domain: str) -> List[str]:
        """Find internal links from the main page"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            async with self.session.get(start_url, headers=headers, timeout=30) as response:
                if response.status != 200:
                    return []
                    
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                links = set()
                
                # Find all links
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    
                    # Convert relative URLs to absolute
                    absolute_url = urljoin(start_url, href)
                    
                    # Check if it's an internal link
                    if urlparse(absolute_url).netloc == domain:
                        # Filter out common non-content URLs
                        if not self._is_non_content_url(absolute_url):
                            links.add(absolute_url)
                
                # Try to find sitemap
                sitemap_links = await self._find_sitemap_links(start_url, domain)
                links.update(sitemap_links)
                
                return list(links)
                
        except Exception as e:
            logger.error(f"Error finding internal links: {e}")
            return []
    
    async def _find_sitemap_links(self, start_url: str, domain: str) -> List[str]:
        """Find links from sitemap if available"""
        links = set()
        
        # Common sitemap locations
        sitemap_urls = [
            f"{urlparse(start_url).scheme}://{domain}/sitemap.xml",
            f"{urlparse(start_url).scheme}://{domain}/sitemap_index.xml",
            f"{urlparse(start_url).scheme}://{domain}/sitemap/sitemap.xml"
        ]
        
        for sitemap_url in sitemap_urls:
            try:
                async with self.session.get(sitemap_url, timeout=10) as response:
                    if response.status == 200:
                        xml = await response.text()
                        soup = BeautifulSoup(xml, 'xml')
                        
                        for loc in soup.find_all('loc'):
                            url = loc.text.strip()
                            if urlparse(url).netloc == domain:
                                links.add(url)
                                
                        break  # Found a working sitemap
                        
            except Exception as e:
                logger.debug(f"Could not fetch sitemap {sitemap_url}: {e}")
                continue
        
        return list(links)
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract page title"""
        title = soup.find('title')
        if title:
            return title.get_text().strip()
        
        # Fallback to h1
        h1 = soup.find('h1')
        if h1:
            return h1.get_text().strip()
        
        return ""
    
    def _extract_description(self, soup: BeautifulSoup) -> str:
        """Extract page description"""
        # Try meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            return meta_desc['content'].strip()
        
        # Try Open Graph description
        og_desc = soup.find('meta', attrs={'property': 'og:description'})
        if og_desc and og_desc.get('content'):
            return og_desc['content'].strip()
        
        return ""
    
    def _extract_content(self, soup: BeautifulSoup) -> str:
        """Extract main content from page"""
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Try to find main content area
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile(r'content|main|post'))
        
        if main_content:
            text = main_content.get_text()
        else:
            # Fallback to body text
            text = soup.get_text()
        
        # Clean up text
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n+', '\n', text)
        text = text.strip()
        
        # Limit length
        return text[:10000]
    
    def _extract_metadata(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract additional metadata"""
        metadata = {
            'headings': [],
            'links': [],
            'images': [],
            'meta_tags': {}
        }
        
        # Extract headings
        for i in range(1, 7):
            headings = soup.find_all(f'h{i}')
            metadata['headings'].extend([h.get_text().strip() for h in headings])
        
        # Extract links
        links = soup.find_all('a', href=True)
        metadata['links'] = [link['href'] for link in links]
        
        # Extract images
        images = soup.find_all('img')
        metadata['images'] = [img.get('alt', '') for img in images if img.get('alt')]
        
        # Extract meta tags
        meta_tags = soup.find_all('meta')
        for meta in meta_tags:
            name = meta.get('name') or meta.get('property')
            content = meta.get('content')
            if name and content:
                metadata['meta_tags'][name] = content
        
        return metadata
    
    def _is_non_content_url(self, url: str) -> bool:
        """Check if URL is likely not a content page"""
        non_content_patterns = [
            r'/login',
            r'/signup',
            r'/cart',
            r'/checkout',
            r'/admin',
            r'/api/',
            r'\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar)$',
            r'#',
            r'mailto:',
            r'tel:'
        ]
        
        for pattern in non_content_patterns:
            if re.search(pattern, url, re.IGNORECASE):
                return True
        
        return False 