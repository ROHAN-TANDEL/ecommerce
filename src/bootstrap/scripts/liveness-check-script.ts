export class LivenessCheckScript {
    context;
    constructor(context: any) {
        this.context = context;
    }
    run() {
        return (_req: any, res: any) => res.status(200).json({ status: 'UP' });
    }
}
//# sourceMappingURL=liveness-check-script.js.map