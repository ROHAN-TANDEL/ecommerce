import { MasterMigrate } from "./migrator.js";

const product:any = process.argv[3];

const databaseRole:any = process.argv[4];

const migrate:any = new MasterMigrate();
await migrate.execute(product, databaseRole);
