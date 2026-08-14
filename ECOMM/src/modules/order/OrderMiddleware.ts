export default class OrderMiddleware {

    constructor(public readonly context:any) {

    }

    public currentUser = async(req:any, _res:any, next:any) => {
        req.params.userId = req.user.id;
        next();
    }
}