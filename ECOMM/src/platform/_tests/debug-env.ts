// debug-env.ts

import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config();

console.log('🔍 Debugging Environment Variables\n');
console.log('=' .repeat(50));

// Check if .env loaded
console.log('\n📄 .env file loaded:', process.env.NODE_ENV || 'not set');

// Check all DOMAIN_* variables
console.log('\n📋 All DOMAIN_* variables:');
const domainVars = Object.keys(process.env).filter(key => key.startsWith('DOMAIN_'));
if (domainVars.length === 0) {
    console.log('   ❌ No DOMAIN_* variables found!');
    console.log('   💡 Check your .env file for: DOMAIN_* variables');
} else {
    for (const key of domainVars) {
        console.log(`   ✅ ${key}=${process.env[key]}`);
    }
}

// Check all DB_* variables
console.log('\n📋 All DB_* variables:');
const dbVars = Object.keys(process.env).filter(key => key.startsWith('DB_'));
if (dbVars.length === 0) {
    console.log('   ❌ No DB_* variables found!');
    console.log('   💡 Check your .env file for: DB_* variables');
} else {
    for (const key of dbVars) {
        console.log(`   ✅ ${key}=${process.env[key]}`);
    }
}

// Check exact keys we need
console.log('\n🎯 Required Variables Check:');
const required = [
    'DOMAIN_IDENTITY_ACCESS_MANAGEMENT_STATUS',
    'DOMAIN_IDENTITY_ACCESS_MANAGEMENT_MASTER_DB',
    'DB_IAM_MASTER_HOST',
    'DB_IAM_MASTER_DATABASE',
];

for (const key of required) {
    const value = process.env[key];
    console.log(`   ${key}: ${value ? '✅' : '❌'} ${value || 'MISSING'}`);
}

// Show .env file path
console.log('\n📁 .env file path:', path.resolve(process.cwd(), '.env'));

// Try to read .env file
import fs from 'fs';
try {
    const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
    console.log('\n📄 .env file content:');
    console.log('---');
    console.log(envContent);
    console.log('---');
} catch (error) {
    console.log('\n❌ Cannot read .env file:', (error as Error).message);
}