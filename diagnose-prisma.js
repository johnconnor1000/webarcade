const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const baseUrl = match ? match[1].trim().split('?')[0] : null;

if (!baseUrl) {
    console.error('Could not parse DATABASE_URL from .env');
    process.exit(1);
}

const dns = require('dns');

async function checkDNS(hostname) {
    console.log(`\n--- Checking DNS for ${hostname} ---`);
    return new Promise((resolve) => {
        dns.lookup(hostname, (err, address, family) => {
            if (err) {
                console.log(`❌ DNS Lookup FAILED: ${err.message}`);
                resolve(false);
            } else {
                console.log(`✅ DNS Lookup SUCCESS: ${address} (Family: ${family})`);
                resolve(true);
            }
        });
    });
}

async function testConnection(name, url) {
    console.log(`\n--- Testing ${name} ---`);
    console.log(`URL: ${url.replace(/:([^:@]+)@/, ':****@')}`); // Hide password

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        },
        log: ['info', 'warn', 'error']
    });

    try {
        await prisma.$connect();
        const count = await prisma.user.count();
        console.log(`✅ SUCCESS! User count: ${count}`);
        await prisma.$disconnect();
        return true;
    } catch (e) {
        console.log(`❌ FAILED: ${e.message.split('\n')[0]}`);
        // console.error(e);
        await prisma.$disconnect();
        return false;
    }
}

async function run() {
    console.log('Starting Prisma Connection Diagnostics...');

    const hostname = new URL(baseUrl).hostname;
    await checkDNS(hostname);

    // 1. Current from .env (with whatever params are there)
    // await testConnection('Current .env', match[1].trim());

    // 2. Clean URL
    await testConnection('Clean URL (No params)', baseUrl);

    // 3. With connect_timeout
    await testConnection('Timeout Increased', `${baseUrl}?connect_timeout=30`);

    // 4. With SSL accept loose
    // Prisma uses specific logic for SSL, usually implied by protocol but let's try pgbouncer false
    await testConnection('Pgbouncer=true + Timeout', `${baseUrl}?pgbouncer=true&connect_timeout=30`);

    // 5. Connection limit
    await testConnection('Connection Limit=1', `${baseUrl}?connection_limit=1&connect_timeout=30`);
}

run();
