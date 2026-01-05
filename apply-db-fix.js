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

async function fixSchema() {
    try {
        await client.connect();
        console.log('✅ Connected to database.');

        console.log('Checking OrderItem table...');
        const checkResult = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'OrderItem' AND column_name = 'deliveredQuantity'
        `);

        if (checkResult.rows.length === 0) {
            console.log('Adding column "deliveredQuantity" to "OrderItem" table...');
            await client.query('ALTER TABLE "OrderItem" ADD COLUMN "deliveredQuantity" INTEGER DEFAULT 0');
            console.log('✅ Column added successfully!');
        } else {
            console.log('ℹ️ Column "deliveredQuantity" already exists.');
        }

        // Also check Order table status if needed, but the main error was deliveredQuantity

        console.log('Schema fix complete!');
    } catch (err) {
        console.error('❌ Error applying fix:', err);
    } finally {
        await client.end();
    }
}

fixSchema();
