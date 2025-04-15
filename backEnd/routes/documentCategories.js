const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming this is your PostgreSQL connection pool

// GET document categories
router.get('/', async (req, res) => {
  try {
    const { formType } = req.query;
    
    if (!formType) {
      return res.status(400).json({ error: 'formType parameter is required' });
    }
    
    // Using ILIKE for case-insensitive matching in PostgreSQL
    const query = `
      SELECT 
        category_id, 
        category_name, 
        form_type as "formType"
      FROM document_categories 
      WHERE form_type ILIKE $1
    `;
    
    const result = await db.query(query, [formType]);
    const categories = result.rows;
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching document categories:', error);
    res.status(500).json({ error: 'Failed to fetch document categories' });
  }
});

module.exports = router;