import os
import json
import asyncio
from typing import Dict, Any, List
import logging
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class LLMScorer:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.scoring_prompt = self._get_scoring_prompt()
    
    def _get_scoring_prompt(self) -> str:
        """Get the scoring prompt template"""
        return """
        Analyze the following web page content for LLM visibility and ranking potential. Score each dimension from 0-100 and provide detailed feedback.

        Page Title: {title}
        Page Description: {description}
        Content: {content}

        Please analyze and score the following dimensions:

        1. Structure & Semantics (0-25 points):
        - Clear headings and content structure
        - Semantic markup and organization
        - Logical flow and readability

        2. Relevance & Intent Clarity (0-25 points):
        - Content relevance to title/topic
        - Clear user intent matching
        - Specific and actionable information

        3. Token Efficiency & Density (0-20 points):
        - Information density
        - Concise yet comprehensive content
        - Technical term usage

        4. Link Graph & Crawlability (0-15 points):
        - Internal linking structure
        - External authoritative links
        - Descriptive link text

        5. LLM Output Likelihood (0-15 points):
        - Factual content and citations
        - Comprehensive coverage
        - Likelihood of appearing in AI responses

        Provide your response in the following JSON format:
        {{
            "structure_semantics": <score>,
            "relevance_intent": <score>,
            "token_efficiency": <score>,
            "link_graph": <score>,
            "llm_output_likelihood": <score>,
            "total_score": <sum of all scores>,
            "summary": "<brief summary>",
            "highlights": [
                {{
                    "start": <character position>,
                    "end": <character position>,
                    "severity": "high|medium|low",
                    "suggestion": "<improvement suggestion>",
                    "reason": "<why this needs improvement>"
                }}
            ],
            "detailed_analysis": {{
                "strengths": ["<list of strengths>"],
                "weaknesses": ["<list of weaknesses>"],
                "recommendations": ["<specific recommendations>"]
            }}
        }}
        """
    
    async def score_content(self, content: str, title: str, description: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Score content using LLM analysis"""
        try:
            # Prepare the prompt
            prompt = self.scoring_prompt.format(
                title=title,
                description=description,
                content=content[:4000]  # Limit content length for API
            )
            
            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert content analyst specializing in LLM visibility and ranking optimization."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            # Parse the response
            response_text = response.choices[0].message.content
            
            # Try to extract JSON from response
            try:
                # Find JSON in the response
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                
                if json_start != -1 and json_end != 0:
                    json_str = response_text[json_start:json_end]
                    score_data = json.loads(json_str)
                else:
                    # Fallback to mock scoring
                    score_data = self._mock_score(content, title, description)
                    
            except json.JSONDecodeError:
                logger.warning("Failed to parse LLM response as JSON, using mock scoring")
                score_data = self._mock_score(content, title, description)
            
            # Validate and normalize scores
            score_data = self._validate_scores(score_data)
            
            return score_data
            
        except Exception as e:
            logger.error(f"Error in LLM scoring: {e}")
            # Return mock scoring as fallback
            return self._mock_score(content, title, description)
    
    def _mock_score(self, content: str, title: str, description: str) -> Dict[str, Any]:
        """Generate mock scores when LLM API is unavailable"""
        # Simple scoring logic based on content analysis
        content_length = len(content)
        title_length = len(title)
        desc_length = len(description)
        
        # Structure & Semantics (0-25)
        structure_score = min(25, max(0, 
            (5 if title_length > 10 else 0) +
            (5 if content_length > 500 else 0) +
            (5 if '\n\n' in content else 0) +
            (5 if any(word in content.lower() for word in ['because', 'therefore', 'however']) else 0) +
            (5 if any(word in content.lower() for word in ['guide', 'tutorial', 'how to']) else 0)
        ))
        
        # Relevance & Intent (0-25)
        relevance_score = min(25, max(0,
            (5 if title_length > 5 else 0) +
            (5 if desc_length > 20 else 0) +
            (5 if len(content.split()) > 100 else 0) +
            (5 if any(word in content.lower() for word in ['research', 'study', 'data']) else 0) +
            (5 if '?' in content and 'answer' in content.lower() else 0)
        ))
        
        # Token Efficiency (0-20)
        words = content.split()
        unique_words = len(set(word.lower() for word in words))
        density = unique_words / len(words) if words else 0
        
        efficiency_score = min(20, max(0,
            (5 if 500 < content_length < 5000 else 0) +
            (5 if 20 < len(content.split('.')[0]) < 100 else 0) +
            (5 if density > 0.3 else 0) +
            (5 if any(word.isupper() and len(word) > 2 for word in words) else 0)
        ))
        
        # Link Graph (0-15)
        link_score = min(15, max(0,
            (5 if 'http' in content else 0) +
            (5 if 'link' in content.lower() else 0) +
            (5 if 'reference' in content.lower() else 0)
        ))
        
        # LLM Output Likelihood (0-15)
        llm_score = min(15, max(0,
            (5 if content_length > 1000 else 0) +
            (5 if any(word in content.lower() for word in ['research', 'study', 'according to']) else 0) +
            (5 if any(word in content.lower() for word in ['source', 'reference', 'citation']) else 0)
        ))
        
        total_score = structure_score + relevance_score + efficiency_score + link_score + llm_score
        
        return {
            "structure_semantics": structure_score,
            "relevance_intent": relevance_score,
            "token_efficiency": efficiency_score,
            "link_graph": link_score,
            "llm_output_likelihood": llm_score,
            "total_score": total_score,
            "summary": self._generate_summary(total_score),
            "highlights": self._generate_highlights(content, total_score),
            "detailed_analysis": {
                "strengths": self._get_strengths(total_score),
                "weaknesses": self._get_weaknesses(total_score),
                "recommendations": self._get_recommendations(total_score)
            }
        }
    
    def _validate_scores(self, score_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and normalize scores"""
        required_fields = [
            "structure_semantics", "relevance_intent", "token_efficiency",
            "link_graph", "llm_output_likelihood", "total_score"
        ]
        
        for field in required_fields:
            if field not in score_data:
                score_data[field] = 0
            else:
                # Ensure scores are within valid ranges
                if field == "structure_semantics":
                    score_data[field] = max(0, min(25, score_data[field]))
                elif field == "relevance_intent":
                    score_data[field] = max(0, min(25, score_data[field]))
                elif field == "token_efficiency":
                    score_data[field] = max(0, min(20, score_data[field]))
                elif field == "link_graph":
                    score_data[field] = max(0, min(15, score_data[field]))
                elif field == "llm_output_likelihood":
                    score_data[field] = max(0, min(15, score_data[field]))
                elif field == "total_score":
                    score_data[field] = max(0, min(100, score_data[field]))
        
        # Ensure highlights is a list
        if "highlights" not in score_data:
            score_data["highlights"] = []
        
        return score_data
    
    def _generate_summary(self, total_score: int) -> str:
        """Generate summary based on total score"""
        if total_score >= 80:
            return "Excellent LLM visibility. Content is well-structured, relevant, and likely to appear in AI responses."
        elif total_score >= 60:
            return "Good LLM visibility with room for improvement. Focus on enhancing content structure and relevance."
        elif total_score >= 40:
            return "Moderate LLM visibility. Significant improvements needed in content structure, relevance, and token efficiency."
        else:
            return "Low LLM visibility. Major improvements required across all scoring dimensions."
    
    def _generate_highlights(self, content: str, total_score: int) -> List[Dict[str, Any]]:
        """Generate highlights for overlay"""
        highlights = []
        
        if total_score < 50:
            # Low score - more highlights
            highlights.append({
                "start": 0,
                "end": min(100, len(content)),
                "severity": "high",
                "suggestion": "Improve content structure and add more specific information",
                "reason": "Content lacks clear structure and specific details that LLMs can easily parse"
            })
            
            if len(content) > 200:
                highlights.append({
                    "start": 200,
                    "end": min(400, len(content)),
                    "severity": "medium",
                    "suggestion": "Add more context and examples",
                    "reason": "This section could benefit from additional context and concrete examples"
                })
        
        return highlights
    
    def _get_strengths(self, total_score: int) -> List[str]:
        """Get content strengths"""
        if total_score >= 80:
            return ["Excellent content structure", "High relevance to topic", "Good information density"]
        elif total_score >= 60:
            return ["Good content organization", "Relevant information", "Adequate coverage"]
        else:
            return ["Content is present", "Basic information available"]
    
    def _get_weaknesses(self, total_score: int) -> List[str]:
        """Get content weaknesses"""
        if total_score < 40:
            return ["Poor content structure", "Low relevance", "Insufficient information density", "Weak internal linking"]
        elif total_score < 60:
            return ["Content structure needs improvement", "Relevance could be enhanced", "Information density is low"]
        else:
            return ["Minor improvements possible"]
    
    def _get_recommendations(self, total_score: int) -> List[str]:
        """Get improvement recommendations"""
        if total_score < 40:
            return [
                "Restructure content with clear headings",
                "Add more specific and relevant information",
                "Improve internal linking structure",
                "Include more factual content and citations"
            ]
        elif total_score < 60:
            return [
                "Enhance content organization",
                "Add more context and examples",
                "Improve information density",
                "Strengthen internal linking"
            ]
        else:
            return [
                "Consider adding more specific details",
                "Enhance content structure further",
                "Add more authoritative links"
            ] 