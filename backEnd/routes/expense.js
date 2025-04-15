const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
});

// GET all expenses
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT e.*, v.vendor_name
      FROM expenses e
      LEFT JOIN vendor v ON e.vendor_id = v.vendor_id
      ORDER BY e.created_at DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/expense-engagements", async (req, res) => {
  try {
    const query = `
      SELECT 
        e.engagement_id, 
        e.engagement_name, 
        v.vendor_id, -- Include vendor_id
        v.vendor_name, 
        d.department_id, -- Include department_id
        d.department_name
      FROM engagement e
      JOIN vendor v ON e.engaged_vendor_id = v.vendor_id
      JOIN departments d ON e.engaged_department = d.department_name
      WHERE e.engagement_status = 'Active'
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching expense engagements:", error);
    res.status(500).send("Internal Server");
  }
});

router.post("/expenses", upload.array("documents"), async (req, res) => {
  const {
    vendor_id,
    department_id,
    engagement_id,
    expense_category,
    expense_description,
    expense_amount,
    expense_reference_type,
    expense_reference_number,
    expense_start_date,
    expense_end_date,
    original_currency,
    original_amount,
    tenure_days,
    tenure_months,
    tenure_years,
  } = req.body;

  console.log("Received data:", req.body); // Add this line

  // Validate required fields
  if (
    !vendor_id ||
    !department_id ||
    !engagement_id ||
    !expense_category ||
    !expense_description ||
    !expense_amount ||
    !expense_reference_type ||
    !expense_reference_number ||
    !expense_start_date ||
    !expense_end_date ||
    tenure_days === undefined ||
    tenure_months === undefined ||
    tenure_years === undefined
  ) {
    return res.status(400).json({ error: "All required fields must be provided." });
  }

  // Ensure date fields are not empty
  if (!expense_start_date || !expense_end_date) {
    return res.status(400).json({ error: "Start date and end date are required." });
  }

  try {
    const documentMetadata = req.files.map((file) => ({
      name: file.originalname,
      path: file.path,
      category: req.body.document_category || "Uncategorized",
    }));

    const expenseQuery = `
      INSERT INTO expenses (
        vendor_id,
        department_id,
        engagement_id,
        expense_category,
        expense_description,
        expense_amount,
        expense_reference_type,
        expense_reference_number,
        expense_start_date,
        expense_end_date,
        expense_status,
        original_currency,
        original_amount,
        tenure_days,
        tenure_months,
        tenure_years,
        documents,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING expense_id;
    `;
    const expenseValues = [
      vendor_id,
      department_id,
      engagement_id,
      expense_category,
      expense_description,
      parseFloat(expense_amount), // Ensure numeric values are properly parsed
      expense_reference_type,
      expense_reference_number,
      expense_start_date,
      expense_end_date,
      'Pending', // Default value for expense_status
      original_currency,
      parseFloat(original_amount), // Ensure numeric values are properly parsed
      parseInt(tenure_days, 10),   // Ensure numeric values are integers
      parseInt(tenure_months, 10), // Ensure numeric values are integers
      parseInt(tenure_years, 10),  // Ensure numeric values are integers
      JSON.stringify(documentMetadata), // Stringify the documents metadata for storage
      new Date(), // created_at
      new Date()  // updated_at
    ];

    console.log("Expense Values: ", expenseValues);
    const expenseResult = await db.query(expenseQuery, expenseValues);
    const expenseId = expenseResult.rows[0].expense_id;

    res.status(201).json({ message: "Expense added successfully", id: expenseId });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;