import {HealthRoute} from "../modules/identity/routes/HealthRoute.js";
import AuthRoute from "../modules/auth/AuthRoute.js";
import {ClientRoute} from "../modules/tenant/routes/ClientRoute.js";
import {ProductRoute} from "../modules/tenant/routes/ProductRoute.js";
import {BusinessRoute} from "../modules/tenant/routes/BusinessRoute.js";
import {BusinessProductRoute} from "../modules/tenant/routes/BusinessProductRoute.js";
import {UserRoute} from "../modules/identity/routes/UserRoute.js";

export const api = {
    'HealthRoute': HealthRoute,
    'UserRoute': UserRoute,
    'AuthRoute': AuthRoute,
    'ClientRoute': ClientRoute,
    'ProductRoute': ProductRoute,
    'BusinessRoute': BusinessRoute,
    'BusinessProductRoute': BusinessProductRoute,
};