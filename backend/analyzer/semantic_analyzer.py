import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
from typing import Dict, List, Tuple, Optional
import json

class SemanticStructureAnalyzer:
    """
    Analyzes semantic structure of web pages for AI visibility scoring.
    """
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; LLMRankDiagnostic/1.0)'
        })
    
    def analyze_page(self, url: str) -> Dict:
        """
        Analyze a single page for semantic structure.
        """
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            analysis = {
                'url': url,
                'score': 0,
                'h1Count': 0,
                'h2Count': 0,
                'h3Count': 0,
                'hierarchyIssues': [],
                'semanticTags': [],
                'missingElements': [],
                'internalLinks': [],
                'details': {}
            }
            
            # Analyze heading hierarchy
            analysis.update(self._analyze_heading_hierarchy(soup))
            
            # Analyze semantic tags
            analysis.update(self._analyze_semantic_tags(soup))
            
            # Check for missing elements
            analysis['missingElements'] = self._check_missing_elements(soup)
            
            # Analyze internal linking
            analysis['internalLinks'] = self._analyze_internal_links(soup, url)
            
            # Calculate score
            analysis['score'] = self._calculate_semantic_score(analysis)
            
            return analysis
            
        except Exception as e:
            return {
                'url': url,
                'error': str(e),
                'score': 0
            }
    
    def _analyze_heading_hierarchy(self, soup: BeautifulSoup) -> Dict:
        """Analyze H1 → H2 → H3 hierarchy consistency."""
        headings = {
            'h1': soup.find_all('h1'),
            'h2': soup.find_all('h2'),
            'h3': soup.find_all('h3'),
            'h4': soup.find_all('h4'),
            'h5': soup.find_all('h5'),
            'h6': soup.find_all('h6')
        }
        
        issues = []
        score_deductions = 0
        
        # Check for multiple H1s (should typically be 1 per page)
        if len(headings['h1']) > 1:
            issues.append(f"Multiple H1 tags found ({len(headings['h1'])})")
            score_deductions += 3
        
        # Check for missing H1
        if len(headings['h1']) == 0:
            issues.append("No H1 tag found")
            score_deductions += 5
        
        # Check for hierarchy gaps (H1 → H3 without H2)
        for h1 in headings['h1']:
            next_sibling = h1.find_next_sibling()
            while next_sibling:
                if next_sibling.name == 'h3':
                    # Check if there's an H2 between this H1 and H3
                    h2_between = h1.find_next_sibling('h2')
                    if not h2_between or h2_between.find_next_sibling('h3') != next_sibling:
                        issues.append("H3 found without preceding H2")
                        score_deductions += 2
                elif next_sibling.name == 'h1':
                    break
                next_sibling = next_sibling.find_next_sibling()
        
        return {
            'h1Count': len(headings['h1']),
            'h2Count': len(headings['h2']),
            'h3Count': len(headings['h3']),
            'hierarchyIssues': issues,
            'details': {
                'headingCounts': {k: len(v) for k, v in headings.items()},
                'scoreDeductions': score_deductions
            }
        }
    
    def _analyze_semantic_tags(self, soup: BeautifulSoup) -> Dict:
        """Analyze presence and usage of semantic HTML tags."""
        semantic_tags = {
            'table': soup.find_all('table'),
            'dl': soup.find_all('dl'),
            'ul': soup.find_all('ul'),
            'ol': soup.find_all('ol'),
            'blockquote': soup.find_all('blockquote'),
            'code': soup.find_all('code'),
            'pre': soup.find_all('pre'),
            'article': soup.find_all('article'),
            'section': soup.find_all('section'),
            'nav': soup.find_all('nav'),
            'aside': soup.find_all('aside'),
            'main': soup.find_all('main'),
            'header': soup.find_all('header'),
            'footer': soup.find_all('footer')
        }
        
        found_tags = [tag for tag, elements in semantic_tags.items() if len(elements) > 0]
        
        return {
            'semanticTags': found_tags,
            'details': {
                'tagCounts': {k: len(v) for k, v in semantic_tags.items()},
                'totalSemanticElements': sum(len(v) for v in semantic_tags.values())
            }
        }
    
    def _check_missing_elements(self, soup: BeautifulSoup) -> List[str]:
        """Check for commonly missing semantic elements."""
        missing = []
        
        # Check for definition lists
        if not soup.find('dl'):
            missing.append('definition lists')
        
        # Check for glossaries (dl with dt/dd pairs)
        dls = soup.find_all('dl')
        has_glossary = False
        for dl in dls:
            if dl.find('dt') and dl.find('dd'):
                has_glossary = True
                break
        if not has_glossary:
            missing.append('glossary')
        
        # Check for internal links
        internal_links = soup.find_all('a', href=True)
        if len(internal_links) < 3:  # Arbitrary threshold
            missing.append('internal links')
        
        # Check for structured data
        if not soup.find('script', type='application/ld+json'):
            missing.append('structured data')
        
        return missing
    
    def _analyze_internal_links(self, soup: BeautifulSoup, base_url: str) -> List[Dict]:
        """Analyze internal linking structure."""
        links = soup.find_all('a', href=True)
        internal_links = []
        
        base_domain = urlparse(base_url).netloc
        
        for link in links:
            href = link.get('href')
            if href:
                # Resolve relative URLs
                full_url = urljoin(base_url, href)
                link_domain = urlparse(full_url).netloc
                
                if link_domain == base_domain:
                    internal_links.append({
                        'text': link.get_text(strip=True)[:50],
                        'href': href,
                        'title': link.get('title', ''),
                        'is_navigation': bool(link.find_parent('nav'))
                    })
        
        return internal_links
    
    def _calculate_semantic_score(self, analysis: Dict) -> int:
        """Calculate semantic structure score (0-25)."""
        score = 25  # Start with perfect score
        
        # Deduct for hierarchy issues
        score -= analysis['details'].get('scoreDeductions', 0)
        
        # Deduct for missing elements
        score -= len(analysis['missingElements']) * 2
        
        # Bonus for good semantic tag usage
        semantic_tag_count = len(analysis['semanticTags'])
        if semantic_tag_count >= 8:
            score += 3
        elif semantic_tag_count >= 5:
            score += 2
        elif semantic_tag_count >= 3:
            score += 1
        
        # Bonus for internal linking
        if len(analysis['internalLinks']) >= 10:
            score += 2
        elif len(analysis['internalLinks']) >= 5:
            score += 1
        
        return max(0, min(25, score))  # Ensure score is between 0-25


class SchemaValidator:
    """
    Validates structured data and schema.org markup.
    """
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; LLMRankDiagnostic/1.0)'
        })
    
    def validate_page(self, url: str) -> Dict:
        """
        Validate structured data on a page.
        """
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            analysis = {
                'url': url,
                'score': 0,
                'hasStructuredData': False,
                'schemaTypes': [],
                'missingSchemas': [],
                'canonicalUrl': '',
                'lastmod': '',
                'sitemapEntry': False,
                'details': {}
            }
            
            # Check for JSON-LD structured data
            json_ld_scripts = soup.find_all('script', type='application/ld+json')
            if json_ld_scripts:
                analysis['hasStructuredData'] = True
                analysis['schemaTypes'] = self._extract_schema_types(json_ld_scripts)
            
            # Check for microdata
            microdata = soup.find_all(attrs={'itemtype': True})
            if microdata:
                analysis['hasStructuredData'] = True
                microdata_types = [item.get('itemtype', '').split('/')[-1] for item in microdata]
                analysis['schemaTypes'].extend(microdata_types)
            
            # Check canonical URL
            canonical = soup.find('link', rel='canonical')
            if canonical:
                analysis['canonicalUrl'] = canonical.get('href', '')
            
            # Check lastmod (from meta tags or structured data)
            lastmod = soup.find('meta', attrs={'name': 'lastmod'})
            if lastmod:
                analysis['lastmod'] = lastmod.get('content', '')
            
            # Check for sitemap entry (would need to fetch sitemap)
            analysis['sitemapEntry'] = self._check_sitemap_entry(url)
            
            # Identify missing schemas
            analysis['missingSchemas'] = self._identify_missing_schemas(analysis['schemaTypes'])
            
            # Calculate score
            analysis['score'] = self._calculate_schema_score(analysis)
            
            return analysis
            
        except Exception as e:
            return {
                'url': url,
                'error': str(e),
                'score': 0
            }
    
    def _extract_schema_types(self, scripts: List) -> List[str]:
        """Extract schema.org types from JSON-LD scripts."""
        types = []
        for script in scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict):
                    if '@type' in data:
                        types.append(data['@type'])
                    if '@graph' in data:
                        for item in data['@graph']:
                            if isinstance(item, dict) and '@type' in item:
                                types.append(item['@type'])
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and '@type' in item:
                            types.append(item['@type'])
            except json.JSONDecodeError:
                continue
        return list(set(types))  # Remove duplicates
    
    def _identify_missing_schemas(self, found_types: List[str]) -> List[str]:
        """Identify commonly missing schema types."""
        common_schemas = [
            'Organization', 'WebPage', 'Article', 'FAQPage', 
            'BreadcrumbList', 'Product', 'Service', 'Person'
        ]
        return [schema for schema in common_schemas if schema not in found_types]
    
    def _check_sitemap_entry(self, url: str) -> bool:
        """Check if URL is likely in sitemap (simplified check)."""
        # This would require fetching and parsing the sitemap
        # For now, return True if it's a main page
        parsed = urlparse(url)
        return parsed.path in ['', '/', '/index.html']
    
    def _calculate_schema_score(self, analysis: Dict) -> int:
        """Calculate schema validation score (0-20)."""
        score = 0
        
        # Base score for having structured data
        if analysis['hasStructuredData']:
            score += 10
        
        # Bonus for specific schema types
        score += len(analysis['schemaTypes']) * 2
        
        # Bonus for canonical URL
        if analysis['canonicalUrl']:
            score += 3
        
        # Bonus for lastmod
        if analysis['lastmod']:
            score += 2
        
        # Bonus for sitemap entry
        if analysis['sitemapEntry']:
            score += 3
        
        return min(20, score)  # Cap at 20


if __name__ == "__main__":
    # Example usage
    analyzer = SemanticStructureAnalyzer()
    validator = SchemaValidator()
    
    test_url = "https://example.com"
    
    print("Semantic Structure Analysis:")
    semantic_result = analyzer.analyze_page(test_url)
    print(json.dumps(semantic_result, indent=2))
    
    print("\nSchema Validation:")
    schema_result = validator.validate_page(test_url)
    print(json.dumps(schema_result, indent=2)) 