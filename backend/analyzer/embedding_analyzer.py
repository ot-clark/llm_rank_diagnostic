import requests
from bs4 import BeautifulSoup
import re
from typing import Dict, List, Tuple, Optional
import numpy as np
from collections import Counter
import json

class EmbeddingClarityAnalyzer:
    """
    Analyzes content clarity using embedding-based metrics.
    """
    
    def __init__(self, openai_api_key: Optional[str] = None):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; LLMRankDiagnostic/1.0)'
        })
        self.openai_api_key = openai_api_key
    
    def analyze_page(self, url: str) -> Dict:
        """
        Analyze content clarity using embedding-based metrics.
        """
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract text content
            text_content = self._extract_text_content(soup)
            
            # Chunk content by sections
            sections = self._chunk_by_sections(soup)
            
            analysis = {
                'url': url,
                'score': 0,
                'termConsistency': 0.0,
                'selfContainment': 0.0,
                'redundancyScore': 0.0,
                'sections': sections,
                'details': {}
            }
            
            # Calculate term consistency
            analysis['termConsistency'] = self._calculate_term_consistency(text_content)
            
            # Calculate self-containment score
            analysis['selfContainment'] = self._calculate_self_containment(sections)
            
            # Calculate redundancy score
            analysis['redundancyScore'] = self._calculate_redundancy_score(text_content)
            
            # Calculate overall score
            analysis['score'] = self._calculate_clarity_score(analysis)
            
            return analysis
            
        except Exception as e:
            return {
                'url': url,
                'error': str(e),
                'score': 0
            }
    
    def _extract_text_content(self, soup: BeautifulSoup) -> str:
        """Extract clean text content from the page."""
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Get text and clean it
        text = soup.get_text()
        
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
    
    def _chunk_by_sections(self, soup: BeautifulSoup) -> List[Dict]:
        """Chunk content by heading sections."""
        sections = []
        current_section = {'title': 'Introduction', 'content': '', 'clarity': 0.0}
        
        for element in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div']):
            if element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                # Save previous section if it has content
                if current_section['content'].strip():
                    current_section['clarity'] = self._calculate_section_clarity(current_section['content'])
                    sections.append(current_section)
                
                # Start new section
                current_section = {
                    'title': element.get_text(strip=True),
                    'content': '',
                    'clarity': 0.0
                }
            else:
                # Add content to current section
                content = element.get_text(strip=True)
                if content:
                    current_section['content'] += ' ' + content
        
        # Add final section
        if current_section['content'].strip():
            current_section['clarity'] = self._calculate_section_clarity(current_section['content'])
            sections.append(current_section)
        
        return sections
    
    def _calculate_term_consistency(self, text: str) -> float:
        """
        Calculate term consistency index (0-1).
        Higher values indicate more consistent use of domain-specific terms.
        """
        # Extract words and filter
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Remove common stop words
        stop_words = {
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
            'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
            'this', 'that', 'these', 'those', 'a', 'an', 'as', 'from', 'into', 'through',
            'during', 'before', 'after', 'above', 'below', 'between', 'among'
        }
        
        filtered_words = [word for word in words if word not in stop_words]
        
        if not filtered_words:
            return 0.0
        
        # Calculate term frequency
        word_freq = Counter(filtered_words)
        
        # Calculate consistency (how evenly distributed the terms are)
        total_words = len(filtered_words)
        unique_words = len(word_freq)
        
        if unique_words == 0:
            return 0.0
        
        # Calculate entropy-based consistency
        entropy = 0
        for count in word_freq.values():
            p = count / total_words
            if p > 0:
                entropy -= p * np.log2(p)
        
        # Normalize entropy to 0-1 scale
        max_entropy = np.log2(unique_words)
        if max_entropy == 0:
            return 0.0
        
        consistency = entropy / max_entropy
        
        return min(1.0, consistency)
    
    def _calculate_self_containment(self, sections: List[Dict]) -> float:
        """
        Calculate self-containment score (0-1).
        Higher values indicate sections make sense out of context.
        """
        if not sections:
            return 0.0
        
        containment_scores = []
        
        for section in sections:
            content = section['content']
            if not content.strip():
                continue
            
            # Check for self-contained indicators
            indicators = {
                'has_intro': len(content.split()) > 50,  # Substantial content
                'has_context': any(word in content.lower() for word in ['this', 'here', 'above', 'below', 'following']),
                'has_definitions': any(word in content.lower() for word in ['means', 'refers to', 'is defined as', 'refers to']),
                'has_examples': any(word in content.lower() for word in ['for example', 'such as', 'including', 'like']),
                'has_conclusion': any(word in content.lower() for word in ['therefore', 'thus', 'in conclusion', 'summary'])
            }
            
            # Calculate section containment score
            score = sum(indicators.values()) / len(indicators)
            containment_scores.append(score)
        
        return np.mean(containment_scores) if containment_scores else 0.0
    
    def _calculate_redundancy_score(self, text: str) -> float:
        """
        Calculate redundancy score (0-1).
        Higher values indicate less redundancy (better).
        """
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) < 2:
            return 0.5  # Neutral score for single sentence
        
        # Calculate sentence similarity (simplified)
        similarities = []
        
        for i in range(len(sentences)):
            for j in range(i + 1, len(sentences)):
                # Simple word overlap similarity
                words1 = set(re.findall(r'\b[a-zA-Z]{3,}\b', sentences[i].lower()))
                words2 = set(re.findall(r'\b[a-zA-Z]{3,}\b', sentences[j].lower()))
                
                if words1 and words2:
                    overlap = len(words1.intersection(words2))
                    union = len(words1.union(words2))
                    similarity = overlap / union if union > 0 else 0
                    similarities.append(similarity)
        
        if not similarities:
            return 0.5
        
        # Redundancy score is inverse of average similarity
        avg_similarity = np.mean(similarities)
        redundancy_score = 1.0 - avg_similarity
        
        return max(0.0, min(1.0, redundancy_score))
    
    def _calculate_section_clarity(self, content: str) -> float:
        """
        Calculate clarity score for a single section (0-1).
        """
        if not content.strip():
            return 0.0
        
        # Simple clarity indicators
        words = content.split()
        if len(words) < 10:
            return 0.3  # Very short sections are unclear
        
        # Check for clarity indicators
        clarity_indicators = {
            'has_structure': any(word in content.lower() for word in ['first', 'second', 'third', 'finally', 'next', 'then']),
            'has_specifics': any(word in content.lower() for word in ['specifically', 'particularly', 'especially', 'namely']),
            'has_examples': any(word in content.lower() for word in ['for example', 'such as', 'including', 'like']),
            'has_definitions': any(word in content.lower() for word in ['means', 'refers to', 'is defined as']),
            'has_measurements': bool(re.search(r'\d+', content)),  # Contains numbers
            'has_proper_length': 50 <= len(words) <= 500  # Not too short, not too long
        }
        
        score = sum(clarity_indicators.values()) / len(clarity_indicators)
        return score
    
    def _calculate_clarity_score(self, analysis: Dict) -> int:
        """
        Calculate overall embedding clarity score (0-20).
        """
        score = 0
        
        # Term consistency (0-6 points)
        score += int(analysis['termConsistency'] * 6)
        
        # Self-containment (0-6 points)
        score += int(analysis['selfContainment'] * 6)
        
        # Redundancy score (0-4 points)
        score += int(analysis['redundancyScore'] * 4)
        
        # Section clarity bonus (0-4 points)
        if analysis['sections']:
            avg_section_clarity = np.mean([s['clarity'] for s in analysis['sections']])
            score += int(avg_section_clarity * 4)
        
        return min(20, score)  # Cap at 20


class GPTBotAccessibilityTester:
    """
    Tests GPTBot accessibility by simulating GPTBot requests.
    """
    
    def __init__(self):
        self.session = requests.Session()
        self.gptbot_headers = {
            'User-Agent': 'GPTBot',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
    
    def test_accessibility(self, url: str) -> Dict:
        """
        Test if GPTBot can access the page.
        """
        analysis = {
            'url': url,
            'score': 0,
            'accessible': False,
            'statusCode': 0,
            'redirects': [],
            'blocks': [],
            'responseTime': 0,
            'details': {}
        }
        
        try:
            # Test HEAD request first
            head_response = self.session.head(url, headers=self.gptbot_headers, timeout=10, allow_redirects=True)
            analysis['statusCode'] = head_response.status_code
            analysis['redirects'] = [r.url for r in head_response.history]
            
            # Check for blocks
            if head_response.status_code == 403:
                analysis['blocks'].append('403 Forbidden - Access denied')
            elif head_response.status_code == 429:
                analysis['blocks'].append('429 Too Many Requests - Rate limited')
            elif head_response.status_code >= 500:
                analysis['blocks'].append(f'{head_response.status_code} Server Error')
            
            # Test GET request if HEAD was successful
            if head_response.status_code == 200:
                get_response = self.session.get(url, headers=self.gptbot_headers, timeout=10, allow_redirects=True)
                
                # Check for content blocks
                content = get_response.text.lower()
                if 'cloudflare' in content and ('block' in content or 'captcha' in content):
                    analysis['blocks'].append('Cloudflare protection detected')
                
                if 'captcha' in content:
                    analysis['blocks'].append('Captcha challenge detected')
                
                if 'access denied' in content or 'blocked' in content:
                    analysis['blocks'].append('Access denied message detected')
                
                analysis['responseTime'] = get_response.elapsed.total_seconds()
                
                # Check if content is substantial
                if len(get_response.text) < 1000:
                    analysis['blocks'].append('Insufficient content (less than 1000 characters)')
            
            # Determine accessibility
            analysis['accessible'] = (
                analysis['statusCode'] == 200 and 
                len(analysis['blocks']) == 0
            )
            
            # Calculate score
            analysis['score'] = self._calculate_accessibility_score(analysis)
            
        except requests.exceptions.Timeout:
            analysis['blocks'].append('Request timeout')
        except requests.exceptions.ConnectionError:
            analysis['blocks'].append('Connection error')
        except Exception as e:
            analysis['blocks'].append(f'Error: {str(e)}')
        
        return analysis
    
    def _calculate_accessibility_score(self, analysis: Dict) -> int:
        """
        Calculate GPTBot accessibility score (0-15).
        """
        score = 0
        
        # Base score for successful response
        if analysis['statusCode'] == 200:
            score += 10
        elif analysis['statusCode'] == 301 or analysis['statusCode'] == 302:
            score += 8  # Redirects are acceptable
        elif analysis['statusCode'] == 404:
            score += 2  # Page not found
        else:
            score += 0
        
        # Bonus for fast response
        if analysis['responseTime'] < 2.0:
            score += 3
        elif analysis['responseTime'] < 5.0:
            score += 1
        
        # Bonus for no redirects
        if len(analysis['redirects']) == 0:
            score += 2
        
        # Penalty for blocks
        score -= len(analysis['blocks']) * 2
        
        return max(0, min(15, score))  # Ensure score is between 0-15


if __name__ == "__main__":
    # Example usage
    analyzer = EmbeddingClarityAnalyzer()
    tester = GPTBotAccessibilityTester()
    
    test_url = "https://example.com"
    
    print("Embedding Clarity Analysis:")
    clarity_result = analyzer.analyze_page(test_url)
    print(json.dumps(clarity_result, indent=2))
    
    print("\nGPTBot Accessibility Test:")
    accessibility_result = tester.test_accessibility(test_url)
    print(json.dumps(accessibility_result, indent=2)) 