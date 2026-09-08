// test-platform.ts

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

console.log('🚀 Platform Test\n');
console.log('=' .repeat(50));

import Platform from '../index.js';

// ============================================================
// 1. Initialize Platform
// ============================================================

console.log('\n📦 Initializing Platform...');

let platform: Platform;
try {
    platform = Platform.getInstance();
    console.log('✅ Platform initialized successfully');
} catch (error) {
    console.error('❌ Platform initialization failed:', error);
    process.exit(1);
}

// ============================================================
// 2. Check Loaded Domains
// ============================================================

console.log('\n📋 Loaded Domains:');
const domains = platform.getConnectionManager().getDomains();

if (domains.length === 0) {
    console.error('❌ No domains loaded!');
    console.log('💡 Please ensure DOMAIN_* variables are set in .env');
    process.exit(1);
}

for (const domain of domains) {
    const config = platform.getConnectionManager().getDomainConfig(domain);
    console.log(`   ✅ ${domain}:`);
    console.log(`      Master DB: ${config.masterDb}`);
    console.log(`      Client DB: ${config.clientDb || 'None'}`);
    console.log(`      Tenant: ${config.tenant.enabled ? 'Enabled' : 'Disabled'}`);
}

// ============================================================
// 3. Test Database Connections
// ============================================================

console.log('\n🔌 Testing Database Connections...');

for (const domain of domains) {
    try {
        // Test master connection
        await platform.getConnectionManager().queryMaster(domain, 'SELECT 1');
        console.log(`   ✅ ${domain} (master): Connected`);
    } catch (error) {
        console.log(`   ❌ ${domain} (master): Failed - ${(error as Error).message}`);
    }

    try {
        // Test client connection (if configured)
        const config = platform.getConnectionManager().getDomainConfig(domain);
        if (config.clientDb) {
            await platform.getConnectionManager().queryClient(domain, 'SELECT 1');
            console.log(`   ✅ ${domain} (client): Connected`);
        } else {
            console.log(`   ⚠️ ${domain} (client): Not configured`);
        }
    } catch (error) {
        console.log(`   ❌ ${domain} (client): Failed - ${(error as Error).message}`);
    }
}

// ============================================================
// 4. Test API Registration
// ============================================================

console.log('\n📋 Testing API Registration...');

const testApis = [
    { id: 'test.user.get', method: 'GET', path: '/users/:id', domain: domains[0], tenant: true },
    { id: 'test.user.list', method: 'GET', path: '/users', domain: domains[0], tenant: true },
    { id: 'test.tenant.create', method: 'POST', path: '/tenants', domain: domains[0], tenant: false },
];

for (const api of testApis) {
    try {
        platform.getApiRegistry().register(api);
        console.log(`   ✅ API registered: ${api.method} ${api.path} → ${api.id}`);
    } catch (error) {
        console.log(`   ⚠️ API already registered: ${api.id}`);
    }
}

// ============================================================
// 5. Test API Matching
// ============================================================

console.log('\n🎯 Testing API Matching...');

const testPaths = [
    { method: 'GET', path: '/users/123' },
    { method: 'GET', path: '/users' },
    { method: 'POST', path: '/tenants' },
    { method: 'GET', path: '/unknown' },
];

for (const test of testPaths) {
    const match = platform.getApiRegistry().findMatch(test.method as any, test.path);
    if (match) {
        console.log(`   ✅ ${test.method} ${test.path} → ${match.api.id}`);
        console.log(`      Params: ${JSON.stringify(match.params)}`);
    } else {
        console.log(`   ⚠️ ${test.method} ${test.path} → No match found`);
    }
}

// ============================================================
// 6. Health Check
// ============================================================

console.log('\n🏥 Health Check:');

try {
    const health = await platform.healthCheck();
    for (const [domain, status] of Object.entries(health)) {
        console.log(`   ${domain}: ${status ? '✅ Healthy' : '❌ Unhealthy'}`);
    }
} catch (error) {
    console.error('   ❌ Health check failed:', (error as Error).message);
}

// ============================================================
// 7. Summary
// ============================================================

console.log('\n' + '=' .repeat(50));
console.log('📊 Test Summary:');
console.log(`   Domains Loaded: ${domains.length}`);
console.log(`   APIs Registered: ${platform.getApiRegistry().list().length}`);

const connected = await platform.healthCheck();
const healthy = Object.values(connected).filter(Boolean).length;
console.log(`   Healthy Connections: ${healthy}/${domains.length}`);

if (healthy === domains.length && domains.length > 0) {
    console.log('✅ All tests passed! 🎉');
} else {
    console.log('⚠️ Some tests failed. Check the logs above.');
}

// ============================================================
// 8. Cleanup
// ============================================================

console.log('\n🧹 Cleaning up...');
await platform.close();
console.log('✅ Done\n');

process.exit(0);