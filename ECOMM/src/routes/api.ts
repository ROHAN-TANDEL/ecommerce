import {CustomerRoute} from "../modules/identity_management/routes/CustomerRoute.js";
import {UserRoute} from "../modules/identity_management/routes/UserRoute.js";
import {SidebarRoute} from "../modules/navigation/routes/SidebarRoute.js";

export const api = {
    'CustomerRoute': CustomerRoute,

    'UserRoute': UserRoute,

    'SidebarRoute': SidebarRoute
};