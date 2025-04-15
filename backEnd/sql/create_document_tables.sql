-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_category VARCHAR(50),
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    status VARCHAR(50) DEFAULT 'Active',
    description TEXT,
    expiry_date DATE,
    tags TEXT,
    file_path VARCHAR(512) NOT NULL,
    file_size INT,
    file_type VARCHAR(255),
    original_filename VARCHAR(255),
    uploaded_by INT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    version DECIMAL(4,1) DEFAULT 1.0,
    last_modified_by INT,
    last_modified_date DATETIME,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id),
    FOREIGN KEY (last_modified_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create document_versions table to track version history
CREATE TABLE IF NOT EXISTS document_versions (
    version_id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    version DECIMAL(4,1) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size INT,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    change_notes TEXT,
    is_current BOOLEAN DEFAULT 0,
    FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create indexes for better performance
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_document_category ON documents(document_category);
CREATE INDEX idx_documents_related_entity ON documents(related_entity_type, related_entity_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_upload_date ON documents(upload_date);
CREATE INDEX idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_versions_version ON document_versions(version);
CREATE INDEX idx_document_versions_is_current ON document_versions(is_current); 