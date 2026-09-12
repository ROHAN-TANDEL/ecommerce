import Platform from "./platform.js";
import RouteRegister from "./RouteRegister.js";

export default class Context {

    private routes : any = [];

    constructor(private readonly app:any)
    {
        this.station();
        this.inject();
    }

    station()
    {
        const pools = new Platform().getPools();
        this.routes = new RouteRegister(pools).routes();
    }

    inject()
    {
        for(const route of this.routes)
        {
            this.app.use(route);
        }
    }

    build()
    {
        return this.app;
    }

}