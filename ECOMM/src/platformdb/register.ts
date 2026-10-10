import { register } from "./app.js";
import { ClientUserRepository } from "../modules/client_management/repository/ClientUserRepository.js";
import { ClientUserResponse } from "../modules/client_management/response/ClientUserResponse.js";
import { ClientUserServiceImpl } from "../modules/client_management/service/ClientUserService/ClientUserServiceImpl.js";
import { ClientUserController } from "../modules/client_management/controller/ClientUserController.js";
import { ClientUserValidator } from "../modules/client_management/validator/ClientUserValidator.js";

import { ClientProductRepository } from "../modules/client_management/repository/ClientProductRepository.js";
import { ClientProductResponse } from "../modules/client_management/response/ClientProductResponse.js";
import { ClientProductServiceImpl } from "../modules/client_management/service/ClientProductService/ClientProductServiceImpl.js";
import { ClientProductController } from "../modules/client_management/controller/ClientProductController.js";
import { ClientProductValidator } from "../modules/client_management/validator/ClientProductValidator.js";

import { ProductRepository } from "../modules/client_management/repository/ProductRepository.js";
import { ProductResponse } from "../modules/client_management/response/ProductResponse.js";
import { ProductServiceImpl } from "../modules/client_management/service/ProductService/ProductServiceImpl.js";
import { ProductController } from "../modules/client_management/controller/ProductController.js";
import { ProductValidator } from "../modules/client_management/validator/ProductValidator.js";

import { ClientRepository } from "../modules/client_management/repository/ClientRepository.js";
import { ClientResponse } from "../modules/client_management/response/ClientResponse.js";
import { ClientServiceImpl } from "../modules/client_management/service/ClientService/ClientServiceImpl.js";
import { ClientController } from "../modules/client_management/controller/ClientController.js";
import { ClientValidator } from "../modules/client_management/validator/ClientValidator.js";

import { PartnerRepository } from "../modules/client_management/repository/PartnerRepository.js";
import { PartnerResponse } from "../modules/client_management/response/PartnerResponse.js";
import { PartnerServiceImpl } from "../modules/client_management/service/PartnerService/PartnerServiceImpl.js";
import { PartnerController } from "../modules/client_management/controller/PartnerController.js";
import { PartnerValidator } from "../modules/client_management/validator/PartnerValidator.js";

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


register("partnerController", PartnerController);
register("partnerValidator", PartnerValidator);
register("partnerService", PartnerServiceImpl);
register("partnerRepository", PartnerRepository);
register("partnerResponse", PartnerResponse);


register("clientController", ClientController);
register("clientValidator", ClientValidator);
register("clientService", ClientServiceImpl);
register("clientRepository", ClientRepository);
register("clientResponse", ClientResponse);


register("productController", ProductController);
register("productValidator", ProductValidator);
register("productService", ProductServiceImpl);
register("productRepository", ProductRepository);
register("productResponse", ProductResponse);


register("clientProductController", ClientProductController);
register("clientProductValidator", ClientProductValidator);
register("clientProductService", ClientProductServiceImpl);
register("clientProductRepository", ClientProductRepository);
register("clientProductResponse", ClientProductResponse);


register("clientUserController", ClientUserController);
register("clientUserValidator", ClientUserValidator);
register("clientUserService", ClientUserServiceImpl);
register("clientUserRepository", ClientUserRepository);
register("clientUserResponse", ClientUserResponse);

export default register;