const express = require('express');
const router = express.Router();
const { pool, redisClient } = require('../index');

// GET /api/overlay/:pageId - Get overlay highlights for a page
router.get('/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;

    // Check cache first
    const cachedResult = await redisClient.get(`overlay:${pageId}`);
    if (cachedResult) {
      return res.json(JSON.parse(cachedResult));
    }

    // Get page and overlay data
    const result = await pool.query(
      `SELECT 
        p.id, p.url, p.title, p.html, p.metadata,
        o.highlights
       FROM pages p 
       LEFT JOIN overlays o ON p.id = o.page_id 
       WHERE p.id = $1`,
      [pageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const pageData = result.rows[0];

    // Format the response
    const overlayData = {
      pageId: pageData.id,
      url: pageData.url,
      title: pageData.title,
      html: pageData.html,
      metadata: pageData.metadata,
      highlights: pageData.highlights || []
    };

    // Cache the result
    await redisClient.setEx(`overlay:${pageId}`, 3600, JSON.stringify(overlayData));
    res.json(overlayData);

  } catch (error) {
    console.error('Overlay route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/overlay/domain/:domain - Get all overlays for a domain
router.get('/domain/:domain', async (req, res) => {
  try {
    const { domain } = req.params;

    // Check cache first
    const cachedResult = await redisClient.get(`overlays:${domain}`);
    if (cachedResult) {
      return res.json(JSON.parse(cachedResult));
    }

    // Get all pages and overlays for the domain
    const result = await pool.query(
      `SELECT 
        p.id, p.url, p.title,
        o.highlights
       FROM pages p 
       LEFT JOIN overlays o ON p.id = o.page_id 
       WHERE p.domain = $1`,
      [domain]
    );

    const overlays = result.rows.map(row => ({
      pageId: row.id,
      url: row.url,
      title: row.title,
      highlights: row.highlights || []
    }));

    // Cache the result
    await redisClient.setEx(`overlays:${domain}`, 3600, JSON.stringify(overlays));
    res.json(overlays);

  } catch (error) {
    console.error('Domain overlays route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 