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

// GET all engagements
router.get("/", async (req, res) => {
  try {
    const engagementQuery = `
      SELECT e.*, v.vendor_name
      FROM engagement e
      JOIN vendor v ON e.engaged_vendor_id = v.vendor_id
    `;
    const engagements = await db.query(engagementQuery);

    res.json(engagements.rows);
  } catch (err) {
    console.error("Error fetching engagements:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/departments", async (req, res) => {
  try {
    const departmentQuery = "SELECT * FROM departments";
    const departments = await db.query(departmentQuery);
    res.json(departments.rows);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).send("Internal Server Error");
  }
});

// GET active engagements
router.get("/active", async (req, res) => {
  try {
    const engagementQuery = `
      SELECT e.*, v.vendor_name
      FROM engagement e
      JOIN vendor v ON e.engaged_vendor_id = v.vendor_id
      WHERE e.engagement_status = 'Active'
    `;
    const engagements = await db.query(engagementQuery);
    res.json(engagements.rows);
  } catch (err) {
    console.error("Error fetching active engagements:", err);
    res.status(500).send("Internal Server Error");
  }
});

// POST a new engagement with document uploads
router.post("/engagements", upload.array("documents"), async (req, res) => {
  const {
    engaged_vendor_id,
    engagement_name,
    engagement_type,
    start_date,
    end_date,
    engagement_status,
    contact_name,
    contact_email,
    contact_phone,
    engaged_department, // Add this line
  } = req.body;

  try {
    // Handle document metadata
    const documentMetadata = req.files.map((file) => ({
      name: file.originalname,
      path: file.path,
      category: req.body.document_category || "Uncategorized",
    }));

    // Insert engagement details
    const engagementQuery = `
      INSERT INTO engagement (
        engaged_vendor_id, engagement_name, engagement_type, start_date, end_date,
        engagement_status, contact_name, contact_email, contact_phone, documents, created_at, updated_at, engaged_department
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, NOW(), NOW(), $11
      ) RETURNING engagement_id;
    `;
    const engagementValues = [
      engaged_vendor_id,
      engagement_name,
      engagement_type,
      start_date,
      end_date,
      engagement_status,
      contact_name,
      contact_email,
      contact_phone,
      JSON.stringify(documentMetadata),
      engaged_department, // Add this line
    ];

    const engagementResult = await db.query(engagementQuery, engagementValues);
    const engagementId = engagementResult.rows[0].engagement_id;

    res.status(201).send({ engagement_id: engagementId });
  } catch (error) {
    console.error("Error in POST /engagements:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

