import {HealthRoute} from "../modules/identity/routes/HealthRoute.js";
import UserRoute from "../modules/user/UserRoute.js";
import AuthRoute from "../modules/auth/AuthRoute.js";
import {ClientRoute} from "../modules/tenant/routes/ClientRoute.js";

export const api = {
    'HealthRoute': HealthRoute,
    'UserRoute': UserRoute,
    'AuthRoute': AuthRoute,
    'ClientRoute': ClientRoute
};