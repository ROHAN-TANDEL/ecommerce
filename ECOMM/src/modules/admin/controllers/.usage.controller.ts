// Master access
const tenants = await req.db.master.query('SELECT * FROM tenants');

// Client access (auto-tenant)
const users = await req.db.client.query('SELECT * FROM users');

// Manual tenant switch
const otherDb = req.db.withTenant('tenant_456');
const data = await otherDb.client.query('SELECT * FROM data');

// Transaction with tenant
const result = await req.db.client.withTransaction(async (client) => {
    // All queries use tenant schema
});