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

async function patchVariantTable() {
    try {
        await client.connect();
        console.log('✅ Connected to database.');

        console.log('Checking ProductVariant table...');
        const checkResult = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'ProductVariant' AND column_name = 'imageUrl'
        `);

        if (checkResult.rows.length === 0) {
            console.log('Adding column "imageUrl" to "ProductVariant" table...');
            await client.query('ALTER TABLE "ProductVariant" ADD COLUMN "imageUrl" TEXT');
            console.log('✅ Column added successfully!');
        } else {
            console.log('ℹ️ Column "imageUrl" already exists.');
        }

        console.log('Database patch complete!');
    } catch (err) {
        console.error('❌ Error applying patch:', err);
    } finally {
        await client.end();
    }
}

patchVariantTable();
