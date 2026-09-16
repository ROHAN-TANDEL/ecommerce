import Platform from "./platform.js";
import RouteRegister from "./RouteRegister.js";

/** order matters */
import "./register.js";
import {SchemaManager} from "./SchemaManager.js";

export default class Context {

    private routes : any = [];
    private schema : any = [];

    constructor(private readonly app:any, private readonly context:any)
    {
        this.station();
        this.inject();
        this.attach();
    }

    station()
    {
        const pools = new Platform().getPools();
        this.routes = new RouteRegister(pools).routes();
        this.schema = new SchemaManager();
    }

    inject()
    {
        for(const route of this.routes)
        {
            this.app.use(route);
        }
    }

    attach()
    {
        this.context.schema = this.schema;
    }

    build()
    {
        return [this.app, this.context];
    }

}