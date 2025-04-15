const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all departments
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM departments ORDER BY department_name';
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router; 