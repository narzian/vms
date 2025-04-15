const fs = require('fs');
const path = require('path');
const db = require('../db');

async function setupTables() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, '../db/create_tables.sql'), 'utf8');
        await db.query(sql);
        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        process.exit();
    }
}

setupTables(); 