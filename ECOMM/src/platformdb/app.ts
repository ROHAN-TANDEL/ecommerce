import {
    createContainer,
    asClass
} from "awilix";

const container:any = createContainer();

const classes:any = new Map();

export const register = (name:any, target:any) =>
{
    classes.set(target, name);

    container.register({
        [name]: asClass(target)
    });
};

export const app = (target:any) => {
    if (typeof target === "string") {
        return container.resolve(target);
    }

    const name:any = classes.get(target);

    return container.resolve(name);
};

(globalThis as any).app = app;

export default container;