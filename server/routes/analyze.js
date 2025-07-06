const express = require('express');
const router = express.Router();
const { pool, redisClient } = require('../index');
const { scrapeWebsite } = require('../utils/scraper');
const { scoreContent } = require('../utils/scorer');
const { v4: uuidv4 } = require('uuid');

// POST /api/analyze - Analyze a website URL
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const domain = parsedUrl.hostname;
    const analysisId = uuidv4();

    // Check cache first
    const cachedResult = await redisClient.get(`analysis:${domain}`);
    if (cachedResult) {
      return res.json(JSON.parse(cachedResult));
    }

    // Check if domain already exists in database
    const existingDomain = await pool.query(
      'SELECT * FROM domains WHERE domain = $1',
      [domain]
    );

    if (existingDomain.rows.length > 0) {
      const domainData = existingDomain.rows[0];
      const pages = await pool.query(
        'SELECT p.*, s.* FROM pages p LEFT JOIN scores s ON p.id = s.page_id WHERE p.domain = $1',
        [domain]
      );
      
      const result = {
        analysisId,
        domain,
        overallScore: domainData.overall_score,
        pagesAnalyzed: domainData.pages_analyzed,
        topImprovements: domainData.top_improvements,
        pages: pages.rows
      };

      // Cache the result
      await redisClient.setEx(`analysis:${domain}`, 3600, JSON.stringify(result));
      return res.json(result);
    }

    // Start analysis process
    res.json({
      analysisId,
      domain,
      status: 'analyzing',
      message: 'Analysis started. This may take a few minutes.'
    });

    // Run analysis in background
    setTimeout(async () => {
      try {
        // Scrape website
        const scrapedPages = await scrapeWebsite(url);
        
        // Store pages in database
        const pageIds = [];
        for (const page of scrapedPages) {
          const pageResult = await pool.query(
            'INSERT INTO pages (url, domain, title, description, html, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [page.url, domain, page.title, page.description, page.html, JSON.stringify(page.metadata)]
          );
          pageIds.push(pageResult.rows[0].id);
        }

        // Score each page
        let totalScore = 0;
        const pageScores = [];
        
        for (let i = 0; i < scrapedPages.length; i++) {
          const page = scrapedPages[i];
          const pageId = pageIds[i];
          
          const score = await scoreContent(page);
          totalScore += score.total_score;
          
          // Store score in database
          await pool.query(
            `INSERT INTO scores (page_id, structure_semantics, relevance_intent, token_efficiency, link_graph, llm_output_likelihood, total_score, summary, detailed_analysis)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              pageId,
              score.structure_semantics,
              score.relevance_intent,
              score.token_efficiency,
              score.link_graph,
              score.llm_output_likelihood,
              score.total_score,
              score.summary,
              JSON.stringify(score.detailed_analysis)
            ]
          );

          // Generate and store overlays
          if (score.highlights) {
            await pool.query(
              'INSERT INTO overlays (page_id, highlights) VALUES ($1, $2)',
              [pageId, JSON.stringify(score.highlights)]
            );
          }

          pageScores.push({
            pageId,
            url: page.url,
            title: page.title,
            score: score.total_score,
            summary: score.summary
          });
        }

        const averageScore = Math.round(totalScore / scrapedPages.length);
        
        // Generate top improvements
        const topImprovements = generateTopImprovements(pageScores);

        // Store domain data
        await pool.query(
          'INSERT INTO domains (domain, overall_score, pages_analyzed, top_improvements) VALUES ($1, $2, $3, $4)',
          [domain, averageScore, scrapedPages.length, JSON.stringify(topImprovements)]
        );

        // Cache the result
        const result = {
          analysisId,
          domain,
          overallScore: averageScore,
          pagesAnalyzed: scrapedPages.length,
          topImprovements,
          pages: pageScores
        };

        await redisClient.setEx(`analysis:${domain}`, 3600, JSON.stringify(result));

      } catch (error) {
        console.error('Analysis error:', error);
      }
    }, 100);

  } catch (error) {
    console.error('Analyze route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analyze/:domain - Get analysis results for a domain
router.get('/:domain', async (req, res) => {
  try {
    const { domain } = req.params;

    // Check cache first
    const cachedResult = await redisClient.get(`analysis:${domain}`);
    if (cachedResult) {
      return res.json(JSON.parse(cachedResult));
    }

    // Get from database
    const domainResult = await pool.query(
      'SELECT * FROM domains WHERE domain = $1',
      [domain]
    );

    if (domainResult.rows.length === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    const domainData = domainResult.rows[0];
    const pages = await pool.query(
      'SELECT p.*, s.* FROM pages p LEFT JOIN scores s ON p.id = s.page_id WHERE p.domain = $1',
      [domain]
    );

    const result = {
      domain,
      overallScore: domainData.overall_score,
      pagesAnalyzed: domainData.pages_analyzed,
      topImprovements: domainData.top_improvements,
      pages: pages.rows
    };

    // Cache the result
    await redisClient.setEx(`analysis:${domain}`, 3600, JSON.stringify(result));
    res.json(result);

  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function generateTopImprovements(pageScores) {
  const improvements = [
    'Improve content structure and semantic markup',
    'Enhance relevance and intent clarity',
    'Optimize token efficiency and content density',
    'Strengthen internal linking and crawlability',
    'Increase likelihood of LLM output inclusion'
  ];

  return improvements.slice(0, 3);
}

module.exports = router; 