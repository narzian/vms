const getDocumentCategories = async (req, res) => {
  try {
    const { formType } = req.query;
    console.log("Requested formType:", formType); // Debug log
    
    const query = `
      SELECT category_id, category_name, description 
      FROM public.document_categories 
      WHERE form_type = $1 AND is_active = true
      ORDER BY category_id ASC
    `;
    
    const result = await pool.query(query, [formType]);
    console.log("Query results:", result.rows); // Debug log
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching document categories:', error);
    res.status(500).json({ error: 'Failed to fetch document categories' });
  }
};