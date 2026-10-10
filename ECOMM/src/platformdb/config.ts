export default class Config {

    // public so SchemaManager and migrator can call it directly
    public config(): any {
        return {
            navigation: {
                routes: ["SidebarRoute"],
                identification: '/navigation',
                database: {}
            },
            identity_management: {
                routes: ["UserRoute", "CustomerRoute"],
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
                        seeder : {
                            enabled: true,
                            path : [
                                "./src/seeders/identity_management/master"
                            ]
                        },
                        credentials: {
                            host: "localhost",
                            port: 5432,
                            database: "nexora_identities_master",
                            schema: "master",
                            user: "root",
                            password: "root123"
                        }
                    }
                }
            },
            client_management: {
                routes: [, "PartnerRoute", "ClientRoute", "ProductRoute", "ClientProductRoute", "ClientUserRoute"],
                identification: '/client/management',
                database: {
                    master: {
                        status: true,
                        roles: {master: true},
                        migration : {
                            enabled: true,
                            path : ["./src/migrations/client_management/master"]
                        },
                        seeder : {
                            enabled: true,
                            path : ["./src/seeders/client_management/master"]
                        },
                        credentials: {
                            host: "localhost",
                            port: 5432,
                            database: "client_management_master",
                            schema: "master",
                            user: "root",
                            password: "root123"
                        }
                    },
                    client: {
                        status: true,
                        roles: {client: true},
                        schema_separation : true,
                        schemas : {
                            1000001 : {
                                schema_name : "i1000001",
                                credentials: {
                                    host: "localhost",
                                    port: 5432,
                                    database: "nexora_identities_client",
                                    user: "root",
                                    password: "root123",
                                },
                                status : true
                            }
                        },
                        migration : {
                            enabled: true,
                            path : [
                                "./src/migrations/client_management/client"
                            ]
                        },
                        seeder : {
                            enabled: true,
                            path : [
                                "./src/seeders/client_management/client"
                            ]
                        },
                        master_bound : {
                            self: false,
                            product_name: 'authorization_management',
                            database_role: 'master',
                        },
                        credentials: {
                            host: "localhost",
                            port: 5432,
                            database: "nexora_identities_client",
                            user: "root",
                            password: "root123",
                        }
                    }
                }
            }
        };
    }
}