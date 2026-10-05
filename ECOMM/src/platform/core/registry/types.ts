export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRegistration {
    id: string;
    method: ApiMethod;
    path: string;
    domain: string;
    tenant: boolean;
}

export interface ApiMatch {
    api: ApiRegistration;
    params: Record<string, string>;
}

export interface RequestContext {
    api: {
        id: string;
        method: string;
        path: string;
        domain: string;
    };
    tenant?: {
        id: string;
    };
}

export interface DatabaseInterface {
    domain(domainName: string): any;
    master(domainName: string): any;
    client(domainName: string): any;
    close(): Promise<void>;
    healthCheck(domain: string): Promise<boolean>;
}