// src/platform/domain-api-registry.ts

import { ApiRegistrar } from './api-registrar';
import { ApiRegistration } from './core/registry/types';

/**
 * DomainApiRegistry
 *
 * Organizes API registrations by domain
 * Makes it easy to see all APIs for a domain
 */
export class DomainApiRegistry {
    constructor(private readonly registrar: ApiRegistrar) {}

    /**
     * Register all Identity Access Management APIs
     */
    registerIAMAPIs(): void {
        this.registrar.registerAll([
            // Auth APIs
            this.registrar.post('iam.auth.login', '/auth/login', 'identity_access_management', false),
            this.registrar.post('iam.auth.logout', '/auth/logout', 'identity_access_management', true),
            this.registrar.post('iam.auth.refresh', '/auth/refresh', 'identity_access_management', true),

            // User APIs
            this.registrar.get('iam.user.get', '/users/:id', 'identity_access_management', true),
            this.registrar.get('iam.user.list', '/users', 'identity_access_management', true),
            this.registrar.post('iam.user.create', '/users', 'identity_access_management', true),
            this.registrar.put('iam.user.update', '/users/:id', 'identity_access_management', true),
            this.registrar.delete('iam.user.delete', '/users/:id', 'identity_access_management', true),

            // Tenant APIs
            this.registrar.post('iam.tenant.create', '/tenants', 'identity_access_management', false),
            this.registrar.get('iam.tenant.get', '/tenants/:id', 'identity_access_management', false),
            this.registrar.put('iam.tenant.update', '/tenants/:id', 'identity_access_management', false),

            // Role APIs
            this.registrar.get('iam.role.list', '/roles', 'identity_access_management', true),
            this.registrar.post('iam.role.create', '/roles', 'identity_access_management', true),
        ]);
    }

    /**
     * Register all Subscription Management APIs
     */
    registerSubscriptionAPIs(): void {
        this.registrar.registerAll([
            this.registrar.get('subscription.list', '/subscriptions', 'subscription_management', true),
            this.registrar.get('subscription.get', '/subscriptions/:id', 'subscription_management', true),
            this.registrar.post('subscription.create', '/subscriptions', 'subscription_management', true),
            this.registrar.put('subscription.update', '/subscriptions/:id', 'subscription_management', true),
            this.registrar.delete('subscription.cancel', '/subscriptions/:id/cancel', 'subscription_management', true),
        ]);
    }

    /**
     * Register all Product Management APIs
     */
    registerProductAPIs(): void {
        this.registrar.registerAll([
            this.registrar.get('product.list', '/products', 'product_management', true),
            this.registrar.get('product.get', '/products/:id', 'product_management', true),
            this.registrar.post('product.create', '/products', 'product_management', true),
            this.registrar.put('product.update', '/products/:id', 'product_management', true),
            this.registrar.delete('product.delete', '/products/:id', 'product_management', true),
        ]);
    }

    /**
     * Register all APIs for all domains
     */
    registerAll(): void {
        this.registerIAMAPIs();
        this.registerSubscriptionAPIs();
        this.registerProductAPIs();
    }
}