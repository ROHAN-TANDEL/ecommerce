import { TenantRoute } from '../modules/tenant/TenantRoute.js';
import {HealthRoute} from "../modules/identity/routes/HealthRoute.js";
import UserRoute from "../modules/user/UserRoute.js";
import AuthRoute from "../modules/auth/AuthRoute.js";

export const api = {
    'TenantRoute': TenantRoute,
    'HealthRoute': HealthRoute,
    'UserRoute': UserRoute,
    'AuthRoute': AuthRoute
};