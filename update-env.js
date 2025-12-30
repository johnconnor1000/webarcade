const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

try {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Function to update a specific key
    const updateKey = (key) => {
        const regex = new RegExp(`${key}=(.*)`);
        const match = envContent.match(regex);

        if (match) {
            let value = match[1].trim();
            // Check if already has parameters
            if (!value.includes('?')) {
                // Add pooling parameters
                const newValue = `${value}?pgbouncer=true&connection_limit=1&connect_timeout=30`;
                envContent = envContent.replace(match[0], `${key}=${newValue}`);
                console.log(`Updated ${key} with parameters`);
            } else {
                console.log(`${key} already has parameters, skipping append`);
            }
        }
    };

    updateKey('DATABASE_URL');
    updateKey('DIRECT_URL');

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env updated successfully');

} catch (err) {
    console.error('Error updating .env:', err);
}
