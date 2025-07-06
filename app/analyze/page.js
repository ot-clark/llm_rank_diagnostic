'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Eye, ArrowRight, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronRight, Info } from 'lucide-react';

export default function AnalyzePage() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCriteria, setExpandedCriteria] = useState({});
  const [expandedRecommendations, setExpandedRecommendations] = useState({});
  const [selectedPageIndex, setSelectedPageIndex] = useState(0); // Track selected page
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const domain = searchParams.get('domain');

  useEffect(() => {
    if (domain) {
      fetchAnalysisData();
    }
  }, [domain]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analyze?domain=${encodeURIComponent(domain)}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      setAnalysisData(data);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      setError('Failed to load analysis data');
    } finally {
      setLoading(false);
    }
  };

  const toggleCriteria = (criteriaKey, pointKey) => {
    const key = `${criteriaKey}-${pointKey}`;
    setExpandedCriteria(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleRecommendation = (index) => {
    setExpandedRecommendations(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <TrendingUp className="h-8 w-8 text-green-400" />;
    if (score >= 60) return <TrendingUp className="h-8 w-8 text-yellow-400" />;
    if (score >= 40) return <TrendingDown className="h-8 w-8 text-orange-400" />;
    return <TrendingDown className="h-8 w-8 text-red-400" />;
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  // Helper to get subpoint scores from backend data for any page
  const getSubpointScores = (category, page) => {
    if (!page) return {};
    switch (category) {
      case 'semanticStructure':
        return {
          'H1 → H2 hierarchy consistency': page.semanticStructure.h1Count === 1 && page.semanticStructure.h2Count > 0 ? 5 : (page.semanticStructure.h1Count === 0 ? 0 : 2),
          'Semantic tags (table, dl, ul, ol, blockquote, code)': Math.min(10, (page.semanticStructure.semanticTags?.length || 0) * 2.5),
          'Definition lists & glossaries': page.semanticStructure.missingElements?.includes('definition lists') || page.semanticStructure.missingElements?.includes('glossary') ? 0 : 5,
          'Internal linking structure': page.semanticStructure.missingElements?.includes('internal links') ? 0 : 5,
        };
      case 'schemaValidation':
        return {
          'JSON-LD structured data': page.schemaValidation.hasStructuredData ? 8 : 0,
          'Schema.org types (Article, FAQPage, BreadcrumbList)': (page.schemaValidation.schemaTypes?.length || 0) >= 2 ? 6 : (page.schemaValidation.schemaTypes?.length ? 3 : 0),
          'Canonical URL presence': page.schemaValidation.canonicalUrl ? 3 : 0,
          'Lastmod tags & sitemap entries': (page.schemaValidation.lastmod && page.schemaValidation.sitemapEntry) ? 3 : (page.schemaValidation.lastmod || page.schemaValidation.sitemapEntry ? 1 : 0),
        };
      case 'embeddingClarity':
        return {
          'Term consistency index': Math.round((page.embeddingClarity.termConsistency || 0) * 6),
          'Self-containment score': Math.round((page.embeddingClarity.selfContainment || 0) * 6),
          'Redundancy detection': Math.round((page.embeddingClarity.redundancyScore || 0) * 4),
          'Section clarity (768+ dim embeddings)': page.embeddingClarity.sections && page.embeddingClarity.sections.length > 0 ? Math.round((page.embeddingClarity.sections.reduce((a, s) => a + (s.clarity || 0), 0) / page.embeddingClarity.sections.length) * 4) : 0,
        };
      case 'gptbotAccessibility':
        return {
          'HTTP status codes (200 OK)': page.gptbotAccessibility.statusCode === 200 ? 5 : 0,
          'Redirect handling': page.gptbotAccessibility.redirects?.length === 0 ? 3 : 1,
          'Cloudflare/Captcha blocks': page.gptbotAccessibility.blocks?.length === 0 ? 5 : 0,
          'GPTBot user agent access': page.gptbotAccessibility.accessible ? 2 : 0,
        };
      case 'freshness':
        return {
          'Lastmod timestamps': page.freshness.lastModified ? 4 : 0,
          'Cache headers optimization': page.freshness.cacheHeaders && Object.keys(page.freshness.cacheHeaders).length > 0 ? 3 : 0,
          'Content age assessment': page.freshness.age <= 30 ? 3 : (page.freshness.age <= 90 ? 2 : 0),
          'Update frequency': page.freshness.age <= 7 ? 3 : (page.freshness.age <= 30 ? 2 : (page.freshness.age <= 90 ? 1 : 0)),
        };
      case 'llmEchoProbability':
        return {
          'Prompt simulation (10 test queries)': (page.llmEchoProbability.score >= 3 ? 4 : (page.llmEchoProbability.score >= 1 ? 2 : 0)),
          'Cosine similarity analysis': (page.llmEchoProbability.overlapPercentage >= 50 ? 3 : (page.llmEchoProbability.overlapPercentage >= 20 ? 2 : 0)),
          'Response overlap percentage': (page.llmEchoProbability.overlapPercentage >= 60 ? 3 : (page.llmEchoProbability.overlapPercentage >= 30 ? 2 : 0)),
          'Example match quality': (page.llmEchoProbability.exampleMatches?.length >= 2 ? 2 : (page.llmEchoProbability.exampleMatches?.length ? 1 : 0)),
        };
      default:
        return {};
    }
  };

  // Helper to get the correct status symbol for a subpoint
  const getStatusSymbol = (score, maxScore) => {
    const pct = maxScore === 0 ? 1 : score / maxScore;
    if (pct >= 1.0) return <CheckCircle className="h-4 w-4 text-green-400" title="Excellent" />;
    if (pct >= 0.8) return <CheckCircle className="h-4 w-4 text-green-400" title="Good" />;
    if (pct >= 0.4) return <AlertTriangle className="h-4 w-4 text-yellow-400" title="Needs Improvement" />;
    return <XCircle className="h-4 w-4 text-red-400" title="Poor" />;
  };

  // Helper to get section color
  const getSectionColor = (category) => {
    switch (category) {
      case 'semanticStructure': return 'purple';
      case 'schemaValidation': return 'blue';
      case 'embeddingClarity': return 'green';
      case 'gptbotAccessibility': return 'orange';
      case 'freshness': return 'cyan';
      case 'llmEchoProbability': return 'pink';
      default: return 'purple';
    }
  };

  // Get the currently selected page
  const selectedPage = analysisData?.pages?.[selectedPageIndex];

  // Calculate category subtotals for the selected page
  const getCategorySubtotal = (category) => {
    if (!selectedPage) return 0;
    const scores = getSubpointScores(category, selectedPage);
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  // Calculate overall score for the selected page
  const getOverallScore = () => {
    if (!selectedPage) return 0;
    const categories = ['semanticStructure', 'schemaValidation', 'embeddingClarity', 'gptbotAccessibility', 'freshness', 'llmEchoProbability'];
    return categories.reduce((sum, category) => sum + getCategorySubtotal(category), 0);
  };

  // Get page display name
  const getPageDisplayName = (page, index) => {
    if (index === 0) return 'Homepage';
    return page?.url?.split('/').pop() || `Page ${index + 1}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-lg">Analyzing website...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Prepare radar chart data with actual scoring dimensions for selected page
  const radarData = [
    { 
      dimension: 'Semantic Structure', 
      value: getCategorySubtotal('semanticStructure'),
      fullMark: 25 
    },
    { 
      dimension: 'Schema Validation', 
      value: getCategorySubtotal('schemaValidation'),
      fullMark: 20 
    },
    { 
      dimension: 'Embedding Clarity', 
      value: getCategorySubtotal('embeddingClarity'),
      fullMark: 20 
    },
    { 
      dimension: 'GPTBot Access', 
      value: getCategorySubtotal('gptbotAccessibility'),
      fullMark: 15 
    },
    { 
      dimension: 'Freshness', 
      value: getCategorySubtotal('freshness'),
      fullMark: 13 
    },
    { 
      dimension: 'LLM Echo Probability', 
      value: getCategorySubtotal('llmEchoProbability'),
      fullMark: 12 
    },
  ];

  // Ensure values are within reasonable bounds
  radarData.forEach(item => {
    item.value = Math.max(0, Math.min(item.fullMark, item.value));
  });

  // Criteria explanations and improvement tips with individual scores
  const criteriaExplanations = {
    semanticStructure: {
      'H1 → H2 hierarchy consistency': {
        score: 5,
        maxScore: 5,
        explanation: 'Proper heading hierarchy helps LLMs understand the structure and importance of content. Each page should have one H1, followed by H2s for main sections, then H3s for subsections.',
        improvement: 'Ensure you have one H1 per page, use H2s for main sections, and H3s for subsections. Avoid skipping levels (e.g., H1 → H3 without H2).',
        examples: ['✅ Good: `<h1>AI Content Optimization Guide</h1><h2>Understanding LLM Visibility</h2><h3>Semantic Structure</h3><h3>Schema Markup</h3>`', '❌ Bad: `<h1>AI Content Optimization Guide</h1><h3>Semantic Structure</h3>` (missing H2)']
      },
      'Semantic tags (table, dl, ul, ol, blockquote, code)': {
        score: 10,
        maxScore: 10,
        explanation: 'Semantic HTML tags provide context to LLMs about the type and purpose of content, making it easier to understand and categorize.',
        improvement: 'Use appropriate semantic tags: `<ul>`/`<ol>` for lists, `<blockquote>` for quotes, `<code>` for code snippets, `<table>` for data, `<dl>` for definitions.',
        examples: ['✅ Good: `<blockquote>According to Google\'s guidelines, "Content should be written for users, not search engines."</blockquote>`', '❌ Bad: `<div class="quote">According to Google\'s guidelines, "Content should be written for users, not search engines."</div>`']
      },
      'Definition lists & glossaries': {
        score: 5,
        maxScore: 5,
        explanation: 'Definition lists and glossaries help LLMs understand domain-specific terminology and concepts, improving content comprehension.',
        improvement: 'Create definition lists using `<dl>`, `<dt>` (term), and `<dd>` (definition) for key concepts and industry terms.',
        examples: ['✅ Good: `<dl><dt>LLM Echo</dt><dd>The phenomenon where AI models reproduce content verbatim from training data</dd><dt>Semantic HTML</dt><dd>HTML elements that clearly describe their meaning to browsers and AI</dd></dl>`']
      },
      'Internal linking structure': {
        score: 5,
        maxScore: 5,
        explanation: 'Internal links help LLMs understand relationships between pages and concepts, improving content discovery and context.',
        improvement: 'Add relevant internal links between related pages and concepts. Use descriptive anchor text that explains the destination.',
        examples: ['✅ Good: `<a href="/seo-guide">Learn more about SEO optimization techniques</a>`', '❌ Bad: `<a href="/seo-guide">Click here</a>`']
      }
    },
    schemaValidation: {
      'JSON-LD structured data': {
        score: 8,
        maxScore: 8,
        explanation: 'JSON-LD structured data provides explicit information about your content to LLMs, helping them understand context, relationships, and meaning.',
        improvement: 'Add JSON-LD scripts with relevant schema.org types like Organization, Article, FAQPage, or Product depending on your content.',
        examples: ['✅ Good: `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"AI Content Optimization Guide","author":{"@type":"Person","name":"John Smith"},"datePublished":"2024-01-15"}</script>`']
      },
      'Schema.org types (Article, FAQPage, BreadcrumbList)': {
        score: 6,
        maxScore: 6,
        explanation: 'Specific schema.org types tell LLMs exactly what type of content you\'re providing, improving categorization and understanding.',
        improvement: 'Use appropriate schema types: Article for blog posts, FAQPage for Q&A content, BreadcrumbList for navigation, Organization for company info.',
        examples: ['✅ Good: `"@type": "FAQPage"` for FAQ content with `"@type": "Question"` and `"@type": "Answer"`', '❌ Bad: Generic `"@type": "WebPage"` for everything']
      },
      'Canonical URL presence': {
        score: 3,
        maxScore: 3,
        explanation: 'Canonical URLs help LLMs identify the preferred version of duplicate content, preventing confusion and improving content authority.',
        improvement: 'Add canonical URLs to all pages using `<link rel="canonical" href="https://yoursite.com/page">` in the head section.',
        examples: ['✅ Good: `<link rel="canonical" href="https://yoursite.com/blog/ai-content-optimization-guide">`']
      },
      'Lastmod tags & sitemap entries': {
        score: 3,
        maxScore: 3,
        explanation: 'Lastmod timestamps and sitemap entries help LLMs understand content freshness and site structure, improving crawling efficiency.',
        improvement: 'Add lastmod meta tags and ensure your sitemap.xml is up-to-date with current URLs and modification dates.',
        examples: ['✅ Good: `<meta name="lastmod" content="2024-01-15T10:30:00Z">` and `<lastmod>2024-01-15T10:30:00Z</lastmod>` in sitemap']
      }
    },
    embeddingClarity: {
      'Term consistency index': {
        score: 6,
        maxScore: 6,
        explanation: 'Term consistency measures how uniformly domain-specific terms are used throughout your content, helping LLMs understand your expertise.',
        improvement: 'Use consistent terminology for key concepts. Create a style guide for important terms and stick to it across all content.',
        examples: ['✅ Good: Always use "AI content optimization" instead of mixing "AI content optimization", "artificial intelligence content optimization", and "AI content marketing"']
      },
      'Self-containment score': {
        score: 6,
        maxScore: 6,
        explanation: 'Self-containment measures how well individual sections make sense out of context, important for LLMs that may encounter content fragments.',
        improvement: 'Write sections that can stand alone. Include necessary context, definitions, and explanations within each section.',
        examples: ['✅ Good: "In this section on semantic HTML, we\'ll explore how proper heading structure and semantic tags help AI models understand your content structure and meaning."', '❌ Bad: "As mentioned above, this technique improves visibility." (assumes previous context)']
      },
      'Redundancy detection': {
        score: 4,
        maxScore: 4,
        explanation: 'Redundancy detection identifies repetitive or vague phrases that add little value and can confuse LLMs about content quality.',
        improvement: 'Eliminate unnecessary repetition and vague phrases. Be specific and concise in your explanations.',
        examples: ['❌ Bad: "This is a very important and really good technique that is quite interesting"', '✅ Good: "This technique improves AI visibility by 40% and reduces bounce rates significantly."']
      },
      'Section clarity (768+ dim embeddings)': {
        score: 4,
        maxScore: 4,
        explanation: 'Section clarity measures how well individual content sections can be understood by high-dimensional AI embeddings.',
        improvement: 'Write clear, focused sections with specific information. Use concrete examples and avoid vague language.',
        examples: ['✅ Good: "The algorithm processes 10,000 data points per second using transformer architecture with 768-dimensional embeddings."', '❌ Bad: "The algorithm is very fast and uses advanced technology."']
      }
    },
    gptbotAccessibility: {
      'HTTP status codes (200 OK)': {
        score: 5,
        maxScore: 5,
        explanation: 'Proper HTTP status codes ensure GPTBot can successfully access your content without errors or redirects.',
        improvement: 'Ensure all pages return 200 status codes. Fix any 404, 403, or 500 errors that might block GPTBot access.',
        examples: ['✅ Good: 200 OK response for all content pages', '❌ Bad: 404 Not Found or 403 Forbidden responses']
      },
      'Redirect handling': {
        score: 3,
        maxScore: 3,
        explanation: 'Proper redirect handling ensures GPTBot can follow links and access content even when URLs change.',
        improvement: 'Use 301 redirects for permanent moves and 302 for temporary. Avoid redirect chains longer than 2-3 hops.',
        examples: ['✅ Good: Single 301 redirect from old URL to new URL', '❌ Bad: Chain of 5+ redirects: old → temp1 → temp2 → temp3 → temp4 → final']
      },
      'Cloudflare/Captcha blocks': {
        score: 5,
        maxScore: 5,
        explanation: 'Cloudflare protection and captchas can block GPTBot from accessing your content, reducing AI visibility.',
        improvement: 'Configure Cloudflare to allow GPTBot user agent. Avoid captchas or ensure they don\'t block legitimate crawlers.',
        examples: ['✅ Good: GPTBot allowed in Cloudflare settings with user agent: "GPTBot/1.0"', '❌ Bad: GPTBot blocked by security rules or captcha challenges']
      },
      'GPTBot user agent access': {
        score: 2,
        maxScore: 2,
        explanation: 'GPTBot uses a specific user agent that should be allowed access to your content for optimal AI visibility.',
        improvement: 'Ensure your robots.txt and server configuration allow GPTBot user agent access to your content.',
        examples: ['✅ Good: `User-agent: GPTBot\nAllow: /` in robots.txt', '❌ Bad: `User-agent: GPTBot\nDisallow: /` in robots.txt']
      }
    },
    freshness: {
      'Lastmod timestamps': {
        score: 4,
        maxScore: 4,
        explanation: 'Lastmod timestamps help LLMs understand when content was last updated, indicating relevance and currency.',
        improvement: 'Add accurate lastmod timestamps to all pages and update them when content changes.',
        examples: ['✅ Good: `<meta name="lastmod" content="2024-01-15T10:30:00Z">` and `<lastmod>2024-01-15T10:30:00Z</lastmod>` in sitemap']
      },
      'Cache headers optimization': {
        score: 3,
        maxScore: 3,
        explanation: 'Cache headers help LLMs understand content freshness and improve crawling efficiency.',
        improvement: 'Set appropriate cache headers for different content types. Use max-age directives to indicate content freshness.',
        examples: ['✅ Good: `Cache-Control: max-age=3600, public` for frequently updated content', '❌ Bad: `Cache-Control: no-cache` for all content']
      },
      'Content age assessment': {
        score: 3,
        maxScore: 3,
        explanation: 'Content age assessment helps LLMs understand how current your information is, affecting relevance scoring.',
        improvement: 'Regularly update content with current information, statistics, and examples. Remove outdated references.',
        examples: ['✅ Good: "According to 2024 research, 73% of websites now use AI optimization techniques."', '❌ Bad: "According to 2020 research, 45% of websites use basic SEO."']
      },
      'Update frequency': {
        score: 0,
        maxScore: 3,
        explanation: 'Update frequency indicates how often content is refreshed, showing commitment to current information.',
        improvement: 'Establish a regular content update schedule. Review and refresh content monthly or quarterly.',
        examples: ['✅ Good: Monthly content reviews with updated statistics and examples', '❌ Bad: Content unchanged for 2+ years with outdated references']
      }
    },
    llmEchoProbability: {
      'Prompt simulation (10 test queries)': {
        score: 4,
        maxScore: 4,
        explanation: 'Prompt simulation tests how well your content matches common queries that users might ask LLMs.',
        improvement: 'Research common questions in your industry and ensure your content directly addresses these queries.',
        examples: ['✅ Good: Content answers "How to optimize website content for AI visibility?" with specific techniques and examples', '❌ Bad: Content doesn\'t address common industry questions directly']
      },
      'Cosine similarity analysis': {
        score: 3,
        maxScore: 3,
        explanation: 'Cosine similarity measures how closely your content matches potential LLM responses to relevant queries.',
        improvement: 'Write content that directly answers common questions in your field. Use clear, authoritative language.',
        examples: ['✅ Good: "To optimize content for AI visibility, use semantic HTML, add structured data, ensure GPTBot access, and maintain content freshness."', '❌ Bad: "Content optimization is important for visibility."']
      },
      'Response overlap percentage': {
        score: 3,
        maxScore: 3,
        explanation: 'Response overlap measures how much of your content would be included in LLM responses to relevant queries.',
        improvement: 'Create comprehensive, detailed content that provides valuable information likely to be cited by LLMs.',
        examples: ['✅ Good: 60%+ overlap with relevant queries due to comprehensive coverage', '❌ Bad: <20% overlap due to vague, surface-level information']
      },
      'Example match quality': {
        score: 2,
        maxScore: 2,
        explanation: 'Example match quality measures how well your content serves as a reference for specific topics and queries.',
        improvement: 'Include specific examples, case studies, and detailed explanations that LLMs can reference.',
        examples: ['✅ Good: "Our client increased AI visibility by 300% by implementing semantic HTML, adding JSON-LD structured data, and ensuring GPTBot access."', '❌ Bad: "Content optimization helps with visibility."']
      }
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold">LLM Rank Diagnostic</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Domain Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Analysis Results</h1>
          <p className="text-xl text-gray-300 mb-4">Domain: {analysisData.domain}</p>
          
          {/* Page Selector */}
          {analysisData?.pages && analysisData.pages.length > 1 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">Select Page to Analyze:</h3>
              <div className="flex flex-wrap gap-2">
                {analysisData.pages.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPageIndex(index)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      selectedPageIndex === index
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {getPageDisplayName(page, index)}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Overall Score Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Overall AI Visibility Score</h2>
              {getScoreIcon(getOverallScore())}
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(getOverallScore())}`}>
                  {getOverallScore()}
                </div>
                <div className="text-lg text-gray-300">{getScoreLabel(getOverallScore())}</div>
              </div>
              
              <div className="flex-1">
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Pages Analyzed</span>
                    <span>{analysisData.pagesAnalyzed}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (analysisData.pagesAnalyzed / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-300">
                  {getOverallScore() >= 80 && "Excellent! Your content is well-optimized for LLM visibility."}
                  {getOverallScore() >= 60 && getOverallScore() < 80 && "Good performance with room for improvement."}
                  {getOverallScore() >= 40 && getOverallScore() < 60 && "Moderate performance. Consider implementing the suggested improvements."}
                  {getOverallScore() < 40 && "Significant improvements needed. Focus on the recommendations below."}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-6">Score Breakdown by Dimension</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="dimension" 
                    tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 25]} 
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    tickFormatter={(value) => `${value}pts`}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#A855F7"
                    strokeWidth={2}
                    fill="#A855F7"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Max Score"
                    dataKey="fullMark"
                    stroke="#6B7280"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    fill="transparent"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-300">Your Score</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border border-gray-500 rounded-full"></div>
                <span className="text-gray-400">Maximum Score</span>
              </div>
            </div>
            
            {/* Dimension Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {radarData.map((item, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">{item.dimension}</span>
                    <span className="text-sm font-bold text-purple-400">{item.value}/{item.fullMark}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(item.value / item.fullMark) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Detailed Scoring Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-6">Detailed Scoring Criteria</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Semantic Structure */}
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-purple-400">Semantic Structure</h4>
                  <span className="text-2xl font-bold text-purple-400">
                    {getCategorySubtotal('semanticStructure')}/25
                  </span>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  {Object.entries(criteriaExplanations.semanticStructure).map(([key, data]) => (
                    <div key={key} className="border border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCriteria('semanticStructure', key)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-left">{key}</span>
                          <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                            {getSubpointScores('semanticStructure', selectedPage)[key]}/{criteriaExplanations.semanticStructure[key].maxScore} pts
                          </span>
                          {getStatusSymbol(getSubpointScores('semanticStructure', selectedPage)[key], criteriaExplanations.semanticStructure[key].maxScore)}
                        </div>
                        <div className="flex items-center space-x-2">
                          {expandedCriteria[`semanticStructure-${key}`] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                      {expandedCriteria[`semanticStructure-${key}`] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-white/5 border-t border-white/10"
                        >
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-purple-300 flex items-center">
                                  <Info className="h-4 w-4 mr-2" />
                                  What it means:
                                </h5>
                                <span className="text-sm text-purple-300 font-medium">
                                  {getSubpointScores('semanticStructure', selectedPage)[key]}/{criteriaExplanations.semanticStructure[key].maxScore} points
                                </span>
                              </div>
                              <div className="mb-3">
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                  <div 
                                    className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(getSubpointScores('semanticStructure', selectedPage)[key] / criteriaExplanations.semanticStructure[key].maxScore) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm">{data.explanation}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-green-300 mb-2">How to improve:</h5>
                              <p className="text-gray-300 text-sm">{data.improvement}</p>
                            </div>
                            {data.examples && (
                              <div>
                                <h5 className="font-medium text-blue-300 mb-2">Examples:</h5>
                                <ul className="space-y-1">
                                  {data.examples.map((example, index) => (
                                    <li key={index} className="text-gray-300 text-sm">{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Schema Validation */}
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-blue-400">Schema Validation</h4>
                  <span className="text-2xl font-bold text-blue-400">
                    {getCategorySubtotal('schemaValidation')}/20
                  </span>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  {Object.entries(criteriaExplanations.schemaValidation).map(([key, data]) => (
                    <div key={key} className="border border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCriteria('schemaValidation', key)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-left">{key}</span>
                          <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                            {getSubpointScores('schemaValidation', selectedPage)[key]}/{criteriaExplanations.schemaValidation[key].maxScore} pts
                          </span>
                          {getStatusSymbol(getSubpointScores('schemaValidation', selectedPage)[key], criteriaExplanations.schemaValidation[key].maxScore)}
                        </div>
                        <div className="flex items-center space-x-2">
                          {expandedCriteria[`schemaValidation-${key}`] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                      {expandedCriteria[`schemaValidation-${key}`] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-white/5 border-t border-white/10"
                        >
                          <div className="space-y-3">
                            <div>
                              <h5 className="font-medium text-purple-300 mb-2 flex items-center">
                                <Info className="h-4 w-4 mr-2" />
                                What it means:
                              </h5>
                              <p className="text-gray-300 text-sm">{data.explanation}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-green-300 mb-2">How to improve:</h5>
                              <p className="text-gray-300 text-sm">{data.improvement}</p>
                            </div>
                            {data.examples && (
                              <div>
                                <h5 className="font-medium text-blue-300 mb-2">Examples:</h5>
                                <ul className="space-y-1">
                                  {data.examples.map((example, index) => (
                                    <li key={index} className="text-gray-300 text-sm">{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Embedding Clarity */}
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-green-400">Embedding Clarity</h4>
                  <span className="text-2xl font-bold text-green-400">
                    {getCategorySubtotal('embeddingClarity')}/20
                  </span>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  {Object.entries(criteriaExplanations.embeddingClarity).map(([key, data]) => (
                    <div key={key} className="border border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCriteria('embeddingClarity', key)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-left">{key}</span>
                          <span className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded">
                            {getSubpointScores('embeddingClarity', selectedPage)[key]}/{criteriaExplanations.embeddingClarity[key].maxScore} pts
                          </span>
                          {getStatusSymbol(getSubpointScores('embeddingClarity', selectedPage)[key], criteriaExplanations.embeddingClarity[key].maxScore)}
                        </div>
                        <div className="flex items-center space-x-2">
                          {expandedCriteria[`embeddingClarity-${key}`] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                      {expandedCriteria[`embeddingClarity-${key}`] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-white/5 border-t border-white/10"
                        >
                          <div className="space-y-3">
                            <div>
                              <h5 className="font-medium text-purple-300 mb-2 flex items-center">
                                <Info className="h-4 w-4 mr-2" />
                                What it means:
                              </h5>
                              <p className="text-gray-300 text-sm">{data.explanation}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-green-300 mb-2">How to improve:</h5>
                              <p className="text-gray-300 text-sm">{data.improvement}</p>
                            </div>
                            {data.examples && (
                              <div>
                                <h5 className="font-medium text-blue-300 mb-2">Examples:</h5>
                                <ul className="space-y-1">
                                  {data.examples.map((example, index) => (
                                    <li key={index} className="text-gray-300 text-sm">{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* GPTBot Accessibility */}
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-orange-400">GPTBot Accessibility</h4>
                  <span className="text-2xl font-bold text-orange-400">
                    {getCategorySubtotal('gptbotAccessibility')}/15
                  </span>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  {Object.entries(criteriaExplanations.gptbotAccessibility).map(([key, data]) => (
                    <div key={key} className="border border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCriteria('gptbotAccessibility', key)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-left">{key}</span>
                          <span className="text-xs bg-orange-600/20 text-orange-300 px-2 py-1 rounded">
                            {getSubpointScores('gptbotAccessibility', selectedPage)[key]}/{criteriaExplanations.gptbotAccessibility[key].maxScore} pts
                          </span>
                          {getStatusSymbol(getSubpointScores('gptbotAccessibility', selectedPage)[key], criteriaExplanations.gptbotAccessibility[key].maxScore)}
                        </div>
                        <div className="flex items-center space-x-2">
                          {expandedCriteria[`gptbotAccessibility-${key}`] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                      {expandedCriteria[`gptbotAccessibility-${key}`] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-white/5 border-t border-white/10"
                        >
                          <div className="space-y-3">
                            <div>
                              <h5 className="font-medium text-purple-300 mb-2 flex items-center">
                                <Info className="h-4 w-4 mr-2" />
                                What it means:
                              </h5>
                              <p className="text-gray-300 text-sm">{data.explanation}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-green-300 mb-2">How to improve:</h5>
                              <p className="text-gray-300 text-sm">{data.improvement}</p>
                            </div>
                            {data.examples && (
                              <div>
                                <h5 className="font-medium text-blue-300 mb-2">Examples:</h5>
                                <ul className="space-y-1">
                                  {data.examples.map((example, index) => (
                                    <li key={index} className="text-gray-300 text-sm">{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Freshness */}
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-cyan-400">Freshness</h4>
                  <span className="text-2xl font-bold text-cyan-400">
                    {getCategorySubtotal('freshness')}/13
                  </span>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  {Object.entries(criteriaExplanations.freshness).map(([key, data]) => (
                    <div key={key} className="border border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCriteria('freshness', key)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-left">{key}</span>
                          <span className="text-xs bg-cyan-600/20 text-cyan-300 px-2 py-1 rounded">
                            {getSubpointScores('freshness', selectedPage)[key]}/{criteriaExplanations.freshness[key].maxScore} pts
                          </span>
                          {getStatusSymbol(getSubpointScores('freshness', selectedPage)[key], criteriaExplanations.freshness[key].maxScore)}
                        </div>
                        <div className="flex items-center space-x-2">
                          {expandedCriteria[`freshness-${key}`] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                      {expandedCriteria[`freshness-${key}`] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-white/5 border-t border-white/10"
                        >
                          <div className="space-y-3">
                            <div>
                              <h5 className="font-medium text-purple-300 mb-2 flex items-center">
                                <Info className="h-4 w-4 mr-2" />
                                What it means:
                              </h5>
                              <p className="text-gray-300 text-sm">{data.explanation}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-green-300 mb-2">How to improve:</h5>
                              <p className="text-gray-300 text-sm">{data.improvement}</p>
                            </div>
                            {data.examples && (
                              <div>
                                <h5 className="font-medium text-blue-300 mb-2">Examples:</h5>
                                <ul className="space-y-1">
                                  {data.examples.map((example, index) => (
                                    <li key={index} className="text-gray-300 text-sm">{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* LLM Echo Probability */}
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-pink-400">LLM Echo Probability</h4>
                  <span className="text-2xl font-bold text-pink-400">
                    {getCategorySubtotal('llmEchoProbability')}/12
                  </span>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  {Object.entries(criteriaExplanations.llmEchoProbability).map(([key, data]) => (
                    <div key={key} className="border border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCriteria('llmEchoProbability', key)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-left">{key}</span>
                          <span className="text-xs bg-pink-600/20 text-pink-300 px-2 py-1 rounded">
                            {getSubpointScores('llmEchoProbability', selectedPage)[key]}/{criteriaExplanations.llmEchoProbability[key].maxScore} pts
                          </span>
                          {getStatusSymbol(getSubpointScores('llmEchoProbability', selectedPage)[key], criteriaExplanations.llmEchoProbability[key].maxScore)}
                        </div>
                        <div className="flex items-center space-x-2">
                          {expandedCriteria[`llmEchoProbability-${key}`] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                      {expandedCriteria[`llmEchoProbability-${key}`] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-white/5 border-t border-white/10"
                        >
                          <div className="space-y-3">
                            <div>
                              <h5 className="font-medium text-purple-300 mb-2 flex items-center">
                                <Info className="h-4 w-4 mr-2" />
                                What it means:
                              </h5>
                              <p className="text-gray-300 text-sm">{data.explanation}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-green-300 mb-2">How to improve:</h5>
                              <p className="text-gray-300 text-sm">{data.improvement}</p>
                            </div>
                            {data.examples && (
                              <div>
                                <h5 className="font-medium text-blue-300 mb-2">Examples:</h5>
                                <ul className="space-y-1">
                                  {data.examples.map((example, index) => (
                                    <li key={index} className="text-gray-300 text-sm">{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Improvements */}
        {analysisData.topImprovements && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-6">Top Recommendations</h3>
              <div className="space-y-3">
                {analysisData.topImprovements.map((improvement, index) => (
                  <div key={index} className="border border-white/10 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleRecommendation(index)}
                      className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-white">{improvement.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              improvement.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                              improvement.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-green-500/20 text-green-300'
                            }`}>
                              {improvement.priority}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                              {improvement.category}
                            </span>
                          </div>
                          <p className="text-gray-300">{improvement.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {expandedRecommendations[index] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                    {expandedRecommendations[index] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-6 bg-white/5 border-t border-white/10"
                      >
                        <div className="space-y-4">
                          {improvement.examples && improvement.examples.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-purple-300 mb-2">Affected Pages:</h5>
                              <div className="flex flex-wrap gap-2">
                                {improvement.examples.map((example, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                                    {example}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="bg-white/5 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-green-300 mb-2">How to Fix:</h5>
                            <p className="text-gray-300 text-sm">{improvement.action}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Page-by-Page Analysis */}
        {analysisData.pages && analysisData.pages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Page-by-Page Analysis</h3>
                <button
                  onClick={() => router.push(`/explore/${encodeURIComponent(analysisData.domain)}`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Live Overlays</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {analysisData.pages.map((page, index) => {
                  // Calculate score for this page
                  const pageScore = (() => {
                    const categories = ['semanticStructure', 'schemaValidation', 'embeddingClarity', 'gptbotAccessibility', 'freshness', 'llmEchoProbability'];
                    return categories.reduce((sum, category) => {
                      const scores = getSubpointScores(category, page);
                      return sum + Object.values(scores).reduce((a, b) => a + b, 0);
                    }, 0);
                  })();
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{page.title || page.url}</h4>
                        <p className="text-sm text-gray-400 truncate">{page.url}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${getScoreColor(pageScore)}`}>
                            {pageScore}
                          </div>
                          <div className="text-xs text-gray-400">{getScoreLabel(pageScore)}</div>
                        </div>
                        <button
                          onClick={() => router.push(`/explore/${encodeURIComponent(analysisData.domain)}?page=${page.id}`)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
} 