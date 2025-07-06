export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const pageId = searchParams.get('pageId');

    if (!domain) {
      return Response.json({ error: 'Domain parameter is required' }, { status: 400 });
    }

    // Return mock overlay data with more realistic content
    const mockOverlayData = [
      {
        pageId: 1,
        url: 'https://' + domain,
        title: 'Homepage - ' + domain,
        highlights: [
          {
            start: 0,
            end: 50,
            severity: 'medium',
            suggestion: 'Add more specific details about your main value proposition',
            reason: 'The headline is too generic and doesn\'t clearly communicate what makes your service unique',
            element_selector: 'h1'
          },
          {
            start: 100,
            end: 200,
            severity: 'high',
            suggestion: 'Include specific metrics, case studies, or customer testimonials',
            reason: 'This section lacks concrete evidence and social proof that would increase credibility',
            element_selector: 'p'
          },
          {
            start: 300,
            end: 400,
            severity: 'low',
            suggestion: 'Add internal links to related pages for better site navigation',
            reason: 'Missing internal linking opportunities that could improve user engagement and SEO',
            element_selector: 'div'
          }
        ]
      },
      {
        pageId: 2,
        url: 'https://' + domain + '/about',
        title: 'About Page - ' + domain,
        highlights: [
          {
            start: 0,
            end: 80,
            severity: 'high',
            suggestion: 'Start with a compelling hook that addresses the reader\'s pain points',
            reason: 'The opening paragraph doesn\'t immediately engage visitors or explain why they should care',
            element_selector: 'body'
          },
          {
            start: 150,
            end: 250,
            severity: 'medium',
            suggestion: 'Include specific achievements, awards, or recognition',
            reason: 'Missing credibility markers that would help establish authority and trust',
            element_selector: 'p'
          }
        ]
      },
      {
        pageId: 3,
        url: 'https://' + domain + '/services',
        title: 'Services Page - ' + domain,
        highlights: [
          {
            start: 0,
            end: 120,
            severity: 'medium',
            suggestion: 'Add more context and examples for each service',
            reason: 'This section could benefit from additional context and concrete examples',
            element_selector: 'p'
          },
          {
            start: 200,
            end: 300,
            severity: 'low',
            suggestion: 'Include pricing information or call-to-action buttons',
            reason: 'Missing clear next steps for visitors who want to learn more or get started',
            element_selector: 'div'
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