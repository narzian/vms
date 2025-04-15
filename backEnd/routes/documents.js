const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, JPG, and PNG files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Get all documents
router.get('/', requireAuth, async (req, res) => {
    try {
        const query = `
            SELECT d.*, 
                   v.vendor_name as related_entity_name,
                   'Vendor' as related_entity_type 
            FROM documents d
            LEFT JOIN vendors v ON d.related_entity_id = v.vendor_id AND d.related_entity_type = 'Vendor'
            WHERE d.related_entity_type = 'Vendor'
            
            UNION
            
            SELECT d.*, 
                   e.engagement_name as related_entity_name,
                   'Engagement' as related_entity_type 
            FROM documents d
            LEFT JOIN engagements e ON d.related_entity_id = e.engagement_id AND d.related_entity_type = 'Engagement'
            WHERE d.related_entity_type = 'Engagement'
            
            UNION
            
            SELECT d.*, 
                   dept.department_name as related_entity_name,
                   'Department' as related_entity_type 
            FROM documents d
            LEFT JOIN departments dept ON d.related_entity_id = dept.department_id AND d.related_entity_type = 'Department'
            WHERE d.related_entity_type = 'Department'
            
            UNION
            
            SELECT d.*, 
                   NULL as related_entity_name,
                   NULL as related_entity_type 
            FROM documents d
            WHERE d.related_entity_type IS NULL OR d.related_entity_type = ''
            
            ORDER BY upload_date DESC
        `;
        
        const documents = await db.query(query);
        
        // Parse tags if they exist
        documents.rows.forEach(doc => {
            if (doc.tags && typeof doc.tags === 'string') {
                try {
                    doc.tags = JSON.parse(doc.tags);
                } catch (e) {
                    doc.tags = [];
                }
            } else {
                doc.tags = [];
            }
        });
        
        res.json(documents.rows);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
});

// Upload a new document
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
    try {
        const { 
            document_name,
            document_type,
            document_category,
            related_entity_type,
            related_entity_id,
            status,
            description,
            expiry_date,
            tags
        } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        if (!document_name || !document_type) {
            return res.status(400).json({ message: 'Document name and type are required' });
        }
        
        // Process tags if they exist
        let processedTags = null;
        if (tags) {
            try {
                if (typeof tags === 'string') {
                    processedTags = tags;
                } else {
                    processedTags = JSON.stringify(tags);
                }
            } catch (e) {
                processedTags = null;
            }
        }
        
        const file_path = req.file.path;
        const file_size = req.file.size;
        const file_type = req.file.mimetype;
        const original_filename = req.file.originalname;
        
        // Insert document record
        const query = `
            INSERT INTO documents (
                document_name,
                document_type,
                document_category,
                related_entity_type,
                related_entity_id,
                status,
                description,
                expiry_date,
                tags,
                file_path,
                file_size,
                file_type,
                original_filename,
                uploaded_by,
                upload_date,
                version
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), 1.0) RETURNING document_id
        `;
        
        const result = await db.query(query, [
            document_name,
            document_type,
            document_category || null,
            related_entity_type || null,
            related_entity_id || null,
            status || 'Active',
            description || null,
            expiry_date || null,
            processedTags,
            file_path,
            file_size,
            file_type,
            original_filename,
            req.user.id
        ]);
        
        const documentId = result.rows[0].document_id;
        
        // Fetch the created document
        const createdDocument = await db.query(
            'SELECT * FROM documents WHERE document_id = $1',
            [documentId]
        );
        
        if (createdDocument.rows.length === 0) {
            return res.status(404).json({ message: 'Document not found after creation' });
        }
        
        // Also create an entry in document_versions
        await db.query(`
            INSERT INTO document_versions (
                document_id,
                version,
                file_path,
                file_size,
                created_by,
                created_at,
                change_notes,
                is_current
            ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, 1)
        `, [
            documentId,
            1.0,
            file_path,
            file_size,
            req.user.id,
            'Initial version',
        ]);
        
        // Parse tags if they exist
        const document = createdDocument.rows[0];
        if (document.tags && typeof document.tags === 'string') {
            try {
                document.tags = JSON.parse(document.tags);
            } catch (e) {
                document.tags = [];
            }
        } else {
            document.tags = [];
        }
        
        res.status(201).json(document);
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Failed to upload document' });
    }
});

// Get a specific document
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT d.*, 
                   CASE
                       WHEN d.related_entity_type = 'Vendor' THEN v.vendor_name
                       WHEN d.related_entity_type = 'Engagement' THEN e.engagement_name
                       WHEN d.related_entity_type = 'Department' THEN dept.department_name
                       ELSE NULL
                   END as related_entity_name
            FROM documents d
            LEFT JOIN vendors v ON d.related_entity_id = v.vendor_id AND d.related_entity_type = 'Vendor'
            LEFT JOIN engagements e ON d.related_entity_id = e.engagement_id AND d.related_entity_type = 'Engagement'
            LEFT JOIN departments dept ON d.related_entity_id = dept.department_id AND d.related_entity_type = 'Department'
            WHERE d.document_id = $1
        `;
        
        const document = await db.query(query, [id]);
        
        if (document.rows.length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        // Parse tags if they exist
        if (document.rows[0].tags && typeof document.rows[0].tags === 'string') {
            try {
                document.rows[0].tags = JSON.parse(document.rows[0].tags);
            } catch (e) {
                document.rows[0].tags = [];
            }
        } else {
            document.rows[0].tags = [];
        }
        
        res.json(document.rows[0]);
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ message: 'Failed to fetch document' });
    }
});

// Update a document (metadata only)
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            document_name,
            document_type,
            document_category,
            related_entity_type,
            related_entity_id,
            status,
            description,
            expiry_date,
            tags
        } = req.body;
        
        // Check if document exists
        const existingDoc = await db.query(
            'SELECT * FROM documents WHERE document_id = $1', 
            [id]
        );
        
        if (existingDoc.rows.length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        // Process tags if they exist
        let processedTags = null;
        if (tags) {
            try {
                if (typeof tags === 'string') {
                    processedTags = tags;
                } else {
                    processedTags = JSON.stringify(tags);
                }
            } catch (e) {
                processedTags = null;
            }
        }
        
        // Update document record
        const query = `
            UPDATE documents SET
                document_name = $1,
                document_type = $2,
                document_category = $3,
                related_entity_type = $4,
                related_entity_id = $5,
                status = $6,
                description = $7,
                expiry_date = $8,
                tags = $9,
                last_modified_by = $10,
                last_modified_date = NOW()
            WHERE document_id = $11
        `;
        
        await db.query(query, [
            document_name || existingDoc.rows[0].document_name,
            document_type || existingDoc.rows[0].document_type,
            document_category || existingDoc.rows[0].document_category,
            related_entity_type || existingDoc.rows[0].related_entity_type,
            related_entity_id || existingDoc.rows[0].related_entity_id,
            status || existingDoc.rows[0].status,
            description || existingDoc.rows[0].description,
            expiry_date || existingDoc.rows[0].expiry_date,
            processedTags || existingDoc.rows[0].tags,
            req.user.id,
            id
        ]);
        
        // Fetch the updated document
        const updatedDocument = await db.query(
            `SELECT d.*, 
                    CASE
                        WHEN d.related_entity_type = 'Vendor' THEN v.vendor_name
                        WHEN d.related_entity_type = 'Engagement' THEN e.engagement_name
                        WHEN d.related_entity_type = 'Department' THEN dept.department_name
                        ELSE NULL
                    END as related_entity_name
            FROM documents d
            LEFT JOIN vendors v ON d.related_entity_id = v.vendor_id AND d.related_entity_type = 'Vendor'
            LEFT JOIN engagements e ON d.related_entity_id = e.engagement_id AND d.related_entity_type = 'Engagement'
            LEFT JOIN departments dept ON d.related_entity_id = dept.department_id AND d.related_entity_type = 'Department'
            WHERE d.document_id = $1`,
            [id]
        );
        
        if (updatedDocument.rows.length === 0) {
            return res.status(404).json({ message: 'Document not found after update' });
        }
        
        // Parse tags if they exist
        if (updatedDocument.rows[0].tags && typeof updatedDocument.rows[0].tags === 'string') {
            try {
                updatedDocument.rows[0].tags = JSON.parse(updatedDocument.rows[0].tags);
            } catch (e) {
                updatedDocument.rows[0].tags = [];
            }
        } else {
            updatedDocument.rows[0].tags = [];
        }
        
        res.json(updatedDocument.rows[0]);
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Failed to update document' });
    }
});

// Update document file (create new version)
router.put('/:id/file', requireAuth, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { change_notes } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Check if document exists
        const existingDoc = await db.query(
            'SELECT * FROM documents WHERE document_id = $1', 
            [id]
        );
        
        if (existingDoc.rows.length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        const file_path = req.file.path;
        const file_size = req.file.size;
        const file_type = req.file.mimetype;
        const original_filename = req.file.originalname;
        
        // Calculate new version number
        const currentVersion = existingDoc.rows[0].version || 1.0;
        const newVersion = parseFloat(currentVersion) + 0.1;
        
        // Update document file and version info
        const documentQuery = `
            UPDATE documents SET
                file_path = $1,
                file_size = $2,
                file_type = $3,
                original_filename = $4,
                version = $5,
                last_modified_by = $6,
                last_modified_date = NOW()
            WHERE document_id = $7
        `;
        
        await db.query(documentQuery, [
            file_path,
            file_size,
            file_type,
            original_filename,
            newVersion,
            req.user.id,
            id
        ]);
        
        // Mark all existing versions as not current
        await db.query(
            'UPDATE document_versions SET is_current = 0 WHERE document_id = $1',
            [id]
        );
        
        // Create new version entry
        await db.query(`
            INSERT INTO document_versions (
                document_id,
                version,
                file_path,
                file_size,
                created_by,
                created_at,
                change_notes,
                is_current
            ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, 1)
        `, [
            id,
            newVersion,
            file_path,
            file_size,
            req.user.id,
            change_notes || `Version ${newVersion}`,
        ]);
        
        // Fetch the updated document
        const updatedDocument = await db.query(
            `SELECT d.*, 
                    CASE
                        WHEN d.related_entity_type = 'Vendor' THEN v.vendor_name
                        WHEN d.related_entity_type = 'Engagement' THEN e.engagement_name
                        WHEN d.related_entity_type = 'Department' THEN dept.department_name
                        ELSE NULL
                    END as related_entity_name
            FROM documents d
            LEFT JOIN vendors v ON d.related_entity_id = v.vendor_id AND d.related_entity_type = 'Vendor'
            LEFT JOIN engagements e ON d.related_entity_id = e.engagement_id AND d.related_entity_type = 'Engagement'
            LEFT JOIN departments dept ON d.related_entity_id = dept.department_id AND d.related_entity_type = 'Department'
            WHERE d.document_id = $1`,
            [id]
        );
        
        if (updatedDocument.rows.length === 0) {
            return res.status(404).json({ message: 'Document not found after update' });
        }
        
        // Parse tags if they exist
        if (updatedDocument.rows[0].tags && typeof updatedDocument.rows[0].tags === 'string') {
            try {
                updatedDocument.rows[0].tags = JSON.parse(updatedDocument.rows[0].tags);
            } catch (e) {
                updatedDocument.rows[0].tags = [];
            }
        } else {
            updatedDocument.rows[0].tags = [];
        }
        
        res.json(updatedDocument.rows[0]);
    } catch (error) {
        console.error('Error updating document file:', error);
        res.status(500).json({ message: 'Failed to update document file' });
    }
});

// Delete a document
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if document exists and get file paths
        const document = await db.query(
            'SELECT * FROM documents WHERE document_id = $1', 
            [id]
        );
        
        if (document.rows.length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        // Get all version file paths
        const versions = await db.query(
            'SELECT file_path FROM document_versions WHERE document_id = $1',
            [id]
        );
        
        // Delete the document record
        await db.query('DELETE FROM documents WHERE document_id = $1', [id]);
        
        // Delete version records
        await db.query('DELETE FROM document_versions WHERE document_id = $1', [id]);
        
        // Delete the files
        const allPaths = [document.rows[0].file_path, ...versions.rows.map(v => v.file_path)];
        const uniquePaths = [...new Set(allPaths)];
        
        uniquePaths.forEach(filePath => {
            try {
                if (filePath && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (err) {
                console.error(`Failed to delete file ${filePath}:`, err);
                // Continue even if file deletion fails
            }
        });
        
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Failed to delete document' });
    }
});

// Download document
router.get('/:id/download', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get document info
        const document = await db.query(
            'SELECT * FROM documents WHERE document_id = $1', 
            [id]
        );
        
        if (document.rows.length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        const { file_path, original_filename, file_type } = document.rows[0];
        
        if (!file_path || !fs.existsSync(file_path)) {
            return res.status(404).json({ message: 'Document file not found' });
        }
        
        // Set appropriate headers
        res.setHeader('Content-Type', file_type);
        res.setHeader('Content-Disposition', `attachment; filename="${original_filename}"`);
        
        // Stream the file
        const fileStream = fs.createReadStream(file_path);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ message: 'Failed to download document' });
    }
});

// Get document versions
router.get('/:id/versions', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if document exists
        const document = await db.query(
            'SELECT * FROM documents WHERE document_id = $1', 
            [id]
        );
        
        if (document.rows.length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        // Get all versions
        const versions = await db.query(`
            SELECT v.*, u.username as created_by_username
            FROM document_versions v
            LEFT JOIN users u ON v.created_by = u.user_id
            WHERE v.document_id = $1
            ORDER BY v.version DESC
        `, [id]);
        
        res.json(versions.rows);
    } catch (error) {
        console.error('Error fetching document versions:', error);
        res.status(500).json({ message: 'Failed to fetch document versions' });
    }
});

// Download specific version
router.get('/:id/versions/:versionId/download', requireAuth, async (req, res) => {
    try {
        const { id, versionId } = req.params;
        
        // Get version info
        const version = await db.query(
            'SELECT v.*, d.original_filename, d.file_type FROM document_versions v JOIN documents d ON v.document_id = d.document_id WHERE v.document_id = $1 AND v.version_id = $2', 
            [id, versionId]
        );
        
        if (version.rows.length === 0) {
            return res.status(404).json({ message: 'Document version not found' });
        }
        
        const { file_path, original_filename, file_type, version: versionNumber } = version.rows[0];
        
        if (!file_path || !fs.existsSync(file_path)) {
            return res.status(404).json({ message: 'Document version file not found' });
        }
        
        // Construct filename with version
        const filenameParts = original_filename.split('.');
        const ext = filenameParts.pop();
        const filenameWithVersion = `${filenameParts.join('.')}_v${versionNumber}.${ext}`;
        
        // Set appropriate headers
        res.setHeader('Content-Type', file_type);
        res.setHeader('Content-Disposition', `attachment; filename="${filenameWithVersion}"`);
        
        // Stream the file
        const fileStream = fs.createReadStream(file_path);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error downloading document version:', error);
        res.status(500).json({ message: 'Failed to download document version' });
    }
});

module.exports = router; 