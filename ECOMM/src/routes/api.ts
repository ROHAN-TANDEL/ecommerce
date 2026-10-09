import {CustomerRoute} from "../modules/identity_management/routes/CustomerRoute.js";
import {EmployeeRoute} from "../modules/identity_management/routes/EmployeeRoute.js";
import {HealthRoute} from "../modules/identity_management/routes/HealthRoute.js";
import {UserRoute} from "../modules/identity_management/routes/UserRoute.js";

export const api = {
    'CustomerRoute': CustomerRoute,

    'EmployeeRoute': EmployeeRoute,

    'HealthRoute': HealthRoute,
    'UserRoute': UserRoute
};