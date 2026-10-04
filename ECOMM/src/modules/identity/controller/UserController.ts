import { UserColumnConfig } from "../config/user.column.config.js";
import {UserResponse} from "../response/UserResponse.js";

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
        return res.json({
            "users_table_unique_key": {
                "table_name": "users",
                "display_name": "Users Management",
                "show_headers" : true,
                "live_count_panel" : true,
                "main_action_panel" : true,
                "show_checkboxes" : true,
                "fixed_checkboxes" : true,
                "fixed_actions" : true,
                "show_actions" : true,
                "row_expansion" : true,
                "data_api": "/identity/management/users",
                "update_api": "/identity/management/users/update/:id",
                "config_api": "/identity/management/users/config/columns",
                "table_config_api": "/identity/management/users/config/table",
                "primary_key": "id",
                "selection": {
                    "enabled": true,
                    "multiple": true
                },
                "pagination": {
                    "enabled": true,
                    "default_page_size": 25,
                    "page_size_options": [10, 25, 50, 100]
                },
                "sorting": {
                    "enabled": true,
                    "multiple": true
                },
                "filtering": {
                    "enabled": true
                },
                "editing": {
                    "enabled": true,
                    "row_editable": true
                },
                "actions": {
                    "edit": true,
                    "delete": true,
                    "enable": true,
                    "disable": true,
                    "revert": true,
                    "more": true
                },
                "export": {
                    "enabled": true,
                    "formats": ["excel", "csv"]
                },
                "download": {
                    "enabled": true,
                    "formats": ["excel", "csv"]
                },
                "column_management": {
                    "enabled": true,
                    "reorder": true,
                    "show_hide": false
                },
                "column_freeze": {
                    "enabled": true,
                    "start": 2,
                    "end": 1
                },
                "row_freeze": {
                    "enabled": true,
                    "top": 2,
                    "bottom": 0
                },
                "column_resize": {
                    "enabled": true
                },
                "view": {
                    "fullscreen": true,
                    "density": true,
                    "default_density": "comfortable"
                },
                "live_collaboration": {
                    "enabled": true
                },
                "features": {
                    "column_navigation": true,
                    "column_count_indicator": true,
                    "save_view": true,
                    "reset_view": true
                }
            }
        });
    }

    async getUserColumnsConfig(req, res) {
        return res.json(UserColumnConfig);
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

    async importCreateUsers(req, res) {}
    async importUpdateUsers(req, res) {}
}
