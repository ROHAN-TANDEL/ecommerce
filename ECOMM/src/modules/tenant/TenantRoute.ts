import express from 'express';

export class TenantRoute {

    route(context)
    {
        console.log("Context received:", context); // Logs {message: "hello"}

        const childRouter = express.Router();

        childRouter.get('/', (req, res) => {
            res.json({
                data: {age : 22, height : 5.5},
                status: "success",
                msg: context.message // Accesses "hello" dynamically
            });
        });

        return childRouter;
    }
}