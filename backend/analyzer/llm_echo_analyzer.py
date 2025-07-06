import requests
from bs4 import BeautifulSoup
import re
from typing import Dict, List, Tuple, Optional
import json
import time
from urllib.parse import urlparse
import numpy as np

class LLMEchoEstimator:
    """
    Estimates LLM echo probability by simulating prompts and measuring response overlap.
    """
    
    def __init__(self, openai_api_key: Optional[str] = None):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; LLMRankDiagnostic/1.0)'
        })
        self.openai_api_key = openai_api_key
        
        # Common prompts that might retrieve content
        self.test_prompts = [
            "How to write AI-visible articles?",
            "Website optimization for search engines",
            "Content structure best practices",
            "SEO tips for better rankings",
            "How to improve website visibility?",
            "Content marketing strategies",
            "Digital marketing best practices",
            "Website performance optimization",
            "User experience design tips",
            "Online business growth strategies"
        ]
    
    def estimate_echo_probability(self, url: str) -> Dict:
        """
        Estimate the probability that this content would be echoed by LLMs.
        """
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract content
            content = self._extract_content(soup)
            
            analysis = {
                'url': url,
                'score': 0,
                'overlapPercentage': 0.0,
                'exampleMatches': [],
                'testPrompts': self.test_prompts,
                'details': {}
            }
            
            # Analyze content characteristics
            content_analysis = self._analyze_content_characteristics(content)
            
            # Simulate prompt matching (without actual API calls for now)
            prompt_matches = self._simulate_prompt_matching(content, content_analysis)
            
            # Calculate overlap percentage
            analysis['overlapPercentage'] = self._calculate_overlap_percentage(prompt_matches)
            
            # Generate example matches
            analysis['exampleMatches'] = self._generate_example_matches(content, prompt_matches)
            
            # Calculate score
            analysis['score'] = self._calculate_echo_score(analysis)
            
            return analysis
            
        except Exception as e:
            return {
                'url': url,
                'error': str(e),
                'score': 0
            }
    
    def _extract_content(self, soup: BeautifulSoup) -> str:
        """Extract main content from the page."""
        # Remove navigation, footer, ads, etc.
        for element in soup.find_all(['nav', 'footer', 'aside', 'script', 'style', 'header']):
            element.decompose()
        
        # Extract text from main content areas
        content_areas = []
        
        # Look for main content containers
        main_selectors = [
            'main',
            '[role="main"]',
            '.main-content',
            '.content',
            '.post-content',
            '.article-content',
            '#content',
            '#main'
        ]
        
        for selector in main_selectors:
            elements = soup.select(selector)
            for element in elements:
                content_areas.append(element.get_text(strip=True))
        
        # If no main content found, use body
        if not content_areas:
            body = soup.find('body')
            if body:
                content_areas.append(body.get_text(strip=True))
        
        # Combine and clean content
        content = ' '.join(content_areas)
        content = re.sub(r'\s+', ' ', content).strip()
        
        return content
    
    def _analyze_content_characteristics(self, content: str) -> Dict:
        """Analyze content characteristics that affect LLM echo probability."""
        words = content.lower().split()
        
        analysis = {
            'wordCount': len(words),
            'uniqueWords': len(set(words)),
            'avgWordLength': np.mean([len(word) for word in words]) if words else 0,
            'sentenceCount': len(re.split(r'[.!?]+', content)),
            'paragraphCount': len(content.split('\n\n')),
            'hasLists': bool(re.search(r'^\s*[-*•]\s', content, re.MULTILINE)),
            'hasNumbers': bool(re.search(r'\d+', content)),
            'hasLinks': bool(re.search(r'http[s]?://', content)),
            'hasCode': bool(re.search(r'`.*`|```.*```', content)),
            'hasQuotes': bool(re.search(r'["\''].*["\']', content)),
            'hasQuestions': bool(re.search(r'\?', content)),
            'hasDefinitions': bool(re.search(r'\b(means|refers to|is defined as|refers to)\b', content, re.IGNORECASE)),
            'hasExamples': bool(re.search(r'\b(for example|such as|including|like)\b', content, re.IGNORECASE)),
            'hasSteps': bool(re.search(r'\b(step|first|second|third|finally|next|then)\b', content, re.IGNORECASE))
        }
        
        return analysis
    
    def _simulate_prompt_matching(self, content: str, analysis: Dict) -> List[Dict]:
        """Simulate how well content matches different prompts."""
        matches = []
        
        # Define prompt categories and their relevance indicators
        prompt_categories = {
            'how_to': {
                'prompts': ['How to write AI-visible articles?', 'How to improve website visibility?'],
                'indicators': ['how to', 'steps', 'guide', 'tutorial', 'instructions'],
                'weight': 0.8
            },
            'optimization': {
                'prompts': ['Website optimization for search engines', 'Content structure best practices'],
                'indicators': ['optimize', 'improve', 'best practices', 'structure', 'seo'],
                'weight': 0.7
            },
            'marketing': {
                'prompts': ['Content marketing strategies', 'Digital marketing best practices'],
                'indicators': ['marketing', 'strategy', 'content', 'digital', 'campaign'],
                'weight': 0.6
            },
            'performance': {
                'prompts': ['Website performance optimization', 'User experience design tips'],
                'indicators': ['performance', 'speed', 'user experience', 'ux', 'design'],
                'weight': 0.5
            },
            'business': {
                'prompts': ['Online business growth strategies'],
                'indicators': ['business', 'growth', 'revenue', 'customers', 'sales'],
                'weight': 0.4
            }
        }
        
        content_lower = content.lower()
        
        for category, config in prompt_categories.items():
            for prompt in config['prompts']:
                # Calculate relevance score
                relevance_score = 0
                for indicator in config['indicators']:
                    if indicator in content_lower:
                        relevance_score += 1
                
                # Normalize relevance score
                relevance_score = min(1.0, relevance_score / len(config['indicators']))
                
                # Apply category weight
                final_score = relevance_score * config['weight']
                
                matches.append({
                    'prompt': prompt,
                    'category': category,
                    'relevanceScore': final_score,
                    'matchedIndicators': [ind for ind in config['indicators'] if ind in content_lower]
                })
        
        return matches
    
    def _calculate_overlap_percentage(self, matches: List[Dict]) -> float:
        """Calculate overall overlap percentage."""
        if not matches:
            return 0.0
        
        # Calculate average relevance score
        avg_relevance = np.mean([match['relevanceScore'] for match in matches])
        
        # Convert to percentage
        overlap_percentage = avg_relevance * 100
        
        return min(100.0, overlap_percentage)
    
    def _generate_example_matches(self, content: str, matches: List[Dict]) -> List[str]:
        """Generate example matches for display."""
        examples = []
        
        # Sort matches by relevance
        sorted_matches = sorted(matches, key=lambda x: x['relevanceScore'], reverse=True)
        
        for match in sorted_matches[:3]:  # Top 3 matches
            if match['relevanceScore'] > 0.3:  # Only include relevant matches
                examples.append(f"Content matches query '{match['prompt']}' (relevance: {match['relevanceScore']:.2f})")
        
        # Add generic examples based on content characteristics
        if len(content) > 2000:
            examples.append("Content is substantial and comprehensive")
        
        if any(match['category'] == 'how_to' for match in matches):
            examples.append("Contains instructional or how-to content")
        
        if any(match['category'] == 'optimization' for match in matches):
            examples.append("Includes optimization and best practices")
        
        return examples[:5]  # Limit to 5 examples
    
    def _calculate_echo_score(self, analysis: Dict) -> int:
        """
        Calculate LLM echo probability score (0-10).
        """
        score = 0
        
        # Base score from overlap percentage
        score += int(analysis['overlapPercentage'] / 10)  # 0-10 points
        
        # Bonus for having example matches
        if analysis['exampleMatches']:
            score += min(3, len(analysis['exampleMatches']))
        
        # Bonus for high overlap
        if analysis['overlapPercentage'] > 70:
            score += 2
        elif analysis['overlapPercentage'] > 50:
            score += 1
        
        return min(10, score)  # Cap at 10


class FreshnessAnalyzer:
    """
    Analyzes content freshness and update frequency.
    """
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; LLMRankDiagnostic/1.0)'
        })
    
    def analyze_freshness(self, url: str) -> Dict:
        """
        Analyze content freshness and update frequency.
        """
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            analysis = {
                'url': url,
                'score': 0,
                'lastModified': '',
                'cacheHeaders': {},
                'age': 0,
                'details': {}
            }
            
            # Extract last modified date
            analysis['lastModified'] = self._extract_last_modified(response, soup)
            
            # Extract cache headers
            analysis['cacheHeaders'] = self._extract_cache_headers(response)
            
            # Calculate content age
            analysis['age'] = self._calculate_content_age(analysis['lastModified'])
            
            # Calculate score
            analysis['score'] = self._calculate_freshness_score(analysis)
            
            return analysis
            
        except Exception as e:
            return {
                'url': url,
                'error': str(e),
                'score': 0
            }
    
    def _extract_last_modified(self, response: requests.Response, soup: BeautifulSoup) -> str:
        """Extract last modified date from various sources."""
        # Check HTTP headers first
        if 'last-modified' in response.headers:
            return response.headers['last-modified']
        
        # Check meta tags
        meta_lastmod = soup.find('meta', attrs={'name': 'lastmod'})
        if meta_lastmod:
            return meta_lastmod.get('content', '')
        
        # Check structured data
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_ld_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and 'dateModified' in data:
                    return data['dateModified']
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and 'dateModified' in item:
                            return item['dateModified']
            except json.JSONDecodeError:
                continue
        
        # Check for date in content (simplified)
        date_patterns = [
            r'\b\d{4}-\d{2}-\d{2}\b',  # YYYY-MM-DD
            r'\b\d{1,2}/\d{1,2}/\d{4}\b',  # MM/DD/YYYY
            r'\b\d{1,2}-\d{1,2}-\d{4}\b',  # MM-DD-YYYY
        ]
        
        content = soup.get_text()
        for pattern in date_patterns:
            matches = re.findall(pattern, content)
            if matches:
                return matches[0]  # Return first date found
        
        return ''
    
    def _extract_cache_headers(self, response: requests.Response) -> Dict:
        """Extract cache-related headers."""
        cache_headers = {}
        
        cache_fields = [
            'cache-control', 'etag', 'last-modified', 'expires',
            'age', 'pragma', 'vary'
        ]
        
        for field in cache_fields:
            if field in response.headers:
                cache_headers[field] = response.headers[field]
        
        return cache_headers
    
    def _calculate_content_age(self, last_modified: str) -> int:
        """Calculate content age in days."""
        if not last_modified:
            return 365  # Assume old if no date found
        
        try:
            from datetime import datetime
            import email.utils
            
            # Parse various date formats
            if ',' in last_modified:
                # RFC 2822 format
                parsed_date = email.utils.parsedate_to_datetime(last_modified)
            else:
                # Try ISO format
                parsed_date = datetime.fromisoformat(last_modified.replace('Z', '+00:00'))
            
            age = (datetime.now() - parsed_date).days
            return max(0, age)
            
        except Exception:
            return 365  # Default to old if parsing fails
    
    def _calculate_freshness_score(self, analysis: Dict) -> int:
        """
        Calculate freshness score (0-10).
        """
        score = 0
        
        # Score based on content age
        age = analysis['age']
        if age == 0:
            score += 5  # Very recent
        elif age <= 7:
            score += 4  # Within a week
        elif age <= 30:
            score += 3  # Within a month
        elif age <= 90:
            score += 2  # Within 3 months
        elif age <= 365:
            score += 1  # Within a year
        else:
            score += 0  # Very old
        
        # Bonus for having last modified date
        if analysis['lastModified']:
            score += 2
        
        # Bonus for cache headers
        if analysis['cacheHeaders']:
            score += 2
        
        # Bonus for recent cache headers
        if 'cache-control' in analysis['cacheHeaders']:
            cache_control = analysis['cacheHeaders']['cache-control']
            if 'max-age' in cache_control and '3600' in cache_control:
                score += 1  # Good cache settings
        
        return min(10, score)  # Cap at 10


if __name__ == "__main__":
    # Example usage
    estimator = LLMEchoEstimator()
    freshness_analyzer = FreshnessAnalyzer()
    
    test_url = "https://example.com"
    
    print("LLM Echo Probability Analysis:")
    echo_result = estimator.estimate_echo_probability(test_url)
    print(json.dumps(echo_result, indent=2))
    
    print("\nFreshness Analysis:")
    freshness_result = freshness_analyzer.analyze_freshness(test_url)
    print(json.dumps(freshness_result, indent=2)) 