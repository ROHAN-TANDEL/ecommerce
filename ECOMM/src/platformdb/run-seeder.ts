import { MasterSeeder } from "./seeder.js";

const product:any = process.argv[3];

const databaseRole:any = process.argv[4];

const seed:any = new MasterSeeder();

const schema:any = '1000001';

await seed.execute(product, databaseRole, schema);
