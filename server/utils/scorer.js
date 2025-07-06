// Mock scoring function - in production, this would call OpenAI API
async function scoreContent(page) {
  try {
    console.log(`Scoring content for: ${page.url}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock scoring based on content analysis
    const content = page.content || '';
    const title = page.title || '';
    const description = page.description || '';
    
    // Simple scoring logic (in production, this would use OpenAI API)
    const structureSemantics = scoreStructureSemantics(content, title);
    const relevanceIntent = scoreRelevanceIntent(content, title, description);
    const tokenEfficiency = scoreTokenEfficiency(content);
    const linkGraph = scoreLinkGraph(page.metadata?.links || []);
    const llmOutputLikelihood = scoreLLMOutputLikelihood(content, title);
    
    const totalScore = structureSemantics + relevanceIntent + tokenEfficiency + linkGraph + llmOutputLikelihood;
    
    // Generate highlights
    const highlights = generateHighlights(content, totalScore);
    
    // Generate summary
    const summary = generateSummary(totalScore, {
      structureSemantics,
      relevanceIntent,
      tokenEfficiency,
      linkGraph,
      llmOutputLikelihood
    });
    
    return {
      structure_semantics: structureSemantics,
      relevance_intent: relevanceIntent,
      token_efficiency: tokenEfficiency,
      link_graph: linkGraph,
      llm_output_likelihood: llmOutputLikelihood,
      total_score: totalScore,
      summary: summary,
      highlights: highlights,
      detailed_analysis: {
        content_length: content.length,
        title_length: title.length,
        description_length: description.length,
        link_count: page.metadata?.links?.length || 0,
        heading_count: (page.metadata?.h1 ? 1 : 0) + (page.metadata?.h2?.length || 0) + (page.metadata?.h3?.length || 0)
      }
    };
    
  } catch (error) {
    console.error('Scoring error:', error);
    // Return default scores on error
    return {
      structure_semantics: 10,
      relevance_intent: 10,
      token_efficiency: 8,
      link_graph: 6,
      llm_output_likelihood: 6,
      total_score: 40,
      summary: 'Error occurred during scoring',
      highlights: [],
      detailed_analysis: {}
    };
  }
}

// Scoring functions
function scoreStructureSemantics(content, title) {
  let score = 0;
  
  // Check for clear headings
  if (title && title.length > 10 && title.length < 60) score += 5;
  
  // Check for structured content
  const paragraphs = content.split('\n\n').length;
  if (paragraphs > 3) score += 5;
  
  // Check for lists
  if (content.includes('•') || content.includes('-') || content.includes('1.')) score += 5;
  
  // Check for semantic elements
  if (content.includes('because') || content.includes('therefore') || content.includes('however')) score += 5;
  
  // Check for definitions
  if (content.includes('is a') || content.includes('refers to') || content.includes('means')) score += 5;
  
  return Math.min(score, 25);
}

function scoreRelevanceIntent(content, title, description) {
  let score = 0;
  
  // Check title relevance
  if (title && title.length > 5) score += 5;
  
  // Check description relevance
  if (description && description.length > 20) score += 5;
  
  // Check for specific topics
  const specificTerms = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  if (specificTerms.length > 5) score += 5;
  
  // Check for question-answer format
  if (content.includes('?') && content.includes('answer')) score += 5;
  
  // Check for clear purpose
  if (content.includes('how to') || content.includes('guide') || content.includes('tutorial')) score += 5;
  
  return Math.min(score, 25);
}

function scoreTokenEfficiency(content) {
  let score = 0;
  
  // Check content length (not too short, not too long)
  if (content.length > 500 && content.length < 5000) score += 5;
  
  // Check for concise sentences
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  if (avgSentenceLength > 20 && avgSentenceLength < 100) score += 5;
  
  // Check for information density
  const words = content.split(/\s+/).length;
  const uniqueWords = new Set(content.toLowerCase().split(/\s+/)).size;
  const density = uniqueWords / words;
  if (density > 0.3) score += 5;
  
  // Check for technical terms
  const technicalTerms = content.match(/\b[A-Z]{2,}\b/g) || [];
  if (technicalTerms.length > 2) score += 5;
  
  return Math.min(score, 20);
}

function scoreLinkGraph(links) {
  let score = 0;
  
  // Check number of internal links
  if (links.length > 5) score += 5;
  
  // Check for descriptive link text
  const descriptiveLinks = links.filter(link => link.length > 10).length;
  if (descriptiveLinks > 2) score += 5;
  
  // Check for external authoritative links
  const externalLinks = links.filter(link => link.includes('http') && !link.includes('localhost')).length;
  if (externalLinks > 1) score += 5;
  
  return Math.min(score, 15);
}

function scoreLLMOutputLikelihood(content, title) {
  let score = 0;
  
  // Check for factual content
  if (content.includes('research') || content.includes('study') || content.includes('data')) score += 5;
  
  // Check for citations
  if (content.includes('according to') || content.includes('sources') || content.includes('references')) score += 5;
  
  // Check for comprehensive coverage
  if (content.length > 1000) score += 5;
  
  return Math.min(score, 15);
}

// Generate highlights for overlay
function generateHighlights(content, totalScore) {
  const highlights = [];
  
  // Generate mock highlights based on score
  if (totalScore < 50) {
    // Low score - more highlights
    highlights.push({
      start: 0,
      end: Math.min(100, content.length),
      severity: 'high',
      suggestion: 'Improve content structure and add more specific information',
      reason: 'Content lacks clear structure and specific details that LLMs can easily parse',
      element_selector: 'body'
    });
    
    if (content.length > 200) {
      highlights.push({
        start: 200,
        end: Math.min(400, content.length),
        severity: 'medium',
        suggestion: 'Add more context and examples',
        reason: 'This section could benefit from additional context and concrete examples',
        element_selector: 'p'
      });
    }
  } else if (totalScore < 75) {
    // Medium score - moderate highlights
    highlights.push({
      start: 0,
      end: Math.min(50, content.length),
      severity: 'medium',
      suggestion: 'Consider adding more specific details',
      reason: 'Content is good but could be more specific for better LLM understanding',
      element_selector: 'h1'
    });
  }
  
  return highlights;
}

// Generate summary
function generateSummary(totalScore, breakdown) {
  if (totalScore >= 80) {
    return 'Excellent LLM visibility. Content is well-structured, relevant, and likely to appear in AI responses.';
  } else if (totalScore >= 60) {
    return 'Good LLM visibility with room for improvement. Focus on enhancing content structure and relevance.';
  } else if (totalScore >= 40) {
    return 'Moderate LLM visibility. Significant improvements needed in content structure, relevance, and token efficiency.';
  } else {
    return 'Low LLM visibility. Major improvements required across all scoring dimensions.';
  }
}

module.exports = {
  scoreContent
}; 