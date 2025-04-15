const db = require('../db');

async function checkSchema() {
    try {
        const result = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        
        console.log('Current users table schema:');
        console.log(result.rows);
        
        // Check if all required columns exist
        const requiredColumns = [
            'profile_picture',
            'first_name',
            'last_name',
            'phone_number',
            'department'
        ];
        
        const existingColumns = result.rows.map(col => col.column_name);
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length > 0) {
            console.log('\nMissing columns:', missingColumns);
            return false;
        } else {
            console.log('\nAll required columns exist!');
            return true;
        }
    } catch (error) {
        console.error('Error checking schema:', error);
        return false;
    }
}

checkSchema().then(() => process.exit()); 