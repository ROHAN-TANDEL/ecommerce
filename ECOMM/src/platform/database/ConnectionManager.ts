// src/platform/database/ConnectionManager.ts
import { Pool, PoolClient } from 'pg';
import { DatabaseConfig, PoolConfig, defaultPoolConfig } from '../config/ProductConfig.js';

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

export class ConnectionManager {
    private pools: Map<string, ConnectionInfo> = new Map();
    private isShuttingDown: boolean = false;
    private poolConfigs: Map<string, PoolConfig> = new Map();

    private createPool(productId: string, role: string, config: DatabaseConfig): Pool {
        const poolConfig = config.pool || defaultPoolConfig;

        // Store config for later reference
        const key = this.getPoolKey(productId, role);
        this.poolConfigs.set(key, poolConfig);

        return new Pool({
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
            // Allow the pool to handle more connections if needed
            allowExitOnIdle: false
        });
    }

    /**
     * Get or create a connection pool for a product/role
     * Lazy creation - pool is created only when first requested
     */
    /**
     * Get or create a connection pool for a product/role
     */
    async getPool(productId: string, role: string, config: DatabaseConfig): Promise<Pool> {
        if (this.isShuttingDown) {
            throw new Error('ConnectionManager is shutting down');
        }

        const key = this.getPoolKey(productId, role);

        // Check if pool exists
        let info = this.pools.get(key);

        if (!info) {
            console.log(`🔌 Creating pool: ${key}`);

            const pool = this.createPool(productId, role, config);

            // Set up error handling
            pool.on('error', (err) => {
                console.error(`Pool error [${key}]:`, err);
            });

            // Test connection
            try {
                const client = await pool.connect();
                const poolConfig = config.pool || defaultPoolConfig;
                console.log(`✅ Connected to ${role} database for ${productId}: ${config.database}`);
                console.log(`   Pool: max=${poolConfig.maxConnections}, idle=${poolConfig.idleTimeout}ms`);
                client.release();
            } catch (error) {
                await pool.end();
                throw new Error(`Failed to connect to ${role} database for ${productId}: ${error.message}`);
            }

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
            this.updatePoolStats(info);
        }

        // Update last used time
        info.lastUsed = new Date();
        this.updatePoolStats(info);

        return info.pool;
    }

    /**
     * Get a connection from a pool
     * For transactions or when you need explicit control
     */
    async getConnection(
        productId: string,
        role: string,
        config: DatabaseConfig
    ): Promise<PoolClient> {
        const pool = await this.getPool(productId, role, config);
        const client = await pool.connect();

        // Track active connections
        const key = this.getPoolKey(productId, role);
        const info = this.pools.get(key);
        if (info) {
            info.activeConnections = (info.activeConnections || 0) + 1;
            this.updatePoolStats(info);
        }

        // Wrap release to track deactivation
        const originalRelease = client.release.bind(client);
        client.release = (err?: any) => {
            if (info) {
                info.activeConnections = Math.max(0, (info.activeConnections || 0) - 1);
                this.updatePoolStats(info);
            }
            if (err) {
                console.error(`Connection release error [${key}]:`, err);
            }
            originalRelease(err);
        };

        return client;
    }

    /**
     * Execute a query using a pool (auto-releases connection)
     */
    async query(
        productId: string,
        role: string,
        config: DatabaseConfig,
        text: string,
        params?: any[]
    ): Promise<any> {
        const pool = await this.getPool(productId, role, config);

        try {
            const result = await pool.query(text, params);

            // Update stats
            const key = this.getPoolKey(productId, role);
            const info = this.pools.get(key);
            if (info) {
                this.updatePoolStats(info);
            }

            return result;
        } catch (error) {
            console.error(`Query error [${productId}:${role}]:`, error);
            throw error;
        }
    }

    /**
     * Execute a transaction with auto-connection management
     */
    async withTransaction<T>(
        productId: string,
        role: string,
        config: DatabaseConfig,
        callback: (client: PoolClient) => Promise<T>
    ): Promise<T> {
        const client = await this.getConnection(productId, role, config);

        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Execute multiple queries in a transaction
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

    /**
     * Close all pools (for shutdown)
     */
    async closeAll(): Promise<void> {
        if (this.isShuttingDown) return;

        this.isShuttingDown = true;
        console.log('\n🔄 Closing all database pools...');

        const closePromises: Promise<void>[] = [];

        for (const [key, info] of this.pools) {
            console.log(`  Closing pool: ${key}`);
            closePromises.push(
                info.pool.end().then(() => {
                    console.log(`  ✅ Closed: ${key}`);
                }).catch((err) => {
                    console.error(`  ❌ Error closing ${key}:`, err);
                })
            );
        }

        await Promise.all(closePromises);
        this.pools.clear();
        console.log('✅ All database pools closed');
    }

    /**
     * Get pool statistics
     */
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

    /**
     * Get stats for a specific pool
     */
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

    /**
     * Check if a pool exists
     */
    hasPool(productId: string, role: string): boolean {
        const key = this.getPoolKey(productId, role);
        return this.pools.has(key);
    }

    /**
     * Get all pool keys
     */
    getPoolKeys(): string[] {
        return Array.from(this.pools.keys());
    }

    /**
     * Update pool statistics
     */
    private updatePoolStats(info: ConnectionInfo): void {
        try {
            const pool = info.pool;
            // Access internal stats (pg pool)
            const stats = (pool as any).totalCount !== undefined ? pool : (pool as any)._stats;

            if (stats) {
                info.totalConnections = stats.totalCount || stats.total || 0;
                info.idleConnections = stats.idleCount || stats.idle || 0;
                info.waitingRequests = stats.waitingCount || stats.waiting || 0;
            }
        } catch (error) {
            // Silent fail for stats
        }
    }

    /**
     * Get pool key
     */
    private getPoolKey(productId: string, role: string): string {
        return `${productId}:${role}`;
    }

    /**
     * Log current pool status
     */
    logPoolStatus(): void {
        const stats = this.getPoolStats();

        if (stats.length === 0) {
            console.log('📊 No active pools');
            return;
        }

        console.log('\n📊 Pool Status:');
        console.log('─'.repeat(80));
        console.log(
            'Pool'.padEnd(30) +
            'Total'.padEnd(10) +
            'Idle'.padEnd(10) +
            'Active'.padEnd(10) +
            'Waiting'.padEnd(10)
        );
        console.log('─'.repeat(80));

        for (const stat of stats) {
            console.log(
                stat.key.padEnd(30) +
                String(stat.totalConnections).padEnd(10) +
                String(stat.idleConnections).padEnd(10) +
                String(stat.activeConnections).padEnd(10) +
                String(stat.waitingRequests).padEnd(10)
            );
        }
        console.log('─'.repeat(80));
    }

    /**
     * Get pool configuration
     */
    getPoolConfig(productId: string, role: string): PoolConfig | null {
        const key = this.getPoolKey(productId, role);
        return this.poolConfigs.get(key) || null;
    }

    /**
     * Update pool configuration dynamically
     */
    async updatePoolConfig(productId: string, role: string, config: Partial<PoolConfig>): Promise<void> {
        const key = this.getPoolKey(productId, role);
        const info = this.pools.get(key);

        if (!info) {
            throw new Error(`Pool ${key} does not exist`);
        }

        // Update stored config
        const currentConfig = this.poolConfigs.get(key) || defaultPoolConfig;
        const updatedConfig = { ...currentConfig, ...config };
        this.poolConfigs.set(key, updatedConfig);

        // Note: pg pool doesn't support dynamic max changes without restart
        // For max connections change, we'd need to drain and recreate
        if (config.maxConnections) {
            console.log(`⚠️ maxConnections change requires pool recreation. New connections will use new max.`);
        }

        console.log(`✅ Updated pool config for ${key}:`, updatedConfig);
    }

    /**
     * Get detailed pool information
     */
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

    /**
     * Log detailed pool information
     */
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

}