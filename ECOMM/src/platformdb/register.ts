import { register } from "./app.js";

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


export default register;