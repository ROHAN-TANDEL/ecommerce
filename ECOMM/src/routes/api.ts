import {ClientUserRoute} from "../modules/client_management/routes/ClientUserRoute.js";
import {ClientProductRoute} from "../modules/client_management/routes/ClientProductRoute.js";
import {ProductRoute} from "../modules/client_management/routes/ProductRoute.js";
import {ClientRoute} from "../modules/client_management/routes/ClientRoute.js";
import {PartnerRoute} from "../modules/client_management/routes/PartnerRoute.js";
import {CustomerRoute} from "../modules/identity_management/routes/CustomerRoute.js";
import {UserRoute} from "../modules/identity_management/routes/UserRoute.js";
import {SidebarRoute} from "../modules/navigation/routes/SidebarRoute.js";

export const api = {
    'ClientUserRoute': ClientUserRoute,

    'ClientProductRoute': ClientProductRoute,

    'ProductRoute': ProductRoute,

    'ClientRoute': ClientRoute,

    'PartnerRoute': PartnerRoute,

    'CustomerRoute': CustomerRoute,

    'UserRoute': UserRoute,

    'SidebarRoute': SidebarRoute
};