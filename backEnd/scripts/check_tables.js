const db = require('../db');

async function checkTables() {
    try {
        // Check vendors table
        const vendorsResult = await db.query('SELECT COUNT(*) as count FROM vendor');
        console.log('Vendors count:', vendorsResult.rows[0].count);

        // Check engagements table
        const engagementsResult = await db.query('SELECT COUNT(*) as count FROM engagement');
        console.log('Engagements count:', engagementsResult.rows[0].count);

        // Check expenses table
        const expensesResult = await db.query('SELECT COUNT(*) as count FROM expense');
        console.log('Expenses count:', expensesResult.rows[0].count);

        // Check departments table
        const departmentsResult = await db.query('SELECT COUNT(*) as count FROM departments');
        console.log('Departments count:', departmentsResult.rows[0].count);

        // Check table structures
        const tables = ['vendor', 'engagement', 'expense', 'departments'];
        for (const table of tables) {
            const structureResult = await db.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            console.log(`\n${table} table structure:`, structureResult.rows);
        }

    } catch (error) {
        console.error('Error checking tables:', error);
    } finally {
        process.exit();
    }
}

checkTables(); 