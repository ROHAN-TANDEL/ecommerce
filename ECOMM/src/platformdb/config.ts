export default class Config {

    private config(): any {
        return {
            identity_management: {
                routes: ["HealthRoute", "UserRoute",  "AuthRoute"],
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
                            database: "identity_access_management_master",
                            schema: "master",
                            user: "root",
                            password: "root123"
                        }
                    }
                }
            },
            client_management: {
                routes: ["ProductRoute", "BusinessRoute", "BusinessProductRoute", "ClientRoute"],
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