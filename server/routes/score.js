const express = require('express');
const router = express.Router();
const { pool, redisClient } = require('../index');

// GET /api/score/:pageId - Get detailed score breakdown for a page
router.get('/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;

    // Check cache first
    const cachedResult = await redisClient.get(`score:${pageId}`);
    if (cachedResult) {
      return res.json(JSON.parse(cachedResult));
    }

    // Get page and score data
    const result = await pool.query(
      `SELECT 
        p.id, p.url, p.title, p.description, p.metadata,
        s.structure_semantics, s.relevance_intent, s.token_efficiency, 
        s.link_graph, s.llm_output_likelihood, s.total_score, 
        s.summary, s.detailed_analysis, s.created_at
       FROM pages p 
       LEFT JOIN scores s ON p.id = s.page_id 
       WHERE p.id = $1`,
      [pageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const pageData = result.rows[0];

    // Format the response
    const scoreBreakdown = {
      pageId: pageData.id,
      url: pageData.url,
      title: pageData.title,
      description: pageData.description,
      metadata: pageData.metadata,
      scores: {
        structure_semantics: pageData.structure_semantics || 0,
        relevance_intent: pageData.relevance_intent || 0,
        token_efficiency: pageData.token_efficiency || 0,
        link_graph: pageData.link_graph || 0,
        llm_output_likelihood: pageData.llm_output_likelihood || 0,
        total_score: pageData.total_score || 0
      },
      summary: pageData.summary,
      detailed_analysis: pageData.detailed_analysis,
      created_at: pageData.created_at
    };

    // Cache the result
    await redisClient.setEx(`score:${pageId}`, 3600, JSON.stringify(scoreBreakdown));
    res.json(scoreBreakdown);

  } catch (error) {
    console.error('Score route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/score/domain/:domain - Get all scores for a domain
router.get('/domain/:domain', async (req, res) => {
  try {
    const { domain } = req.params;

    // Check cache first
    const cachedResult = await redisClient.get(`scores:${domain}`);
    if (cachedResult) {
      return res.json(JSON.parse(cachedResult));
    }

    // Get all pages and scores for the domain
    const result = await pool.query(
      `SELECT 
        p.id, p.url, p.title, p.description,
        s.structure_semantics, s.relevance_intent, s.token_efficiency, 
        s.link_graph, s.llm_output_likelihood, s.total_score, 
        s.summary, s.created_at
       FROM pages p 
       LEFT JOIN scores s ON p.id = s.page_id 
       WHERE p.domain = $1
       ORDER BY s.total_score DESC`,
      [domain]
    );

    const scores = result.rows.map(row => ({
      pageId: row.id,
      url: row.url,
      title: row.title,
      description: row.description,
      scores: {
        structure_semantics: row.structure_semantics || 0,
        relevance_intent: row.relevance_intent || 0,
        token_efficiency: row.token_efficiency || 0,
        link_graph: row.link_graph || 0,
        llm_output_likelihood: row.llm_output_likelihood || 0,
        total_score: row.total_score || 0
      },
      summary: row.summary,
      created_at: row.created_at
    }));

    // Cache the result
    await redisClient.setEx(`scores:${domain}`, 3600, JSON.stringify(scores));
    res.json(scores);

  } catch (error) {
    console.error('Domain scores route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 