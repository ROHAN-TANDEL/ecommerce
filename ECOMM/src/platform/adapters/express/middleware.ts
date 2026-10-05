// src/platform/adapters/express/middleware.ts

import { type Request, type Response, type NextFunction, type RequestHandler } from 'express';
import { ConnectionManager } from '../../core/connection-manager';
import { ApiRegistry } from '../../core/api-registry';
import { ContextBuilder } from '../../core/context-builder';

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            context?: import('../../core/types').RequestContext;
        }
    }
}

export class ApiContextMiddleware {
    constructor(
        private readonly connectionManager: ConnectionManager,
        private readonly apiRegistry: ApiRegistry,
        private readonly contextBuilder: ContextBuilder
    ) {}

    /**
     * Main middleware handler
     * This runs on every request before routes
     */
    getHandler(): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                // 1. Find matching API
                const match = this.apiRegistry.findMatch(
                    req.method as any,
                    req.path
                );

                if (match) {
                    // 2. Build context
                    const context = await this.contextBuilder.build(req, match.api.id);

                    // 3. Attach to request
                    req.context = context;

                    // 4. Merge params from matcher
                    req.params = { ...req.params, ...match.params };
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }
}