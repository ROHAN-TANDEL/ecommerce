import { register } from "./app.js";
import { CustomerRepository } from "../modules/identity_management/repository/CustomerRepository.js";
import { CustomerResponse } from "../modules/identity_management/response/CustomerResponse.js";
import { CustomerServiceImpl } from "../modules/identity_management/service/CustomerService/CustomerServiceImpl.js";
import { CustomerController } from "../modules/identity_management/controller/CustomerController.js";
import { CustomerValidator } from "../modules/identity_management/validator/CustomerValidator.js";


import { UserRepository } from "../modules/identity_management/repository/UserRepository.js";
import { UserResponse } from "../modules/identity_management/response/UserResponse.js";
import { UserServiceImpl } from "../modules/identity_management/service/UserService/UserServiceImpl.js";
import { UserController } from "../modules/identity_management/controller/UserController.js";
import { UserValidator } from "../modules/identity_management/validator/UserValidator.js";


register("userController", UserController);
register("userValidator", UserValidator);
register("userService", UserServiceImpl);
register("userRepository", UserRepository);
register("userResponse", UserResponse);



register("customerController", CustomerController);
register("customerValidator", CustomerValidator);
register("customerService", CustomerServiceImpl);
register("customerRepository", CustomerRepository);
register("customerResponse", CustomerResponse);

import { SidebarController } from "../modules/navigation/controller/SidebarController.js";
register("sidebarController", SidebarController);

export default register;