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

import { ProductRepository } from "../modules/tenant/repository/ProductRepository.js";
import { ProductService } from "../modules/tenant/service/ProductService.js";
import { ProductController } from "../modules/tenant/controller/ProductController.js";

import { BusinessRepository } from "../modules/tenant/repository/BusinessRepository.js";
import { BusinessService } from "../modules/tenant/service/BusinessService.js";
import { BusinessController } from "../modules/tenant/controller/BusinessController.js";

import { BusinessProductRepository } from "../modules/tenant/repository/BusinessProductRepository.js";
import { BusinessProductService } from "../modules/tenant/service/BusinessProductService.js";
import { BusinessProductController } from "../modules/tenant/controller/BusinessProductController.js";
import {SchemaController} from "../modules/tenant/controller/SchemaController.js";

register("schemaController", SchemaController);

register("businessProductRepository", BusinessProductRepository);
register("businessProductService", BusinessProductService);
register("businessProductController", BusinessProductController);


register("businessRepository", BusinessRepository);
register("businessService", BusinessService);
register("businessController", BusinessController);


register("productRepository", ProductRepository);
register("productService", ProductService);
register("productController", ProductController);

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