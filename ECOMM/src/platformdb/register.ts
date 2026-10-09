import { register } from "./app.js";
import { CustomerRepository } from "../modules/identity_management/repository/CustomerRepository.js";
import { CustomerResponse } from "../modules/identity_management/response/CustomerResponse.js";
import { CustomerServiceImpl } from "../modules/identity_management/service/CustomerService/CustomerServiceImpl.js";
import { CustomerController } from "../modules/identity_management/controller/CustomerController.js";
import { CustomerValidator } from "../modules/identity_management/validator/CustomerValidator.js";

import { EmployeeRepository } from "../modules/identity_management/repository/EmployeeRepository.js";
import { EmployeeResponse } from "../modules/identity_management/response/EmployeeResponse.js";
import { EmployeeServiceImpl } from "../modules/identity_management/service/EmployeeService/EmployeeServiceImpl.js";
import { EmployeeController } from "../modules/identity_management/controller/EmployeeController.js";
import { EmployeeValidator } from "../modules/identity_management/validator/EmployeeValidator.js";


import { HealthRepository } from "../modules/identity_management/repository/HealthRepository.js";
import { HealthService } from "../modules/identity_management/service/HealthService.js";
import { HealthValidator } from "../modules/identity_management/validator/HealthValidator.js";
import { HealthResponse } from "../modules/identity_management/response/HealthResponse.js";
import { HealthController } from "../modules/identity_management/controller/HealthController.js";

import { UserRepository } from "../modules/identity_management/repository/UserRepository.js";
import { UserResponse } from "../modules/identity_management/response/UserResponse.js";
import { UserServiceImpl } from "../modules/identity_management/service/UserService/UserServiceImpl.js";
import { UserController } from "../modules/identity_management/controller/UserController.js";
import { UserValidator } from "../modules/identity_management/validator/UserValidator.js";

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


register("employeeController", EmployeeController);
register("employeeValidator", EmployeeValidator);
register("employeeService", EmployeeServiceImpl);
register("employeeRepository", EmployeeRepository);
register("employeeResponse", EmployeeResponse);


register("customerController", CustomerController);
register("customerValidator", CustomerValidator);
register("customerService", CustomerServiceImpl);
register("customerRepository", CustomerRepository);
register("customerResponse", CustomerResponse);

export default register;