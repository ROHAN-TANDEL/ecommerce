// src/platform/database/ConnectionManager.ts
import { Pool, type PoolClient } from 'pg';
import { type DatabaseConfig, type PoolConfig, defaultPoolConfig } from '../config/ProductConfig.js';
import { type TenantInfo } from '../tenant/TenantContext.js';

export interface ConnectionInfo {
    productId: string;
    role: string;
    pool: Pool;
    created: Date;
    lastUsed: Date;
    totalConnections: number;
    idleConnections: number;
    activeConnections: number;
    waitingRequests: number;
    config?: DatabaseConfig;
}

export interface PoolStats {
    key: string;
    productId: string;
    role: string;
    created: Date;
    lastUsed: Date;
    totalConnections: number;
    idleConnections: number;
    activeConnections: number;
    waitingRequests: number;
}

export interface QueryLogEntry {
    productId: string;
    role: string;
    query: string;
    params?: any[];
    duration: number;
    timestamp: Date;
    slow: boolean;
    error?: string;
}

export class ConnectionManager {
    private pools: Map<string, ConnectionInfo> = new Map();
    private poolConfigs: Map<string, PoolConfig> = new Map();
    isShuttingDown: boolean = false;
    private queryLogs: QueryLogEntry[] = [];
    private slowQueryThreshold: number = 1000;
    private maxQueryLogs: number = 1000;
    private leakDetectionInterval?: NodeJS.Timeout;
    private activeConnections: Map<string, Set<PoolClient>> = new Map();
    private connectionEvents: Map<string, Function[]> = new Map();

    // Connection retry configuration
    private readonly MAX_RETRIES: number = 3;
    private readonly RETRY_DELAY: number = 1000;
    private readonly RETRY_BACKOFF: number = 2;

    constructor(slowQueryThreshold: number = 1000) {
        this.slowQueryThreshold = slowQueryThreshold;
        this.startLeakDetection();
        this.setupEventListeners();
    }

    // ─────────────────────────────────────────────────────────────
    // Tenant-aware connection helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Get a connection with tenant schema switching
     */
    async getTenantConnection(
        productId: string,
        role: 'client',
        tenant: TenantInfo
    ): Promise<PoolClient> {
        const config = this.getRoleConfigFromStore(productId, role);
        if (!config) throw new Error(`No config for ${productId}:${role}`);

        const pool = await this.getPool(productId, role, config);
        const client = await pool.connect();

        try {
            await client.query(`SET search_path TO ${tenant.schema}`);
            this.emit('tenant:schema:switched', productId, tenant.id, tenant.schema);
            return client;
        } catch (error: any) {
            client.release();
            throw new Error(`Failed to switch to tenant schema "${tenant.schema}": ${error.message}`);
        }
    }

    /**
     * Get a master connection
     */
    async getMasterConnection(productId: string, role: 'master'): Promise<PoolClient> {
        const config = this.getRoleConfigFromStore(productId, role);
        if (!config) throw new Error(`No config for ${productId}:${role}`);

        const pool = await this.getPool(productId, role, config);
        const client = await pool.connect();

        if (config.schema) {
            try {
                await client.query(`SET search_path TO ${config.schema}`);
                this.emit('master:schema:switched', productId, config.schema);
            } catch (error: any) {
                client.release();
                throw new Error(`Failed to switch to master schema "${config.schema}": ${error.message}`);
            }
        }

        return client;
    }

    /**
     * Execute a query with tenant context
     */
    async queryWithTenant(
        productId: string,
        role: 'client',
        tenant: TenantInfo,
        text: string,
        params?: any[]
    ): Promise<any> {
        const client = await this.getTenantConnection(productId, role, tenant);
        const start = Date.now();

        try {
            const result = await client.query(text, params);
            const duration = Date.now() - start;
            this.logQuery(productId, role, text, params, duration, false);
            this.emit('query:executed', productId, tenant.id, text, duration);
            return result;
        } catch (error: any) {
            const duration = Date.now() - start;
            this.logQuery(productId, role, text, params, duration, true, error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Execute a transaction with tenant context
     */
    async withTenantTransaction<T>(
        productId: string,
        role: 'client',
        tenant: TenantInfo,
        callback: (client: PoolClient) => Promise<T>
    ): Promise<T> {
        const client = await this.getTenantConnection(productId, role, tenant);

        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            this.emit('transaction:committed', productId, tenant.id);
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            this.emit('transaction:rolledback', productId, tenant.id, error);
            throw error;
        } finally {
            client.release();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Core pool management
    // ─────────────────────────────────────────────────────────────

    /**
     * Get or create a connection pool for a product/role (lazy creation)
     */
    async getPool(productId: string, role: string, config: DatabaseConfig): Promise<Pool> {
        if (this.isShuttingDown) {
            throw new Error('ConnectionManager is shutting down');
        }

        const key = this.getPoolKey(productId, role);
        let info = this.pools.get(key);

        if (!info) {
            console.log(`🔌 Creating pool: ${key}`);
            this.poolConfigs.set(key, config.pool || defaultPoolConfig);

            const pool = await this.createPoolWithRetry(productId, role, config);

            pool.on('error', (err) => {
                console.error(`Pool error [${key}]:`, err);
            });

            info = {
                productId,
                role,
                pool,
                created: new Date(),
                lastUsed: new Date(),
                totalConnections: 0,
                idleConnections: 0,
                activeConnections: 0,
                waitingRequests: 0,
                config: { ...config }
            };

            this.pools.set(key, info);
        }

        info.lastUsed = new Date();
        this.updatePoolStats(info);

        return info.pool;
    }

    /**
     * Get a connection for explicit transaction management
     */
    async getConnection(productId: string, role: string, config: DatabaseConfig): Promise<PoolClient> {
        const pool = await this.getPool(productId, role, config);
        const client = await pool.connect();
        const key = this.getPoolKey(productId, role);

        const info = this.pools.get(key);
        if (info) {
            info.activeConnections = (info.activeConnections || 0) + 1;
            this.updatePoolStats(info);
        }

        const originalRelease = client.release.bind(client);
        client.release = (err?: any) => {
            if (info) {
                info.activeConnections = Math.max(0, (info.activeConnections || 0) - 1);
                this.updatePoolStats(info);
            }
            if (err) {
                console.error(`Connection release error [${key}]:`, err);
                this.emit('connection:error', key, err);
            }
            originalRelease(err);
        };

        return client;
    }

    /**
     * Execute a simple query (auto connection management)
     */
    async query(
        productId: string,
        role: string,
        config: DatabaseConfig,
        text: string,
        params?: any[]
    ): Promise<any> {
        const start = Date.now();
        const key = this.getPoolKey(productId, role);

        try {
            const pool = await this.getPool(productId, role, config);
            const result = await pool.query(text, params);
            const duration = Date.now() - start;
            this.logQuery(productId, role, text, params, duration, false);

            const info = this.pools.get(key);
            if (info) this.updatePoolStats(info);

            return result;
        } catch (error: any) {
            const duration = Date.now() - start;
            this.logQuery(productId, role, text, params, duration, true, error.message);
            console.error(`Query error [${key}]:`, error);
            throw error;
        }
    }

    /**
     * Execute a transaction
     */
    async withTransaction<T>(
        productId: string,
        role: string,
        config: DatabaseConfig,
        callback: (client: PoolClient) => Promise<T>
    ): Promise<T> {
        const start = Date.now();
        const key = this.getPoolKey(productId, role);
        const client = await this.getConnection(productId, role, config);

        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            const duration = Date.now() - start;
            console.log(`✅ Transaction committed [${key}]: ${duration}ms`);
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            const duration = Date.now() - start;
            console.error(`❌ Transaction rolled back [${key}]: ${duration}ms`, error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Execute multiple queries in a single transaction
     */
    async transaction(
        productId: string,
        role: string,
        config: DatabaseConfig,
        queries: Array<{ text: string; params?: any[] }>
    ): Promise<any[]> {
        return this.withTransaction(productId, role, config, async (client) => {
            const results: any[] = [];
            for (const query of queries) {
                const result = await client.query(query.text, query.params);
                results.push(result);
            }
            return results;
        });
    }

    // ─────────────────────────────────────────────────────────────
    // Pool creation
    // ─────────────────────────────────────────────────────────────

    private async createPoolWithRetry(
        productId: string,
        role: string,
        config: DatabaseConfig,
        attempt: number = 1
    ): Promise<Pool> {
        const key = this.getPoolKey(productId, role);
        const poolConfig = config.pool || defaultPoolConfig;

        try {
            const pool = new Pool({
                host: config.host,
                port: config.port,
                database: config.database,
                user: config.user,
                password: config.password,
                max: poolConfig.maxConnections,
                idleTimeoutMillis: poolConfig.idleTimeout,
                connectionTimeoutMillis: poolConfig.connectionTimeout,
                maxUses: poolConfig.maxUses,
                keepAlive: poolConfig.keepAlive,
                keepAliveInitialDelayMillis: poolConfig.keepAliveInitialDelay,
                statement_timeout: poolConfig.statementTimeout,
                query_timeout: poolConfig.queryTimeout,
                allowExitOnIdle: false
            });

            // Set up pool-level event listeners
            pool.on('connect', (client) => {
                this.emit('pool:connected', key);
                if (!this.activeConnections.has(key)) {
                    this.activeConnections.set(key, new Set());
                }
                this.activeConnections.get(key)!.add(client);
                // @ts-ignore
                client._acquireStack = new Error().stack;
            });

            pool.on('acquire', () => {
                this.emit('connection:acquired', key, Date.now());
            });

            pool.on('release', (client) => {
                this.emit('connection:released', key, Date.now());
                this.activeConnections.get(key)?.delete(client);
            });

            pool.on('remove', (client) => {
                this.emit('connection:removed', key, Date.now());
                this.activeConnections.get(key)?.delete(client);
            });

            pool.on('error', (err) => {
                this.emit('pool:error', key, err);
            });

            // Verify connectivity
            let client;
            try {
                client = await pool.connect();
            } catch (error) {
                await pool.end();
                throw error;
            }

            this.emit('pool:created', key, poolConfig);
            console.log(`✅ Connected to ${role} database for ${productId}: ${config.database}`);
            console.log(`   Pool: max=${poolConfig.maxConnections}, idle=${poolConfig.idleTimeout}ms`);

            client.release();
            return pool;

        } catch (error: any) {
            if (attempt < this.MAX_RETRIES) {
                const delay = this.RETRY_DELAY * Math.pow(this.RETRY_BACKOFF, attempt - 1);
                console.log(`🔄 Retry ${attempt}/${this.MAX_RETRIES} for ${key} in ${delay}ms...`);
                await this.sleep(delay);
                return this.createPoolWithRetry(productId, role, config, attempt + 1);
            }
            console.error(`❌ Failed to create pool ${key} after ${this.MAX_RETRIES} attempts`);
            throw error;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Stats & monitoring
    // ─────────────────────────────────────────────────────────────

    getPoolStats(): PoolStats[] {
        const stats: PoolStats[] = [];
        for (const [key, info] of this.pools) {
            this.updatePoolStats(info);
            stats.push({
                key,
                productId: info.productId,
                role: info.role,
                created: info.created,
                lastUsed: info.lastUsed,
                totalConnections: info.totalConnections,
                idleConnections: info.idleConnections,
                activeConnections: info.activeConnections,
                waitingRequests: info.waitingRequests
            });
        }
        return stats;
    }

    getPoolStatsFor(productId: string, role: string): PoolStats | null {
        const key = this.getPoolKey(productId, role);
        const info = this.pools.get(key);
        if (!info) return null;

        this.updatePoolStats(info);
        return {
            key,
            productId: info.productId,
            role: info.role,
            created: info.created,
            lastUsed: info.lastUsed,
            totalConnections: info.totalConnections,
            idleConnections: info.idleConnections,
            activeConnections: info.activeConnections,
            waitingRequests: info.waitingRequests
        };
    }

    getPoolInfo(productId: string, role: string): any {
        const key = this.getPoolKey(productId, role);
        const info = this.pools.get(key);
        if (!info) return null;

        const config = this.poolConfigs.get(key);

        return {
            key,
            productId: info.productId,
            role: info.role,
            config: config || defaultPoolConfig,
            created: info.created,
            lastUsed: info.lastUsed,
            stats: {
                totalConnections: info.totalConnections,
                idleConnections: info.idleConnections,
                activeConnections: info.activeConnections,
                waitingRequests: info.waitingRequests
            }
        };
    }

    getPoolConfig(productId: string, role: string): PoolConfig | null {
        const key = this.getPoolKey(productId, role);
        return this.poolConfigs.get(key) || null;
    }

    async updatePoolConfig(productId: string, role: string, config: Partial<PoolConfig>): Promise<void> {
        const key = this.getPoolKey(productId, role);
        const info = this.pools.get(key);

        if (!info) throw new Error(`Pool ${key} does not exist`);

        const currentConfig = this.poolConfigs.get(key) || defaultPoolConfig;
        const updatedConfig = { ...currentConfig, ...config };
        this.poolConfigs.set(key, updatedConfig);

        if (config.maxConnections) {
            console.log(`⚠️ maxConnections change requires pool recreation. New connections will use new max.`);
        }

        console.log(`✅ Updated pool config for ${key}:`, updatedConfig);
    }

    hasPool(productId: string, role: string): boolean {
        return this.pools.has(this.getPoolKey(productId, role));
    }

    getPoolKeys(): string[] {
        return Array.from(this.pools.keys());
    }

    // ─────────────────────────────────────────────────────────────
    // Query logging
    // ─────────────────────────────────────────────────────────────

    private logQuery(
        productId: string,
        role: string,
        query: string,
        params: any[] | undefined,
        duration: number,
        error: boolean,
        errorMessage?: string
    ): void {
        const slow = duration > this.slowQueryThreshold;

        const entry: QueryLogEntry = {
            productId, role, query, params, duration,
            timestamp: new Date(),
            slow,
            error: errorMessage
        };

        this.queryLogs.push(entry);

        if (this.queryLogs.length > this.maxQueryLogs) {
            this.queryLogs = this.queryLogs.slice(-this.maxQueryLogs);
        }

        if (slow) {
            console.warn(`⚠️ Slow query [${productId}:${role}]: ${duration}ms`, {
                query: query.substring(0, 200), params, duration
            });
        }

        if (error) {
            console.error(`❌ Query error [${productId}:${role}]: ${duration}ms`, {
                query: query.substring(0, 200), params, error: errorMessage
            });
        }
    }

    getQueryLogs(limit: number = 100, filter?: { productId?: string; role?: string; slow?: boolean }): QueryLogEntry[] {
        let logs = this.queryLogs;

        if (filter?.productId) logs = logs.filter(l => l.productId === filter.productId);
        if (filter?.role) logs = logs.filter(l => l.role === filter.role);
        if (filter?.slow !== undefined) logs = logs.filter(l => l.slow === filter.slow);

        return logs.slice(-limit).reverse();
    }

    clearQueryLogs(): void {
        this.queryLogs = [];
    }

    getQueryStats(productId?: string, role?: string): any {
        let logs = this.queryLogs;

        if (productId) logs = logs.filter(l => l.productId === productId);
        if (role) logs = logs.filter(l => l.role === role);

        if (logs.length === 0) {
            return { total: 0, slow: 0, errors: 0, avgDuration: 0, maxDuration: 0, minDuration: 0 };
        }

        const total = logs.length;
        const slow = logs.filter(l => l.slow).length;
        const errors = logs.filter(l => l.error).length;
        const avgDuration = logs.reduce((sum, l) => sum + l.duration, 0) / total;
        const maxDuration = Math.max(...logs.map(l => l.duration));
        const minDuration = Math.min(...logs.map(l => l.duration));

        return { total, slow, errors, avgDuration: Math.round(avgDuration), maxDuration, minDuration };
    }

    // ─────────────────────────────────────────────────────────────
    // Health check
    // ─────────────────────────────────────────────────────────────

    async healthCheck(): Promise<{ healthy: boolean; pools: any[] }> {
        const results: any[] = [];
        let allHealthy = true;

        for (const [key, info] of this.pools) {
            try {
                const client = await info.pool.connect();
                await client.query('SELECT 1');
                client.release();

                results.push({
                    key, productId: info.productId, role: info.role,
                    status: 'healthy',
                    stats: {
                        total: info.totalConnections,
                        idle: info.idleConnections,
                        active: info.activeConnections
                    }
                });
            } catch (error: any) {
                allHealthy = false;
                results.push({
                    key, productId: info.productId, role: info.role,
                    status: 'unhealthy',
                    error: error.message
                });
            }
        }

        return { healthy: allHealthy, pools: results };
    }

    // ─────────────────────────────────────────────────────────────
    // Leak detection
    // ─────────────────────────────────────────────────────────────

    getLeakInfo(): Record<string, number> {
        const result: Record<string, number> = {};
        for (const [key, connections] of this.activeConnections) {
            if (connections.size > 0) result[key] = connections.size;
        }
        return result;
    }

    private startLeakDetection(): void {
        this.leakDetectionInterval = setInterval(() => {
            for (const [key, connections] of this.activeConnections) {
                if (connections.size > 0) {
                    this.emit('connection:leak', key, connections.size);

                    if (process.env.DEBUG_POOL === 'true') {
                        console.warn(`   Connection leak [${key}]: ${connections.size} connections`);
                        for (const client of connections) {
                            // @ts-ignore
                            if (client._acquireStack) console.warn(`     ${client._acquireStack}`);
                        }
                    }
                }
            }
        }, 30000);
    }

    // ─────────────────────────────────────────────────────────────
    // Shutdown
    // ─────────────────────────────────────────────────────────────

    async closeAll(): Promise<void> {
        if (this.isShuttingDown) return;

        this.isShuttingDown = true;
        console.log('\n🔄 Closing all database pools...');

        if (this.leakDetectionInterval) {
            clearInterval(this.leakDetectionInterval);
            this.leakDetectionInterval = undefined;
        }

        const leaks = this.getLeakInfo();
        if (Object.keys(leaks).length > 0) {
            console.warn('⚠️ Connection leaks detected:', leaks);
        }

        const closePromises: Promise<void>[] = [];

        for (const [key, info] of this.pools) {
            console.log(`  Closing pool: ${key}`);
            closePromises.push(
                info.pool.end().then(() => {
                    this.emit('pool:closed', key);
                    console.log(`  ✅ Closed: ${key}`);
                }).catch((err) => {
                    console.error(`  ❌ Error closing ${key}:`, err);
                })
            );
        }

        await Promise.all(closePromises);
        this.pools.clear();
        this.poolConfigs.clear();
        this.activeConnections.clear();
        console.log('✅ All database pools closed');
    }

    // ─────────────────────────────────────────────────────────────
    // Event system
    // ─────────────────────────────────────────────────────────────

    on(event: string, callback: Function): void {
        if (!this.connectionEvents.has(event)) {
            this.connectionEvents.set(event, []);
        }
        this.connectionEvents.get(event)!.push(callback);
    }

    private emit(event: string, ...args: any[]): void {
        const callbacks = this.connectionEvents.get(event) || [];
        for (const callback of callbacks) {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        }
    }

    private setupEventListeners(): void {
        this.on('pool:created', (key: string, config: any) => {
            console.log(`🔌 Pool created: ${key}`);
            console.log(`   Config: max=${config.maxConnections}, idle=${config.idleTimeout}ms`);
        });

        this.on('pool:error', (key: string, error: Error) => {
            console.error(`❌ Pool error [${key}]:`, error);
        });

        this.on('pool:closed', (key: string) => {
            console.log(`🔒 Pool closed: ${key}`);
        });

        this.on('connection:acquired', (key: string) => {
            if (process.env.DEBUG_POOL === 'true') {
                console.log(`📤 Connection acquired [${key}]`);
            }
        });

        this.on('connection:released', (key: string) => {
            if (process.env.DEBUG_POOL === 'true') {
                console.log(`📥 Connection released [${key}]`);
            }
        });

        this.on('connection:leak', (key: string, count: number) => {
            console.warn(`⚠️ Potential connection leak detected [${key}]: ${count} connections not released`);
        });
    }

    // ─────────────────────────────────────────────────────────────
    // Logging
    // ─────────────────────────────────────────────────────────────

    logPoolStatus(): void {
        const stats = this.getPoolStats();

        if (stats.length === 0) {
            console.log('📊 No active pools');
            return;
        }

        console.log('\n📊 Pool Status:');
        console.log('─'.repeat(80));
        console.log(
            'Pool'.padEnd(30) + 'Total'.padEnd(10) + 'Idle'.padEnd(10) +
            'Active'.padEnd(10) + 'Waiting'.padEnd(10) + 'Leaks'.padEnd(10)
        );
        console.log('─'.repeat(80));

        for (const stat of stats) {
            const leakCount = (this.activeConnections.get(stat.key) || new Set()).size;
            console.log(
                stat.key.padEnd(30) +
                String(stat.totalConnections).padEnd(10) +
                String(stat.idleConnections).padEnd(10) +
                String(stat.activeConnections).padEnd(10) +
                String(stat.waitingRequests).padEnd(10) +
                String(leakCount > 0 ? `⚠️ ${leakCount}` : '✅').padEnd(10)
            );
        }
        console.log('─'.repeat(80));

        const queryStats = this.getQueryStats();
        console.log(`\n📊 Query Stats:`);
        console.log(`  Total: ${queryStats.total}`);
        console.log(`  Slow: ${queryStats.slow} (${queryStats.slow > 0 ? '⚠️' : '✅'})`);
        console.log(`  Errors: ${queryStats.errors} (${queryStats.errors > 0 ? '⚠️' : '✅'})`);
        console.log(`  Avg Duration: ${queryStats.avgDuration}ms`);
        console.log(`  Max Duration: ${queryStats.maxDuration}ms`);
        console.log('─'.repeat(80));
    }

    logPoolInfo(productId: string, role: string): void {
        const info = this.getPoolInfo(productId, role);
        if (!info) {
            console.log(`❌ Pool not found: ${productId}:${role}`);
            return;
        }

        console.log(`\n📊 Pool Info: ${info.key}`);
        console.log('─'.repeat(60));
        console.log(`Config:`);
        console.log(`  maxConnections: ${info.config.maxConnections}`);
        console.log(`  idleTimeout: ${info.config.idleTimeout}ms`);
        console.log(`  connectionTimeout: ${info.config.connectionTimeout}ms`);
        console.log(`  maxUses: ${info.config.maxUses}`);
        console.log(`  keepAlive: ${info.config.keepAlive}`);
        console.log(`Stats:`);
        console.log(`  total: ${info.stats.totalConnections}`);
        console.log(`  idle: ${info.stats.idleConnections}`);
        console.log(`  active: ${info.stats.activeConnections}`);
        console.log(`  waiting: ${info.stats.waitingRequests}`);
        console.log(`Created: ${info.created.toISOString()}`);
        console.log(`Last Used: ${info.lastUsed.toISOString()}`);
        console.log('─'.repeat(60));
    }

    // ─────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────

    private getPoolKey(productId: string, role: string): string {
        return `${productId}:${role}`;
    }

    private updatePoolStats(info: ConnectionInfo): void {
        try {
            const pool = info.pool as any;
            if (pool.totalCount !== undefined) {
                info.totalConnections = pool.totalCount || 0;
                info.idleConnections = pool.idleCount || 0;
                info.waitingRequests = pool.waitingCount || 0;
            }
        } catch {
            // silent fail
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Internal helper: retrieve stored DatabaseConfig from an already-created pool.
     * Used by tenant-aware methods that don't receive config directly.
     */
    private getRoleConfigFromStore(productId: string, role: string): DatabaseConfig | null {
        const key = this.getPoolKey(productId, role);
        const info = this.pools.get(key);
        return info?.config || null;
    }
}
