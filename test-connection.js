const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env manually since we can't use dotenv easily without installing it optionally
const envPath = path.join(__dirname, '.env');
let databaseUrl = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=(.*)/);
    if (match) {
        databaseUrl = match[1].trim();
        console.log('Found DATABASE_URL in .env');
    } else {
        console.error('DATABASE_URL not found in .env');
        process.exit(1);
    }
} catch (err) {
    console.error('Error reading .env:', err.message);
    process.exit(1);
}

const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

console.log('Attempting to connect to database...');
console.log('URL hidden for security, but using host:', databaseUrl.split('@')[1].split(':')[0]);

client.connect()
    .then(() => {
        console.log('✅ Connection successful!');
        return client.query('SELECT NOW()');
    })
    .then(res => {
        console.log('Current time from DB:', res.rows[0].now);
        return client.end();
    })
    .catch(err => {
        console.error('❌ Connection failed:', err);
        console.error('Code:', err.code);
        console.error('Detail:', err.detail);
        console.error('Hint:', err.hint);
        client.end();
    });
