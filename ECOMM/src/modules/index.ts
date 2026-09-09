import { UserRoute } from './identity/routes/UserRoute.js';
import { AuditRoute } from './identity/routes/AuditRoute.js';
import { RoleRoute } from './identity/routes/RoleRoute.js';
import { SubscriptionRoute } from './subscription/routes/SubscriptionRoute.js';
import { InvoiceRoute } from './subscription/routes/InvoiceRoute.js';
import { PaymentRoute } from './subscription/routes/PaymentRoute.js';

// Map route names to route classes
export const routeModules = new Map<string, any>([
    ['UserRoute', UserRoute],
    ['AuditRoute', AuditRoute],
    ['RoleRoute', RoleRoute],
    ['SubscriptionRoute', SubscriptionRoute],
    ['InvoiceRoute', InvoiceRoute],
    ['PaymentRoute', PaymentRoute],
]);
