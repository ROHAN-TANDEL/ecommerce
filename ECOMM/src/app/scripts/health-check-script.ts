export default class HealthCheckScript {

    public check = async(_req:any, res:any) => {
        return res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV
        });
    }
}