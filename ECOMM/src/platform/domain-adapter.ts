// src/platform/domain-adapter.ts

import { Database } from '../infra/database/pgsql';

/**
 * DomainAdapter
 *
 * Wraps your existing Database class to work with the platform
 * WITHOUT modifying the original Database class.
 */
export class DomainAdapter {
    constructor(private readonly database: Database) {}

    /**
     * Get domain configuration
     * Delegates to your existing database.domain() method
     */
    domain(domainName: string): any {
        return this.database.domain(domainName);
    }

    /**
     * Get master pool
     * Delegates to your existing database.master() method
     */
    master(domainName: string): any {
        return this.database.master(domainName);
    }

    /**
     * Get client pool
     * Delegates to your existing database.client() method
     */
    client(domainName: string): any {
        return this.database.client(domainName);
    }

    /**
     * Close all pools
     * Delegates to your existing database.close() method
     */
    async close(): Promise<void> {
        return this.database.close();
    }

    /**
     * Health check
     * Uses existing database.master() to test connection
     */
    async healthCheck(domain: string): Promise<boolean> {
        try {
            const pool = this.database.master(domain);
            await pool.query('SELECT 1');
            return true;
        } catch (error) {
            console.error(`Health check failed for ${domain}:`, error);
            return false;
        }
    }
}