// src/platform/database/ConnectionManager.ts
import { Pool, PoolClient } from 'pg';
import { DatabaseConfig } from '../config/ProductConfig.js';

export interface ConnectionInfo {
    productId: string;
    role: 'master' | 'client';
    pool: Pool;
    created: Date;
}

export class ConnectionManager {
    private pools: Map<string, ConnectionInfo> = new Map();

    private getPoolKey(productId: string, role: 'master' | 'client'): string {
        return `${productId}:${role}`;
    }

    async getConnection(
        productId: string,
        role: 'master' | 'client',
        config: DatabaseConfig
    ): Promise<Pool> {
        const key = this.getPoolKey(productId, role);

        // Check if pool exists
        let info = this.pools.get(key);

        if (!info) {
            // Create new pool
            const pool = new Pool({
                host: config.host,
                port: config.port,
                database: config.database,
                user: config.user,
                password: config.password,
                max: config.maxConnections || 20,
                idleTimeoutMillis: config.idleTimeout || 30000
            });

            // Test connection
            try {
                const client = await pool.connect();
                console.log(`✅ Connected to ${role} database for ${productId}: ${config.database}`);
                client.release();
            } catch (error) {
                await pool.end();
                throw new Error(`Failed to connect to ${role} database for ${productId}: ${error.message}`);
            }

            info = {
                productId,
                role,
                pool,
                created: new Date()
            };

            this.pools.set(key, info);
        }

        return info.pool;
    }

    async getMasterConnection(productId: string, config: DatabaseConfig): Promise<Pool> {
        return this.getConnection(productId, 'master', config);
    }

    async getClientConnection(productId: string, config: DatabaseConfig): Promise<Pool> {
        return this.getConnection(productId, 'client', config);
    }

    async query(
        productId: string,
        role: 'master' | 'client',
        config: DatabaseConfig,
        text: string,
        params?: any[]
    ): Promise<any> {
        const pool = await this.getConnection(productId, role, config);
        return pool.query(text, params);
    }

    async closeAll(): Promise<void> {
        const closePromises: Promise<void>[] = [];

        for (const [key, info] of this.pools) {
            console.log(`Closing pool: ${key}`);
            closePromises.push(info.pool.end());
        }

        await Promise.all(closePromises);
        this.pools.clear();
        console.log('✅ All database connections closed');
    }

    getPoolStats(): any[] {
        const stats: any[] = [];

        for (const [key, info] of this.pools) {
            stats.push({
                key,
                productId: info.productId,
                role: info.role,
                created: info.created,
                // @ts-ignore - accessing internal stats
                totalConnections: info.pool.totalCount || 0,
                // @ts-ignore
                idleConnections: info.pool.idleCount || 0
            });
        }

        return stats;
    }
}