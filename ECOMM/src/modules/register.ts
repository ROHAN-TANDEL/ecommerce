import { register } from "../platformdb/app.js";
import { HealthRepository } from "./identity/repository/HealthRepository.js";
import {HealthService } from "./identity/service/HealthService.js";
import { HealthValidator } from "./identity/validator/HealthValidator.js";
import { HealthResponse } from "./identity/response/HealthResponse.js";
import { HealthController } from "./identity/controller/HealthController.js";

register("healthRepository", HealthRepository);
register("healthService", HealthService);
register("healthValidator", HealthValidator);
register("healthResponse", HealthResponse);
register("healthController", HealthController);