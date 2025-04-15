const {Pool} = require('pg');

const db = new Pool({
    user: "postgres",
    host: "localhost",
    database: "vms_db1",
    password: "Narzian164",
    port: 5432,
});

module.exports = db;