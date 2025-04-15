-- Drop tables if they exist
DROP TABLE IF EXISTS departments CASCADE;

-- Create departments table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    department_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default departments
INSERT INTO departments (department_name, department_description) VALUES
    ('IT', 'Information Technology Department'),
    ('HR', 'Human Resources Department'),
    ('Finance', 'Finance Department'),
    ('Marketing', 'Marketing Department'),
    ('Sales', 'Sales Department'); 