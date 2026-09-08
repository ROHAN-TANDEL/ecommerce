// test-context.ts

import { ConnectionManager } from './platform';

const test = async () => {
    console.log('🚀 Testing Platform Context...\n');

    const cm = new ConnectionManager();

    console.log('📋 Domains loaded:');
    for (const domain of cm.getDomains()) {
        const config = cm.getDomainConfig(domain);
        console.log(`   ${domain}:`);
        console.log(`     Master DB: ${config.masterDb}`);
        console.log(`     Client DB: ${config.clientDb || 'None'}`);
        console.log(`     Tenant Enabled: ${config.tenant.enabled}`);
    }

    console.log('\n🔌 Testing connections...');

    // Test Identity Access Management
    try {
        await cm.queryMaster('identity_access_management', 'SELECT 1');
        console.log('✅ IAM Master: Connected');
    } catch (error) {
        console.log('❌ IAM Master: Failed');
    }

    try {
        await cm.queryClient('identity_access_management', 'SELECT 1');
        console.log('✅ IAM Client: Connected');
    } catch (error) {
        console.log('❌ IAM Client: Failed');
    }

    // Test Authorization Management
    try {
        await cm.queryMaster('authorization_management', 'SELECT 1');
        console.log('✅ AuthZ Master: Connected');
    } catch (error) {
        console.log('❌ AuthZ Master: Failed');
    }

    try {
        await cm.queryClient('authorization_management', 'SELECT 1');
        console.log('✅ AuthZ Client: Connected');
    } catch (error) {
        console.log('❌ AuthZ Client: Failed');
    }

    console.log('\n✨ Test complete');
    await cm.closeAll();
};

test().catch(console.error);