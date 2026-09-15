import { register } from "./app.js";
import { HealthRepository } from "../modules/identity/repository/HealthRepository.js";
import {HealthService } from "../modules/identity/service/HealthService.js";
import { HealthValidator } from "../modules/identity/validator/HealthValidator.js";
import { HealthResponse } from "../modules/identity/response/HealthResponse.js";
import { HealthController } from "../modules/identity/controller/HealthController.js";

import { ClientRepository } from "../modules/tenant/repository/ClientRepository.js";
import {ClientService } from "../modules/tenant/service/ClientService.js";
import { ClientValidator } from "../modules/tenant/validator/ClientValidator.js";
import { ClientResponse } from "../modules/tenant/response/ClientResponse.js";
import { ClientController } from "../modules/tenant/controller/ClientController.js";

register("healthRepository", HealthRepository);
register("healthService", HealthService);
register("healthValidator", HealthValidator);
register("healthResponse", HealthResponse);
register("healthController", HealthController);


register("clientRepository", ClientRepository);
register("clientService", ClientService);
register("clientValidator", ClientValidator);
register("clientResponse", ClientResponse);
register("clientController", ClientController);

export default register;