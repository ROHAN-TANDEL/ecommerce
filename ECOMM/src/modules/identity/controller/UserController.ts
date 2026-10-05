import { UserColumnConfig } from "../config/user.column.config.js";
import { UserActionsConfig } from "../config/user.actions.config.js";

import {UserResponse} from "../response/UserResponse.js";
import {UserTableConfig} from "../config/user.table.config.js";

export class UserController {

    private readonly userService:any;
    private readonly userValidator:any;
    private readonly userResponse:any;

    constructor({ userService, userValidator, userResponse })
    {
        this.userService = userService;
        this.userValidator = userValidator;
        this.userResponse = userResponse;
    }

    async createUser(req, res)
    {
        try {
            const userInputs = this.userValidator.createUser(req);
            const user = await this.userService.createUser(userInputs);

            return res.status(200).json({
                data : null,
                message: "user created successfully",
                status : "success",
                code : 200
            });

        } catch (errors) {

            console.log({error: errors});

            return res.status(400).json({
                data : null,
                message: errors?.message ?? "user not created",
                status : "failed",
                code : 400
            });
        }
    }

    async getUser(req, res)
    {
        try {
            const inputs = this.userValidator.getUser(req);
            const user = await this.userService.getUser(inputs);

            return res.status(200).json({
                data : user,
                message: null,
                status : "success",
                code : 200
            });
        } catch(errors) {
            console.log({errors:errors});
            return res.status(200).json({
                data : null,
                message: "user not found",
                status : "failed",
                code : 400
            });
        }
    }

    async createAllUsers(req, res)
    {
        return res.status(200).json({message: "Working!"});
    }

    async getUsers(req, res)
    {
        try {
            const { page, limit } = this.userValidator.getUsers(req);

            const users = await this.userService.getUsers(page, limit);

            return res.status(200).json({
                ...users,
                message: null,
                status : "success",
                code : 200
            });

        } catch(errors) {

            console.log({errors:errors});

            return res.status(200).json({
                data : null,
                message: "user not found",
                status : "failed",
                code : 400
            });
        }
    }

    async updateUser(req, res)
    {
        try {
            const { params, body } = this.userValidator.updateUsers(req);

            const userId = params?.id;

            const users = await this.userService.updateUser(userId, body);

            return res.status(200).json({
                data : [{...users[0]}],
                message: null,
                status : "success",
                code : 200
            });

        } catch(errors) {

            console.log({errors:errors});

            return res.status(200).json({
                data : null,
                message: "user not found",
                status : "failed",
                code : 400
            });
        }
    }

    async deleteUser(req, res)
    {
        try {
            const inputs = this.userValidator.getUser(req);
            const user = await this.userService.deleteUser(inputs);

            return res.status(200).json({
                data : null,
                message: "user is deleted",
                status : "success",
                code : 200
            });

        }
        catch (errors) {
            console.log({errors: errors});
            return res.status(400).json({message : "user delete failed"});
        }
    }

    async updateUserStatus(req, res)
    {
        try {
            const inputs = this.userValidator.getUser(req);
            const user = await this.userService.deleteUser(inputs);

            return res.status(200).json({
                data : null,
                message: "user status update failed",
                status : "success",
                code : 200
            });

        }
        catch (errors) {
            console.log({errors: errors});
            return res.status(400).json({message : "user status update failed"});
        }
    }

    async getUserTableConfig(req, res) {
        return res.json(UserTableConfig);
    }

    async getUserColumnsConfig(req, res) {
        return res.json(UserColumnConfig);
    }

    async getUserActionsConfig(req, res) {
        return res.json(UserActionsConfig);
    }

    async createBulkUsers(req, res) {
        try {
            const users = this.userValidator.createBulkUsers(req);
            const result = await this.userService.createBulkUsers(users);
            return res.status(200).json({ data: result, message: "bulk users created", status: "success", code: 200 });
        } catch (errors) {
            console.log({error: errors});
            return res.status(400).json({ data: null, message: errors?.message ?? "bulk users not created", status: "failed", code: 400 });
        }
    }

    async updateBulkUsers(req, res) {
        try {
            const { data, filters, excluded } = this.userValidator.updateBulkUsers(req);
            const result = await this.userService.updateMatchingUsers(data, filters, excluded);
            return res.status(200).json({ data: result, message: "successully rows update requested", code: 200 });
        } catch (errors) {
            console.log({error: errors});
            return res.status(400).json({ data: null, message: "row update failed", code: 400 });
        }
    }

    async updateAllUsers(req, res) {
        try {
            const updates = this.userValidator.updateAllUsers(req);
            const result = await this.userService.updateBulkUsers(
                updates.map(({ id, ...data }) => ({ id, data }))
            );
            return res.status(200).json({ data: result, message: "successully rows update requested", code: 200 });
        } catch (errors) {
            console.log({error: errors});
            return res.status(400).json({ data: null, message: "row update failed", code: 400 });
        }
    }

    async updateAllUserStatus(req, res) {
        try {
            const { ids, status } = this.userValidator.updateStatus(req);
            const result = await this.userService.updateAllUsers(ids, { status: status.toUpperCase() });
            return res.status(200).json({ data: result, message: "successully rows update requested", code: 200 });
        } catch (errors) {
            console.log({error: errors});
            return res.status(400).json({ data: null, message: "row update failed", code: 400 });
        }
    }

    async updateBulkUserStatus(req, res) {
        try {
            const { status, filters, excluded } = this.userValidator.updateBulkStatus(req);
            const result = await this.userService.updateMatchingUsers({ status: status.toUpperCase() }, filters, excluded);
            return res.status(200).json({ data: result, message: "successully rows update requested", code: 200 });
        } catch (errors) {
            console.log({error: errors});
            return res.status(400).json({ data: null, message: "row update failed", code: 400 });
        }
    }

    async deleteAllUsers(req, res) {
        try {
            const ids = this.userValidator.deleteAllUsers(req);
            const result = await this.userService.deleteAllUsers(ids);
            return res.status(200).json({ data: result, message: "users deleted", status: "success", code: 200 });
        } catch (errors) {
            console.log({error: errors});
            return res.status(400).json({ data: null, message: errors?.message ?? "users not deleted", status: "failed", code: 400 });
        }
    }

    async deleteBulkUsers(req, res) {
        try {
            const { filters, excluded } = this.userValidator.bulkSelection(req);
            const result = await this.userService.deleteMatchingUsers(filters, excluded);
            return res.status(200).json({ data: result, message: "successully rows update requested", code: 200 });
        } catch (errors) {
            console.log({error: errors});
            return res.status(400).json({ data: null, message: "row update failed", code: 400 });
        }
    }



    async lockTable(req, res) {
        return res.status(200).json({ data: null, message: "lockTable initiated", code: 200 });
    }
    async lockRows(req, res) {
        return res.status(200).json({ data: null, message: "lockRows initiated", code: 200 });
    }

    async getLocks(req, res) {
        return res.status(200).json({ data: null, message: "getLocks initiated", code: 200 });
    }

    async saveView(req, res) {
        return res.status(200).json({ data: null, message: "saveView initiated", code: 200 });
    }

    async getView(req, res) {
        return res.status(200).json({ data: null, message: "getView initiated", code: 200 });
    }
    async downloadData(req, res) {
        return res.status(200).json({ data: null, message: "downloadData initiated", code: 200 });
    }

    async exportData(req, res) {
        return res.status(200).json({ data: null, message: "exportData initiated", code: 200 });
    }

    async liveUpdateSub(req, res) {
        return res.status(200).json({ data: null, message: "liveUpdateSub initiated", code: 200 });
    }

    async liveUpdatePub(req, res) {
        return res.status(200).json({ data: null, message: "liveUpdatePub initiated", code: 200 });
    }

    async importCreateUsers(req, res) {}
    async importUpdateUsers(req, res) {}
}
