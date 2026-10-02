import express from "express";
import {UserController} from "../controller/UserController";

export class UserRoute {

    route = () => {

        const router = express.Router();

        const user = app(UserController);

        //--FETCH--//
        /** create user **/
        router.post('/users/create', user.createUser.bind(user));
        /** TODO - create bulk users **/
            router.post('/users/create/bulk', user.createBulkUsers.bind(user));
        /** TODO - import users **/
            router.post('/users/create/import', user.importCreateUsers.bind(user));
        /** read user **/
        router.get('/users/:id', user.getUser.bind(user));
        /** get all users **/
        router.get('/users', user.getUsers.bind(user));
        /** TODO - user tables configuration **/
            router.get('/users/config/table', user.getUserTableConfig.bind(user));
        /** TODO - user columns configuration **/
            router.get('/users/config/columns', user.getUserColumnsConfig.bind(user));

        //--UPDATE--//
        /** update one user **/
        router.put('/users/update/:id', user.updateUser.bind(user));
        /** deactivate one user **/
        router.post('/users/update/status', user.updateUserStatus.bind(user));
        /** TODO - update more users **/
            router.post('/users/update/bulk', user.importUpdateUsers.bind(user));
        /** TODO - update more users with same data **/
            router.post('/users/update/all', user.updateAllUsers.bind(user));
        /** TODO - update more users via import **/
            router.post('/users/update/import', user.importUpdateUsers.bind(user));

        //--DELETE--//
        /** delete user **/
        router.delete('/users/delete/:id', user.deleteUser.bind(user));

        /** TODO - delete more users **/
            router.delete('/users/delete/all', user.deleteAllUsers.bind(user));

        return router;
    }
}
