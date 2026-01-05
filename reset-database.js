const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let databaseUrl = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=["']?(.*?)["']?(\s|$)/);
    if (match) {
        databaseUrl = match[1].trim();
        console.log('✅ Found DATABASE_URL in .env');
    } else {
        console.error('❌ DATABASE_URL not found in .env');
        process.exit(1);
    }
} catch (err) {
    console.error('❌ Error reading .env:', err.message);
    process.exit(1);
}

const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
});

async function resetDatabase() {
    try {
        await client.connect();
        console.log('✅ Connected to database.');

        console.log('Starting data wipe (keeping Products and Users)...');

        // Delete order items first (foreign key dependency)
        console.log('Wiping OrderItem table...');
        await client.query('DELETE FROM "OrderItem"');

        // Delete orders
        console.log('Wiping Order table...');
        await client.query('DELETE FROM "Order"');

        // Delete payments
        console.log('Wiping Payment table...');
        await client.query('DELETE FROM "Payment"');

        // Reset balances for all users to 0
        console.log('Resetting User balances to 0...');
        await client.query('UPDATE "User" SET "balance" = 0');

        console.log('✅ Database reset complete! History wiped and balances zeroed.');
    } catch (err) {
        console.error('❌ Error during database reset:', err);
    } finally {
        await client.end();
    }
}

resetDatabase();
