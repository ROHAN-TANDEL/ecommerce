import db from "./facade.js";

export const facadeMiddleware = (dbs:any) =>
{
    return (
        request:any,
        response:any,
        next:any
    ) =>
    {
        db.run(
            dbs,
            () =>
            {
                next();
            }
        );
    };
};