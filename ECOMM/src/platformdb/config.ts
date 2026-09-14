export default class Config {

    private config(): any {
        return {
            authorization_management: {
                routes: ["TenantRoute"],
                identification: '/identity/management',
                database: {
                    master: {
                        status: true,
                        roles: {master: true},
                        migration : {
                            enabled: true,
                            path : [
                                "./src/migrations/authorization_management/master"
                            ]
                        },
                        credentials: {
                            host: "localhost",
                            port: 5432,
                            database: "authorization_management_master",
                            schema: "master",
                            user: "root",
                            password: "root123"
                        }
                    },

                    client: {
                        status: true,
                        roles: {client: true},
                        credentials: {
                            host: "localhost",
                            port: 5432,
                            database: "authorization_management_client",
                            user: "root",
                            password: "root123",
                        }
                    }
                }
            },

            identity_access_management: {
                routes: ["TenantRoute"],
                identification: '/identity/management',
                database: {
                    master: {
                        status: true,
                        roles: {master: true},
                        credentials: {
                            host: "localhost",
                            port: 5432,
                            database: "identity_access_management_master",
                            schema: "master",
                            user: "root",
                            password: "root123",
                        }
                    },

                    client: {
                        status: true,
                        roles: {client: true},
                        credentials: {
                            host: "localhost",
                            port: 5432,
                            database: "identity_access_management_client",
                            user: "root",
                            password: "root123",
                        }
                    }
                }
            }
        };
    }
}