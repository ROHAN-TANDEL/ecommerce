import { AsyncLocalStorage } from "async_hooks";

const storage:any = new AsyncLocalStorage();

const db:any = {

    run(
        value:any,
        callback:any
    )
    {
        return storage.run(
            value,
            callback
        );
    },

    get master()
    {
        return storage.getStore()?.master;
    },

    get client()
    {
        return storage.getStore()?.client;
    }
};

export default db;