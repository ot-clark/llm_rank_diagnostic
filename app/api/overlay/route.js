export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const pageId = searchParams.get('pageId');

    if (!domain) {
      return Response.json({ error: 'Domain parameter is required' }, { status: 400 });
    }

    // Enhanced overlay data with specific improvement areas based on analysis
    const mockOverlayData = [
      {
        pageId: 1,
        url: 'https://' + domain,
        title: 'Homepage - ' + domain,
        highlights: [
          {
            id: 'h1-hierarchy',
            element_selector: 'h1',
            severity: 'medium',
            category: 'Semantic Structure',
            suggestion: 'Ensure proper H1 → H2 → H3 hierarchy',
            reason: 'Heading structure should follow a logical hierarchy for better AI understanding',
            code_example: '<h1>Main Title</h1>\n<h2>Section</h2>\n<h3>Subsection</h3>',
            improvement: 'Add H2 headings between H1 and H3 elements'
          },
          {
            id: 'missing-semantic',
            element_selector: 'div.content',
            severity: 'high',
            category: 'Semantic Structure',
            suggestion: 'Add semantic HTML elements',
            reason: 'Missing definition lists and semantic tags that help AI understand content structure',
            code_example: '<dl>\n  <dt>Key Term</dt>\n  <dd>Definition</dd>\n</dl>',
            improvement: 'Replace generic divs with semantic elements like dl, blockquote, code'
          },
          {
            id: 'no-structured-data',
            element_selector: 'head',
            severity: 'high',
            category: 'Schema Validation',
            suggestion: 'Add JSON-LD structured data',
            reason: 'Missing structured data that helps AI understand page content and context',
            code_example: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Company Name"\n}\n</script>',
            improvement: 'Add JSON-LD script in the head section'
          },
          {
            id: 'missing-canonical',
            element_selector: 'head',
            severity: 'medium',
            category: 'Schema Validation',
            suggestion: 'Add canonical URL',
            reason: 'Missing canonical URL that helps AI identify the preferred version of content',
            code_example: '<link rel="canonical" href="https://' + domain + '">',
            improvement: 'Add canonical link in the head section'
          },
          {
            id: 'vague-content',
            element_selector: 'p',
            severity: 'medium',
            category: 'Embedding Clarity',
            suggestion: 'Make content more specific and actionable',
            reason: 'Content is too vague and doesn\'t provide concrete information for AI understanding',
            code_example: 'Instead of "We provide great services", use "We increase conversion rates by 40% through AI optimization"',
            improvement: 'Replace vague statements with specific metrics and examples'
          }
        ]
      },
      {
        pageId: 2,
        url: 'https://' + domain + '/about',
        title: 'About Page - ' + domain,
        highlights: [
          {
            id: 'no-structured-data-about',
            element_selector: 'head',
            severity: 'high',
            category: 'Schema Validation',
            suggestion: 'Add Person/Organization structured data',
            reason: 'About page is missing structured data that would help AI understand company information',
            code_example: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Company Name",\n  "description": "Company description"\n}\n</script>',
            improvement: 'Add Organization schema to the head section'
          },
          {
            id: 'missing-internal-links',
            element_selector: 'div.content',
            severity: 'medium',
            category: 'Semantic Structure',
            suggestion: 'Add internal links to related pages',
            reason: 'Missing internal links that help AI understand relationships between pages',
            code_example: '<a href="/services">Learn more about our services</a>',
            improvement: 'Add descriptive internal links to related pages'
          },
          {
            id: 'inconsistent-terms',
            element_selector: 'p',
            severity: 'medium',
            category: 'Embedding Clarity',
            suggestion: 'Use consistent terminology throughout',
            reason: 'Inconsistent use of terms reduces AI understanding of content expertise',
            code_example: 'Always use "AI content optimization" instead of mixing "AI optimization", "artificial intelligence optimization"',
            improvement: 'Create a style guide and use consistent terms'
          }
        ]
      },
      {
        pageId: 3,
        url: 'https://' + domain + '/services',
        title: 'Services Page - ' + domain,
        highlights: [
          {
            id: 'missing-faq-schema',
            element_selector: 'head',
            severity: 'medium',
            category: 'Schema Validation',
            suggestion: 'Add FAQPage structured data',
            reason: 'Services page could benefit from FAQ schema for better AI understanding',
            code_example: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "What services do you offer?",\n    "acceptedAnswer": {\n      "@type": "Answer",\n      "text": "We offer..."\n    }\n  }]\n}\n</script>',
            improvement: 'Add FAQPage schema for service-related questions'
          },
          {
            id: 'missing-glossary',
            element_selector: 'div.services',
            severity: 'low',
            category: 'Semantic Structure',
            suggestion: 'Add glossary of service terms',
            reason: 'Missing definition lists that help AI understand domain-specific terminology',
            code_example: '<dl>\n  <dt>AI Optimization</dt>\n  <dd>Process of making content more visible to AI models</dd>\n</dl>',
            improvement: 'Add definition lists for key service terms'
          },
          {
            id: 'generic-service-descriptions',
            element_selector: 'p.service-description',
            severity: 'medium',
            category: 'Embedding Clarity',
            suggestion: 'Add specific examples and case studies',
            reason: 'Service descriptions are too generic and lack concrete examples',
            code_example: 'Instead of "We provide optimization services", use "We increased client X\'s AI visibility by 300% through semantic HTML and structured data"',
            improvement: 'Include specific metrics, case studies, and examples'
          }
        ]
      }
    ];

    // If specific pageId is requested, return that page
    if (pageId) {
      const page = mockOverlayData.find(p => p.pageId == pageId);
      if (page) {
        return Response.json(page);
      }
      return Response.json({ error: 'Page not found' }, { status: 404 });
    }

    // Return all pages for the domain
    return Response.json(mockOverlayData);
  } catch (error) {
    console.error('API route error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 