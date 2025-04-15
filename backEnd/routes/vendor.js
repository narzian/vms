const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

// GET all vendors
router.get("/", async (req, res) => {
  try {
    const vendorQuery = "SELECT * FROM vendor";
    const vendors = await db.query(vendorQuery);

    const addressQuery = `
      SELECT * FROM address WHERE vendor_id = ANY($1::int[]);
    `;
    const addressResults = await db.query(addressQuery, [
      vendors.rows.map((vendor) => vendor.vendor_id),
    ]);

    const addressesByVendor = addressResults.rows.reduce((acc, address) => {
      acc[address.vendor_id] = acc[address.vendor_id] || [];
      acc[address.vendor_id].push(address);
      return acc;
    }, {});

    const result = vendors.rows.map((vendor) => ({
      ...vendor,
      addresses: addressesByVendor[vendor.vendor_id] || [],
    }));

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/vendors/search", async (req, res) => {
  const { query } = req.query;
  try {
    const searchQuery = `
      SELECT vendor_id, vendor_name
      FROM vendor
      WHERE vendor_status = 'Active' AND vendor_name ILIKE $1
    `;
    const vendors = await db.query(searchQuery, [`%${query}%`]);
    res.json(vendors.rows);
  } catch (err) {
    console.error("Error fetching vendor suggestions:", err);
    res.status(500).send("Internal Server Error");
  }
});

// GET active vendors
router.get("/active", async (req, res) => {
  try {
    const vendorQuery = "SELECT * FROM vendor WHERE vendor_status = 'Active'";
    const vendors = await db.query(vendorQuery);
    res.json(vendors.rows);
  } catch (err) {
    console.error("Error fetching active vendors:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/", upload.array("documents"), async (req, res) => {
  const client = await db.connect();
  console.log("POST request received for /api/vendors");
  console.log("Form fields:", req.body);
  console.log("Files:", req.files);

  try {
    await client.query("BEGIN");

    // Extract vendor-specific fields
    const {
      vendor_name,
      vendor_type,
      vendor_tier,
      pan,
      gstin,
      primary_contact_name,
      primary_contact_phone,
      primary_contact_email,
      vendor_email,
      vendor_phone,
      vendor_status,
      comments,
    } = req.body;

    // Insert into vendor table
    const insertVendorText = `
      INSERT INTO vendor (
        vendor_name, vendor_type, vendor_tier, pan, gstin,
        primary_contact_name, primary_contact_phone, primary_contact_email,
        vendor_email, vendor_phone, vendor_status, comments,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING vendor_id
    `;

    const vendorValues = [
      vendor_name,
      vendor_type,
      vendor_tier,
      pan,
      gstin,
      primary_contact_name,
      primary_contact_phone,
      primary_contact_email,
      vendor_email,
      vendor_phone,
      vendor_status,
      comments,
    ];

    const vendorResult = await client.query(insertVendorText, vendorValues);
    const vendorId = vendorResult.rows[0].vendor_id;

    console.log("Vendor created with ID:", vendorId);

    // Extract address-specific fields
    const {
      country,
      state,
      city,
      address_line_1,
      address_line_2,
      landmark,
      zip_code,
    } = req.body;

    // Insert into address table
    const insertAddressText = `
      INSERT INTO address (
        vendor_id, address_type, address_line_1, address_line_2,
        city, state, zip_code, country, landmark, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    `;

    await client.query(insertAddressText, [
      vendorId,
      "Main", // Default address type
      address_line_1,
      address_line_2 || null,
      city,
      state,
      zip_code,
      country,
      landmark || null,
    ]);

    console.log("Address added for vendor");

    // Handle document uploads
    const files = req.files;
    const documentCategories = req.body.document_categories
      ? req.body.document_categories.split(",")
      : [];
    const validityFlags = req.body.validity_flags
      ? req.body.validity_flags.split(",")
      : [];
    const startDates = req.body.validity_start_dates
      ? req.body.validity_start_dates.split(",")
      : [];
    const endDates = req.body.validity_end_dates
      ? req.body.validity_end_dates.split(",")
      : [];

    if (files && files.length > 0) {
      const insertDocumentText = `
        INSERT INTO document (
          related_module,
          related_entity_id,
          document_type,
          document_name,
          original_file_name,
          file_size,
          mime_type,
          file_extension,
          storage_path,
          uploaded_by,
          document_category,
          validity_flag,
          validity_start_date,
          validity_end_date,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      `;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExtension = file.originalname.split(".").pop();
        const category =
          i < documentCategories.length
            ? documentCategories[i]
            : "Uncategorized";
        const validityFlag =
          i < validityFlags.length ? validityFlags[i] === "true" : false;
        const startDate =
          i < startDates.length && startDates[i] ? startDates[i] : null;
        const endDate = i < endDates.length && endDates[i] ? endDates[i] : null;

        await client.query(insertDocumentText, [
          "vendor", // related_module
          vendorId, // related_entity_id
          "vendor_doc", // document_type
          file.originalname, // document_name
          file.originalname, // original_file_name
          file.size, // file_size
          file.mimetype, // mime_type
          fileExtension, // file_extension
          file.path, // storage_path
          req.body.uploaded_by || 1, // uploaded_by (default to 1 if not provided)
          category, // document_category
          validityFlag, // validity_flag
          startDate, // validity_start_date
          endDate, // validity_end_date
        ]);
      }

      console.log(`${files.length} documents added for vendor`);
    }

    await client.query("COMMIT");
    res.status(201).json({
      message: "Vendor created successfully",
      vendor_id: vendorId,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in vendor creation:", error);
    res
      .status(500)
      .json({ error: "Failed to create vendor", details: error.message });
  } finally {
    client.release();
  }
});

router.put("/vendors/:id", upload.array("documents"), async (req, res) => {
  let { id } = req.params;
  let {
    vendor_name,
    vendor_type,
    vendor_tier,
    primary_contact_name,
    primary_contact_phone,
    primary_contact_email,
    vendor_status,
    pan,
    gstin,
    comments,
    addresses, // Ensure addresses are being handled
    document_categories,
  } = req.body;

  try {
    let documents = req.files
      ? req.files.map((file, index) => ({
          name: file.originalname,
          path: file.path,
          category: document_categories
            ? document_categories[index]
            : "Uncategorized",
        }))
      : [];

    let updateVendorQuery = `
      UPDATE vendor
      SET 
        vendor_name = $1, vendor_type = $2, vendor_tier = $3, 
        primary_contact_name = $4, primary_contact_phone = $5, primary_contact_email = $6,
        vendor_status = $7, pan = $8, gstin = $9, comments = $10, documents = $11,
        updated_at = NOW()
      WHERE vendor_id = $12;
    `;
    let updateVendorValues = [
      vendor_name,
      vendor_type,
      vendor_tier,
      primary_contact_name,
      primary_contact_phone,
      primary_contact_email,
      vendor_status,
      pan,
      gstin,
      comments,
      JSON.stringify(documents),
      id,
    ];
    await db.query(updateVendorQuery, updateVendorValues);

    await db.query("DELETE FROM address WHERE vendor_id = $1", [id]);

    let insertAddressQuery = `
      INSERT INTO address (
        vendor_id, address_type, address_line_1, address_line_2, city, state, zip_code, country, based_office, landmark
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      );
    `;
    for (let address of addresses) {
      let insertAddressValues = [
        id,
        address.address_type,
        address.address_line_1,
        address.address_line_2,
        address.city,
        address.state,
        address.zip_code,
        address.country,
        address.based_office,
        address.landmark || null,
      ];
      await db.query(insertAddressQuery, insertAddressValues);
    }

    res.send({ vendor_id: id });
  } catch (error) {
    console.error("Error in PUT /vendors/:id:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
