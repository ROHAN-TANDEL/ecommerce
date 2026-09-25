export interface ApiErrorResponse {
    error: string;
    code?: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId?: string;
}

export class ApiErrorHandler {
    handle(error: Error | any): ApiErrorResponse {
        const response: ApiErrorResponse = {
            error: error.message || 'Internal Server Error',
            timestamp: new Date().toISOString()
        };

        // Handle specific error types
        if (error.code) {
            response.code = error.code;
        }

        if (error.details) {
            response.details = error.details;
        }

        // Check if it's a tenant validation error
        if (error.message?.includes('tenant')) {
            response.code = 'TENANT_VALIDATION_FAILED';
        }

        return response;
    }

    // Factory method for creating errors
    static createError(
        message: string,
        code?: string,
        details?: Record<string, any>
    ): Error & { code?: string; details?: Record<string, any> } {
        const error = new Error(message) as any;
        if (code) error.code = code;
        if (details) error.details = details;
        return error;
    }

    // Create tenant validation error
    static tenantError(tenantId: string): Error & { code: string } {
        const error = new Error(`Invalid or inactive tenant: ${tenantId}`) as any;
        error.code = 'TENANT_VALIDATION_FAILED';
        return error;
    }

    // Create API not found error
    static apiNotFoundError(apiId: string): Error & { code: string } {
        const error = new Error(`API not registered: ${apiId}`) as any;
        error.code = 'API_NOT_FOUND';
        return error;
    }
}