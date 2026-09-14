export default class Config {

    private config(): any {
        return {
            identity_management: {
                routes: ["HealthRoute"],
                identification: '/identity/management',
                database: {
                    master: {
                        status: true,
                        roles: {master: true},
                        migration : {
                            enabled: true,
                            path : [
                                "./src/migrations/identity_management/master"
                            ]
                        },
                        credentials: {
                            host: "localhost",
                            port: 5432,
                            database: "identity_access_management_master",
                            schema: "master",
                            user: "root",
                            password: "root123"
                        }
                    }
                }
            },
            client_management: {
                routes: ["MembersRoute"],
                identification: '/identity/management',
                database: {
                    master: {
                        status: true,
                        roles: {master: true},
                        migration : {
                            enabled: true,
                            path : [
                                "./src/migrations/client_management/master"
                            ]
                        },
                        credentials: {
                            host: "localhost",
                            port: 5432,
                            database: "client_management_master",
                            schema: "master",
                            user: "root",
                            password: "root123"
                        }
                    }
                }
            },
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
                        schema_seperation : true,
                        master_bound : {
                            self: false,
                            product_name: 'authorization_management',
                            database_role: 'master',
                        },
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