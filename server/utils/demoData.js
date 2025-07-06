const { pool } = require('../index');

async function generateDemoData() {
  try {
    console.log('Generating demo data...');

    // Sample domain data
    const demoDomain = {
      domain: 'example.com',
      overall_score: 75,
      pages_analyzed: 5,
      top_improvements: [
        'Improve content structure and semantic markup',
        'Enhance relevance and intent clarity',
        'Optimize token efficiency and content density'
      ]
    };

    // Sample pages
    const demoPages = [
      {
        url: 'https://example.com',
        title: 'Welcome to Example.com',
        description: 'Your trusted source for information and resources',
        content: 'Welcome to our comprehensive website. We provide valuable information about various topics including technology, business, and lifestyle. Our content is designed to help you make informed decisions and stay updated with the latest trends.',
        score: 82
      },
      {
        url: 'https://example.com/about',
        title: 'About Us - Example.com',
        description: 'Learn more about our company and mission',
        content: 'About our company. We are dedicated to providing high-quality content and services. Our team consists of experts in various fields who work together to deliver the best possible experience for our users.',
        score: 78
      },
      {
        url: 'https://example.com/services',
        title: 'Our Services - Example.com',
        description: 'Explore the services we offer',
        content: 'Our services include consulting, training, and support. We help businesses grow and succeed through our expertise and experience. Contact us to learn more about how we can help you.',
        score: 71
      },
      {
        url: 'https://example.com/blog',
        title: 'Blog - Example.com',
        description: 'Read our latest articles and insights',
        content: 'Our blog features articles on various topics including industry trends, best practices, and expert insights. We regularly publish content to keep you informed and engaged.',
        score: 68
      },
      {
        url: 'https://example.com/contact',
        title: 'Contact Us - Example.com',
        description: 'Get in touch with our team',
        content: 'Contact information and ways to reach our team. We are here to help and answer any questions you may have. Feel free to reach out through email, phone, or our contact form.',
        score: 65
      }
    ];

    // Insert domain
    await pool.query(
      'INSERT INTO domains (domain, overall_score, pages_analyzed, top_improvements) VALUES ($1, $2, $3, $4) ON CONFLICT (domain) DO UPDATE SET overall_score = $2, pages_analyzed = $3, top_improvements = $4',
      [demoDomain.domain, demoDomain.overall_score, demoDomain.pages_analyzed, JSON.stringify(demoDomain.top_improvements)]
    );

    // Insert pages and scores
    for (const page of demoPages) {
      const pageResult = await pool.query(
        'INSERT INTO pages (url, domain, title, description, html, metadata) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (url) DO UPDATE SET title = $3, description = $4, html = $5, metadata = $6 RETURNING id',
        [
          page.url,
          demoDomain.domain,
          page.title,
          page.description,
          `<html><body><h1>${page.title}</h1><p>${page.content}</p></body></html>`,
          JSON.stringify({ title: page.title, description: page.description })
        ]
      );

      const pageId = pageResult.rows[0].id;

      // Insert score
      await pool.query(
        `INSERT INTO scores (page_id, structure_semantics, relevance_intent, token_efficiency, link_graph, llm_output_likelihood, total_score, summary, detailed_analysis)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (page_id) DO UPDATE SET
         structure_semantics = $2, relevance_intent = $3, token_efficiency = $4, link_graph = $5, llm_output_likelihood = $6, total_score = $7, summary = $8, detailed_analysis = $9`,
        [
          pageId,
          Math.floor(page.score * 0.25),
          Math.floor(page.score * 0.25),
          Math.floor(page.score * 0.20),
          Math.floor(page.score * 0.15),
          Math.floor(page.score * 0.15),
          page.score,
          `This page has a ${page.score}% AI visibility score.`,
          JSON.stringify({
            strengths: ['Good content structure', 'Relevant information'],
            weaknesses: ['Could improve linking', 'More specific details needed'],
            recommendations: ['Add more internal links', 'Include specific examples']
          })
        ]
      );

      // Insert overlay highlights
      const highlights = [
        {
          start: 0,
          end: Math.min(50, page.content.length),
          severity: 'medium',
          suggestion: 'Add more specific details and examples',
          reason: 'Content is too generic and lacks specific information',
          element_selector: 'p'
        }
      ];

      await pool.query(
        'INSERT INTO overlays (page_id, highlights) VALUES ($1, $2) ON CONFLICT (page_id) DO UPDATE SET highlights = $2',
        [pageId, JSON.stringify(highlights)]
      );
    }

    console.log('Demo data generated successfully!');
    console.log(`Domain: ${demoDomain.domain}`);
    console.log(`Pages: ${demoPages.length}`);
    console.log(`Overall Score: ${demoDomain.overall_score}%`);

  } catch (error) {
    console.error('Error generating demo data:', error);
  }
}

// Run if called directly
if (require.main === module) {
  generateDemoData().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Failed to generate demo data:', error);
    process.exit(1);
  });
}

module.exports = { generateDemoData }; 