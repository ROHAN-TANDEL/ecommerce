import { register } from "./app.js";
import { HealthRepository } from "../modules/identity/repository/HealthRepository.js";
import {HealthService } from "../modules/identity/service/HealthService.js";
import { HealthValidator } from "../modules/identity/validator/HealthValidator.js";
import { HealthResponse } from "../modules/identity/response/HealthResponse.js";
import { HealthController } from "../modules/identity/controller/HealthController.js";

register("healthRepository", HealthRepository);
register("healthService", HealthService);
register("healthValidator", HealthValidator);
register("healthResponse", HealthResponse);
register("healthController", HealthController);

export default register;