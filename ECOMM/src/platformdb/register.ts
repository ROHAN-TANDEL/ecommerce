import { register } from "./app.js";

import { HealthRepository } from "../modules/identity/repository/HealthRepository.js";
import { HealthService } from "../modules/identity/service/HealthService.js";
import { HealthValidator } from "../modules/identity/validator/HealthValidator.js";
import { HealthResponse } from "../modules/identity/response/HealthResponse.js";
import { HealthController } from "../modules/identity/controller/HealthController.js";

import { UserRepository } from "../modules/identity/repository/UserRepository.js";
import { UserResponse } from "../modules/identity/response/UserResponse.js";
import { UserServiceImpl } from "../modules/identity/service/UserService/UserServiceImpl.js";
import { UserController } from "../modules/identity/controller/UserController.js";
import { UserValidator } from "../modules/identity/validator/UserValidator.js";

register("healthRepository", HealthRepository);
register("healthService", HealthService);
register("healthValidator", HealthValidator);
register("healthResponse", HealthResponse);
register("healthController", HealthController);

register("userController", UserController);
register("userValidator", UserValidator);
register("userService", UserServiceImpl);
register("userRepository", UserRepository);
register("userResponse", UserResponse);

export default register;