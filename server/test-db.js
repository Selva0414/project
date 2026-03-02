const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection to:', connectionString.split('@')[1]);

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Connection Error:', err.message);
        if (err.message.includes('certificate is not yet valid')) {
            console.error('TIMING ISSUE DETECTED');
        }
    } else {
        console.log('Connection Successful! DB Time:', res.rows[0].now);
    }
    pool.end();
});
