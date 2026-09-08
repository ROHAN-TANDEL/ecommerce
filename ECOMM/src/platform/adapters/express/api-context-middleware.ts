import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiRegistry } from '../../core/registry/api-registry';
import { RequestContextBuilder } from '../../core/context/context-builder';
import { ApiMethod } from '../../core/registry/types';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            context?: import('../../core/context/context-builder').RequestContext;
        }
    }
}

export class ApiContextMiddleware {
    constructor(
        private readonly apiRegistry: ApiRegistry,
        private readonly contextBuilder: RequestContextBuilder
    ) {}

    /**
     * Get the middleware handler
     * This runs on EVERY request
     * It matches the route and builds context (validates tenant if needed)
     */
    getHandler(): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                // 1. Match the route using our trie
                const match = this.apiRegistry.findMatch(
                    req.method as ApiMethod,
                    req.path
                );

                if (match) {
                    // 2. Build context (validates tenant if needed)
                    const context = await this.contextBuilder.build(
                        {
                            method: req.method,
                            path: req.path,
                            headers: req.headers as Record<string, string | string[] | undefined>,
                            params: req.params
                        },
                        match.api.id
                    );

                    // 3. Attach to request
                    req.context = context;

                    // 4. Merge route params from our matcher
                    // This ensures params from pattern matching are available
                    req.params = { ...req.params, ...match.params };
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }
}