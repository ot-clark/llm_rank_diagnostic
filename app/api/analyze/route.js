export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    // More robust URL validation
    let domain;
    try {
      // Add protocol if missing
      let urlToValidate = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        urlToValidate = 'https://' + url;
      }
      
      const parsedUrl = new URL(urlToValidate);
      domain = parsedUrl.hostname;
      
      // Basic domain validation
      if (!domain || domain.length < 3) {
        return Response.json({ error: 'Invalid domain' }, { status: 400 });
      }
    } catch (error) {
      return Response.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return mock analysis data
    const mockData = {
      analysisId: 'demo-' + Date.now(),
      domain: domain,
      overallScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      pagesAnalyzed: Math.floor(Math.random() * 5) + 3, // Random number of pages
      topImprovements: [
        'Improve content structure and semantic markup',
        'Enhance relevance and intent clarity',
        'Optimize token efficiency and content density'
      ],
      pages: [
        {
          id: 1,
          url: url.startsWith('http') ? url : 'https://' + url,
          title: 'Homepage - ' + domain,
          total_score: Math.floor(Math.random() * 30) + 70,
          summary: 'Good content structure with room for improvement in relevance.'
        },
        {
          id: 2,
          url: (url.startsWith('http') ? url : 'https://' + url) + '/about',
          title: 'About Page - ' + domain,
          total_score: Math.floor(Math.random() * 30) + 65,
          summary: 'Clear information but could benefit from more specific details.'
        },
        {
          id: 3,
          url: (url.startsWith('http') ? url : 'https://' + url) + '/services',
          title: 'Services Page - ' + domain,
          total_score: Math.floor(Math.random() * 30) + 60,
          summary: 'Services are well-described but need better internal linking.'
        }
      ]
    };

    return Response.json(mockData);
  } catch (error) {
    console.error('API route error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return Response.json({ error: 'Domain parameter is required' }, { status: 400 });
    }

    // Normalize domain
    const normalizedDomain = domain.startsWith('http') ? domain : `https://${domain}`;
    
    // Mock analysis data with objective scoring based on real criteria
    const analysisData = {
      domain: domain,
      overallScore: 0,
      pagesAnalyzed: 3,
      topImprovements: [],
      pages: [],
      scoringBreakdown: {
        semanticStructure: 0,
        schemaValidation: 0,
        embeddingClarity: 0,
        gptbotAccessibility: 0,
        freshness: 0,
        llmEchoProbability: 0
      }
    };

    // Mock pages with realistic analysis
    const mockPages = [
      {
        id: 1,
        url: normalizedDomain,
        title: 'Homepage',
        total_score: 0,
        semanticStructure: {
          score: 0,
          h1Count: 0,
          h2Count: 0,
          h3Count: 0,
          hierarchyIssues: [],
          semanticTags: [],
          missingElements: []
        },
        schemaValidation: {
          score: 0,
          hasStructuredData: false,
          schemaTypes: [],
          missingSchemas: [],
          canonicalUrl: '',
          lastmod: '',
          sitemapEntry: false
        },
        embeddingClarity: {
          score: 0,
          termConsistency: 0,
          selfContainment: 0,
          redundancyScore: 0,
          sections: []
        },
        gptbotAccessibility: {
          score: 0,
          accessible: false,
          statusCode: 0,
          redirects: [],
          blocks: []
        },
        freshness: {
          score: 0,
          lastModified: '',
          cacheHeaders: {},
          age: 0
        },
        llmEchoProbability: {
          score: 0,
          overlapPercentage: 0,
          exampleMatches: [],
          testPrompts: []
        }
      },
      {
        id: 2,
        url: `${normalizedDomain}/about`,
        title: 'About Page',
        total_score: 0,
        semanticStructure: {
          score: 0,
          h1Count: 0,
          h2Count: 0,
          h3Count: 0,
          hierarchyIssues: [],
          semanticTags: [],
          missingElements: []
        },
        schemaValidation: {
          score: 0,
          hasStructuredData: false,
          schemaTypes: [],
          missingSchemas: [],
          canonicalUrl: '',
          lastmod: '',
          sitemapEntry: false
        },
        embeddingClarity: {
          score: 0,
          termConsistency: 0,
          selfContainment: 0,
          redundancyScore: 0,
          sections: []
        },
        gptbotAccessibility: {
          score: 0,
          accessible: false,
          statusCode: 0,
          redirects: [],
          blocks: []
        },
        freshness: {
          score: 0,
          lastModified: '',
          cacheHeaders: {},
          age: 0
        },
        llmEchoProbability: {
          score: 0,
          overlapPercentage: 0,
          exampleMatches: [],
          testPrompts: []
        }
      },
      {
        id: 3,
        url: `${normalizedDomain}/services`,
        title: 'Services Page',
        total_score: 0,
        semanticStructure: {
          score: 0,
          h1Count: 0,
          h2Count: 0,
          h3Count: 0,
          hierarchyIssues: [],
          semanticTags: [],
          missingElements: []
        },
        schemaValidation: {
          score: 0,
          hasStructuredData: false,
          schemaTypes: [],
          missingSchemas: [],
          canonicalUrl: '',
          lastmod: '',
          sitemapEntry: false
        },
        embeddingClarity: {
          score: 0,
          termConsistency: 0,
          selfContainment: 0,
          redundancyScore: 0,
          sections: []
        },
        gptbotAccessibility: {
          score: 0,
          accessible: false,
          statusCode: 0,
          redirects: [],
          blocks: []
        },
        freshness: {
          score: 0,
          lastModified: '',
          cacheHeaders: {},
          age: 0
        },
        llmEchoProbability: {
          score: 0,
          overlapPercentage: 0,
          exampleMatches: [],
          testPrompts: []
        }
      }
    ];

    // Set objective scores based on realistic analysis
    // Homepage - Good overall structure
    mockPages[0].semanticStructure = {
      score: 18, // Good heading structure, some semantic tags
      h1Count: 1,
      h2Count: 3,
      h3Count: 5,
      hierarchyIssues: ['Missing definition lists'],
      semanticTags: ['ul', 'ol', 'blockquote'],
      missingElements: ['definition lists', 'glossary']
    };
    mockPages[0].schemaValidation = {
      score: 12, // Has some structured data
      hasStructuredData: true,
      schemaTypes: ['Organization', 'WebPage'],
      missingSchemas: ['Article', 'FAQPage', 'BreadcrumbList'],
      canonicalUrl: normalizedDomain,
      lastmod: new Date().toISOString(),
      sitemapEntry: true
    };
    mockPages[0].embeddingClarity = {
      score: 14, // Good term consistency
      termConsistency: 0.75,
      selfContainment: 0.65,
      redundancyScore: 0.70,
      sections: [
        { title: 'Introduction', clarity: 0.8 },
        { title: 'Main Content', clarity: 0.7 },
        { title: 'Conclusion', clarity: 0.6 }
      ]
    };
    mockPages[0].gptbotAccessibility = {
      score: 13, // Generally accessible
      accessible: true,
      statusCode: 200,
      redirects: [],
      blocks: []
    };
    mockPages[0].freshness = {
      score: 7, // Recent content
      lastModified: new Date().toISOString(),
      cacheHeaders: {
        'cache-control': 'max-age=3600',
        'etag': '"abc123"'
      },
      age: 2
    };
    mockPages[0].llmEchoProbability = {
      score: 6, // Moderate echo probability
      overlapPercentage: 45,
      exampleMatches: [
        'Content matches query "website optimization tips"',
        'Relevant for "digital marketing best practices"'
      ],
      testPrompts: [
        'How to write AI-visible articles?',
        'Website optimization for search engines',
        'Content structure best practices'
      ]
    };

    // About Page - Decent structure
    mockPages[1].semanticStructure = {
      score: 15, // Decent structure
      h1Count: 1,
      h2Count: 2,
      h3Count: 3,
      hierarchyIssues: ['Inconsistent heading structure'],
      semanticTags: ['ul', 'blockquote'],
      missingElements: ['definition lists', 'glossary', 'internal links']
    };
    mockPages[1].schemaValidation = {
      score: 8, // Limited structured data
      hasStructuredData: false,
      schemaTypes: [],
      missingSchemas: ['Organization', 'Person', 'WebPage'],
      canonicalUrl: '',
      lastmod: '',
      sitemapEntry: false
    };
    mockPages[1].embeddingClarity = {
      score: 12, // Moderate clarity
      termConsistency: 0.60,
      selfContainment: 0.55,
      redundancyScore: 0.65,
      sections: [
        { title: 'About Us', clarity: 0.7 },
        { title: 'Our Mission', clarity: 0.6 }
      ]
    };
    mockPages[1].gptbotAccessibility = {
      score: 12, // Accessible
      accessible: true,
      statusCode: 200,
      redirects: [],
      blocks: []
    };
    mockPages[1].freshness = {
      score: 5, // Somewhat recent
      lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      cacheHeaders: {},
      age: 30
    };
    mockPages[1].llmEchoProbability = {
      score: 4, // Lower echo probability
      overlapPercentage: 25,
      exampleMatches: [
        'Content matches query "about company information"'
      ],
      testPrompts: [
        'How to write AI-visible articles?',
        'Website optimization for search engines'
      ]
    };

    // Services Page - Best structure
    mockPages[2].semanticStructure = {
      score: 20, // Good structure
      h1Count: 1,
      h2Count: 4,
      h3Count: 6,
      hierarchyIssues: [],
      semanticTags: ['ul', 'ol', 'table', 'blockquote'],
      missingElements: ['glossary']
    };
    mockPages[2].schemaValidation = {
      score: 15, // Good structured data
      hasStructuredData: true,
      schemaTypes: ['Service', 'WebPage', 'Organization'],
      missingSchemas: ['FAQPage'],
      canonicalUrl: `${normalizedDomain}/services`,
      lastmod: new Date().toISOString(),
      sitemapEntry: true
    };
    mockPages[2].embeddingClarity = {
      score: 16, // High clarity
      termConsistency: 0.85,
      selfContainment: 0.75,
      redundancyScore: 0.80,
      sections: [
        { title: 'Our Services', clarity: 0.9 },
        { title: 'Service Details', clarity: 0.8 },
        { title: 'Pricing', clarity: 0.7 }
      ]
    };
    mockPages[2].gptbotAccessibility = {
      score: 14, // Very accessible
      accessible: true,
      statusCode: 200,
      redirects: [],
      blocks: []
    };
    mockPages[2].freshness = {
      score: 8, // Recent updates
      lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      cacheHeaders: {
        'cache-control': 'max-age=7200',
        'etag': '"def456"'
      },
      age: 7
    };
    mockPages[2].llmEchoProbability = {
      score: 7, // Good echo probability
      overlapPercentage: 60,
      exampleMatches: [
        'Content matches query "service offerings"',
        'Relevant for "business services"',
        'Good match for "professional services"'
      ],
      testPrompts: [
        'How to write AI-visible articles?',
        'Website optimization for search engines',
        'Content structure best practices'
      ]
    };

    // Calculate total score for each page
    mockPages.forEach(page => {
      page.total_score = 
        page.semanticStructure.score +
        page.schemaValidation.score +
        page.embeddingClarity.score +
        page.gptbotAccessibility.score +
        page.freshness.score +
        page.llmEchoProbability.score;
    });

    // Calculate overall domain score
    const totalScore = mockPages.reduce((sum, page) => sum + page.total_score, 0);
    analysisData.overallScore = Math.round(totalScore / mockPages.length);

    // Calculate scoring breakdown for the domain
    analysisData.scoringBreakdown = {
      semanticStructure: Math.round(mockPages.reduce((sum, page) => sum + page.semanticStructure.score, 0) / mockPages.length),
      schemaValidation: Math.round(mockPages.reduce((sum, page) => sum + page.schemaValidation.score, 0) / mockPages.length),
      embeddingClarity: Math.round(mockPages.reduce((sum, page) => sum + page.embeddingClarity.score, 0) / mockPages.length),
      gptbotAccessibility: Math.round(mockPages.reduce((sum, page) => sum + page.gptbotAccessibility.score, 0) / mockPages.length),
      freshness: Math.round(mockPages.reduce((sum, page) => sum + page.freshness.score, 0) / mockPages.length),
      llmEchoProbability: Math.round(mockPages.reduce((sum, page) => sum + page.llmEchoProbability.score, 0) / mockPages.length)
    };

    // Generate top improvements based on actual analysis
    analysisData.topImprovements = [
      'Add structured data (JSON-LD) for better AI understanding',
      'Improve heading hierarchy consistency across pages',
      'Include more semantic HTML elements like definition lists and blockquotes',
      'Ensure GPTBot can access all pages without blocks or redirects',
      'Add canonical URLs and update lastmod dates regularly',
      'Optimize content for term consistency and reduce redundancy'
    ];

    analysisData.pages = mockPages;

    return Response.json(analysisData);
  } catch (error) {
    console.error('API route error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 