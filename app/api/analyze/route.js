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

    // Return mock analysis data
    const mockData = {
      domain: domain,
      overallScore: Math.floor(Math.random() * 40) + 60,
      pagesAnalyzed: Math.floor(Math.random() * 5) + 3,
      topImprovements: [
        'Improve content structure and semantic markup',
        'Enhance relevance and intent clarity',
        'Optimize token efficiency and content density'
      ],
      pages: [
        {
          id: 1,
          url: 'https://' + domain,
          title: 'Homepage - ' + domain,
          total_score: Math.floor(Math.random() * 30) + 70,
          summary: 'Good content structure with room for improvement in relevance.'
        },
        {
          id: 2,
          url: 'https://' + domain + '/about',
          title: 'About Page - ' + domain,
          total_score: Math.floor(Math.random() * 30) + 65,
          summary: 'Clear information but could benefit from more specific details.'
        },
        {
          id: 3,
          url: 'https://' + domain + '/services',
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