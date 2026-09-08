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
    private isShuttingDown: boolean = false;
    private queryLogs: QueryLogEntry[] = [];
    private slowQueryThreshold: number = 1000; // 1 second
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

    /**
     * Setup pool event listeners
     */
    private setupEventListeners(): void {
        this.on('pool:created', (key: string, config: any) => {
            console.log(`🔌 Pool created: ${key}`);
            console.log(`   Config: max=${config.maxConnections}, idle=${config.idleTimeout}ms`);
        });

        this.on('pool:connected', (key: string) => {
            console.log(`✅ Pool connected: ${key}`);
        });

        this.on('pool:error', (key: string, error: Error) => {
            console.error(`❌ Pool error [${key}]:`, error);
        });

        this.on('pool:closed', (key: string) => {
            console.log(`🔒 Pool closed: ${key}`);
        });

        this.on('connection:acquired', (key: string, id: number) => {
            if (process.env.DEBUG_POOL === 'true') {
                console.log(`📤 Connection acquired [${key}]: ${id}`);
            }
        });

        this.on('connection:released', (key: string, id: number) => {
            if (process.env.DEBUG_POOL === 'true') {
                console.log(`📥 Connection released [${key}]: ${id}`);
            }
        });

        this.on('connection:leak', (key: string, count: number) => {
            console.warn(`⚠️ Potential connection leak detected [${key}]: ${count} connections not released`);
        });
    }

    /**
     * Register event listeners
     */
    on(event: string, callback: Function): void {
        if (!this.connectionEvents.has(event)) {
            this.connectionEvents.set(event, []);
        }
        this.connectionEvents.get(event)!.push(callback);
    }

    /**
     * Emit event
     */
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

    /**
     * Start connection leak detection
     */
    private startLeakDetection(): void {
        this.leakDetectionInterval = setInterval(() => {
            for (const [key, connections] of this.activeConnections) {
                if (connections.size > 0) {
                    this.emit('connection:leak', key, connections.size);

                    // Log detailed leak info in debug mode
                    if (process.env.DEBUG_POOL === 'true') {
                        console.warn(`   Connection stack traces:`);
                        for (const client of connections) {
                            // @ts-ignore - stack trace attached to client
                            if (client._acquireStack) {
                                console.warn(`     ${client._acquireStack}`);
                            }
                        }
                    }
                }
            }
        }, 30000); // Check every 30 seconds
    }

    /**
     * Create a pool with configuration and retry logic
     */
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

            // Set up pool event listeners
            pool.on('connect', (client) => {
                this.emit('pool:connected', key);
                this.emit('connection:acquired', key, Date.now());

                // Track connection for leak detection
                if (!this.activeConnections.has(key)) {
                    this.activeConnections.set(key, new Set());
                }
                this.activeConnections.get(key)!.add(client);

                // @ts-ignore - store stack trace for leak detection
                client._acquireStack = new Error().stack;
            });

            pool.on('acquire', (client) => {
                this.emit('connection:acquired', key, Date.now());
            });

            pool.on('release', (client) => {
                this.emit('connection:released', key, Date.now());

                // Remove from active connections
                const connections = this.activeConnections.get(key);
                if (connections) {
                    connections.delete(client);
                }
            });

            pool.on('remove', (client) => {
                this.emit('connection:removed', key, Date.now());
                const connections = this.activeConnections.get(key);
                if (connections) {
                    connections.delete(client);
                }
            });

            pool.on('error', (err) => {
                this.emit('pool:error', key, err);
            });

            // Test connection with retry
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

        } catch (error) {
            // Retry logic
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

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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
            // Store config
            this.poolConfigs.set(key, config.pool || defaultPoolConfig);


            // Create pool with retry
            const pool = await this.createPoolWithRetry(productId, role, config);


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
                this.emit('connection:error', key, err);
            }

            originalRelease(err);
        };

        return client;
    }

    /**
     * Execute a query with logging and performance tracking
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

            // Update stats
            const info = this.pools.get(key);
            if (info) {
                this.updatePoolStats(info);
            }

            return result;

        } catch (error) {
            const duration = Date.now() - start;
            this.logQuery(productId, role, text, params, duration, true, error.message);

            console.error(`Query error [${key}]:`, error);
            throw error;
        }
    }

    /**
     * Log query with performance tracking
     */
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
            productId,
            role,
            query,
            params,
            duration,
            timestamp: new Date(),
            slow,
            error: errorMessage
        };

        this.queryLogs.push(entry);

        // Trim logs if too large
        if (this.queryLogs.length > this.maxQueryLogs) {
            this.queryLogs = this.queryLogs.slice(-this.maxQueryLogs);
        }

        // Log slow queries
        if (slow) {
            console.warn(`⚠️ Slow query [${productId}:${role}]: ${duration}ms`, {
                query: query.substring(0, 200),
                params,
                duration
            });
        }

        // Log errors
        if (error) {
            console.error(`❌ Query error [${productId}:${role}]: ${duration}ms`, {
                query: query.substring(0, 200),
                params,
                error: errorMessage
            });
        }
    }

    /**
     * Execute a transaction with auto-connection management
     */
    /**
     * Execute a transaction with logging
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
     * Get query logs
     */
    getQueryLogs(limit: number = 100, filter?: { productId?: string; role?: string; slow?: boolean }): QueryLogEntry[] {
        let logs = this.queryLogs;

        if (filter) {
            if (filter.productId) {
                logs = logs.filter(log => log.productId === filter.productId);
            }
            if (filter.role) {
                logs = logs.filter(log => log.role === filter.role);
            }
            if (filter.slow !== undefined) {
                logs = logs.filter(log => log.slow === filter.slow);
            }
        }

        return logs.slice(-limit).reverse();
    }

    /**
     * Clear query logs
     */
    clearQueryLogs(): void {
        this.queryLogs = [];
    }

    /**
     * Get query statistics
     */
    getQueryStats(productId?: string, role?: string): any {
        let logs = this.queryLogs;

        if (productId) {
            logs = logs.filter(log => log.productId === productId);
        }
        if (role) {
            logs = logs.filter(log => log.role === role);
        }

        if (logs.length === 0) {
            return { total: 0, slow: 0, errors: 0, avgDuration: 0 };
        }

        const total = logs.length;
        const slow = logs.filter(log => log.slow).length;
        const errors = logs.filter(log => log.error).length;
        const avgDuration = logs.reduce((sum, log) => sum + log.duration, 0) / total;
        const maxDuration = Math.max(...logs.map(log => log.duration));
        const minDuration = Math.min(...logs.map(log => log.duration));

        return {
            total,
            slow,
            errors,
            avgDuration: Math.round(avgDuration),
            maxDuration,
            minDuration
        };
    }

    /**
     * Health check for all pools
     */
    async healthCheck(): Promise<{ healthy: boolean; pools: any[] }> {
        const results: any[] = [];
        let allHealthy = true;

        for (const [key, info] of this.pools) {
            try {
                const client = await info.pool.connect();
                await client.query('SELECT 1');
                client.release();

                results.push({
                    key,
                    productId: info.productId,
                    role: info.role,
                    status: 'healthy',
                    stats: {
                        total: info.totalConnections,
                        idle: info.idleConnections,
                        active: info.activeConnections
                    }
                });
            } catch (error) {
                allHealthy = false;
                results.push({
                    key,
                    productId: info.productId,
                    role: info.role,
                    status: 'unhealthy',
                    error: error.message
                });
            }
        }

        return {
            healthy: allHealthy,
            pools: results
        };
    }

    /**
     * Get detailed connection leak information
     */
    getLeakInfo(): Record<string, number> {
        const result: Record<string, number> = {};
        for (const [key, connections] of this.activeConnections) {
            if (connections.size > 0) {
                result[key] = connections.size;
            }
        }
        return result;
    }

    /**
     * Close all pools with draining
     */
    async closeAll(): Promise<void> {
        if (this.isShuttingDown) return;

        this.isShuttingDown = true;
        console.log('\n🔄 Closing all database pools...');

        // Clear leak detection
        if (this.leakDetectionInterval) {
            clearInterval(this.leakDetectionInterval);
            this.leakDetectionInterval = undefined;
        }

        // Check for leaks before closing
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

    /**
     * Get pool key
     */
    private getPoolKey(productId: string, role: string): string {
        return `${productId}:${role}`;
    }

    /**
     * Update pool statistics
     */
    private updatePoolStats(info: ConnectionInfo): void {
        try {
            const pool = info.pool;
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
            'Waiting'.padEnd(10) +
            'Leaks'.padEnd(10)
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

        // Show query stats
        const queryStats = this.getQueryStats();
        console.log(`\n📊 Query Stats:`);
        console.log(`  Total: ${queryStats.total}`);
        console.log(`  Slow: ${queryStats.slow} (${queryStats.slow > 0 ? '⚠️' : '✅'})`);
        console.log(`  Errors: ${queryStats.errors} (${queryStats.errors > 0 ? '⚠️' : '✅'})`);
        console.log(`  Avg Duration: ${queryStats.avgDuration}ms`);
        console.log(`  Max Duration: ${queryStats.maxDuration}ms`);
        console.log('─'.repeat(80));
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