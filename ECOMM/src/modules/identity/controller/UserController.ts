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
            const validated = this.userValidator.getUsers(req);
            const { page, limit, ...filterInputs } = validated;

            const users = await this.userService.getUsers(page, limit, filterInputs);

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

    async listViews(req, res) {
        try {
            const tableKey = req.query.table_key || 'users_table_1234';
            const userId = req.user?.id || req.query.user_id || null;
            const views = await this.userService.getViews(tableKey, userId);

            return res.status(200).json({
                data: views,
                message: "Views fetched successfully",
                status: "success",
                code: 200
            });
        } catch (error) {
            console.error("Error in listViews:", error);
            return res.status(500).json({
                data: null,
                message: error?.message || "Failed to fetch views",
                status: "failed",
                code: 500
            });
        }
    }

    async saveView(req, res) {
        try {
            const { id, name, table_key = 'users_table_1234', user_id = null, description = null, is_default = false, is_shared = false, is_locked = false, view_state = {} } = req.body;

            if (!name || typeof name !== 'string' || !name.trim()) {
                return res.status(400).json({
                    data: null,
                    message: "View name is required",
                    status: "failed",
                    code: 400
                });
            }

            const savedView = await this.userService.saveView({
                id,
                name: name.trim(),
                table_key,
                user_id: user_id || req.user?.id || null,
                description,
                is_default: !!is_default,
                is_shared: !!is_shared,
                is_locked: !!is_locked,
                view_state
            });

            return res.status(200).json({
                data: savedView,
                message: "View saved successfully",
                status: "success",
                code: 200
            });
        } catch (error) {
            console.error("Error in saveView:", error);
            return res.status(500).json({
                data: null,
                message: error?.message || "Failed to save view",
                status: "failed",
                code: 500
            });
        }
    }

    async getView(req, res) {
        try {
            const { id } = req.params;
            const view = await this.userService.getView(id);
            if (!view) {
                return res.status(404).json({
                    data: null,
                    message: "View not found",
                    status: "failed",
                    code: 404
                });
            }

            return res.status(200).json({
                data: view,
                message: "View fetched successfully",
                status: "success",
                code: 200
            });
        } catch (error) {
            console.error("Error in getView:", error);
            return res.status(500).json({
                data: null,
                message: error?.message || "Failed to fetch view",
                status: "failed",
                code: 500
            });
        }
    }

    async deleteView(req, res) {
        try {
            const { id } = req.params;
            const deleted = await this.userService.deleteView(id);

            return res.status(200).json({
                data: deleted,
                message: "View deleted successfully",
                status: "success",
                code: 200
            });
        } catch (error) {
            console.error("Error in deleteView:", error);
            return res.status(500).json({
                data: null,
                message: error?.message || "Failed to delete view",
                status: "failed",
                code: 500
            });
        }
    }

    async setDefaultView(req, res) {
        try {
            const { id } = req.params;
            const tableKey = req.body?.table_key || 'users_table_1234';
            const userId = req.user?.id || req.body?.user_id || null;
            const updated = await this.userService.setDefaultView(id, tableKey, userId);

            return res.status(200).json({
                data: updated,
                message: "Default view updated successfully",
                status: "success",
                code: 200
            });
        } catch (error) {
            console.error("Error in setDefaultView:", error);
            return res.status(500).json({
                data: null,
                message: error?.message || "Failed to set default view",
                status: "failed",
                code: 500
            });
        }
    }
    async downloadData(req, res) {
        return res.status(200).json({ data: null, message: "downloadData initiated", code: 200 });
    }

    async exportData(req, res) {
        return res.status(200).json({ data: null, message: "exportData initiated", code: 200 });
    }

    async liveUpdateSub(req, res) {
        const tableKey = req.query.table_key || req.body?.table_key || 'users_table_1234';
        const channel = `table:${tableKey}:live`;

        // Configure SSE (Server-Sent Events) headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders?.();

        // Send initial connected event
        res.write(`data: ${JSON.stringify({ type: 'CONNECTED', table_key: tableKey, timestamp: new Date().toISOString() })}\n\n`);

        const redisClient = (globalThis as any).context?.redis;
        if (!redisClient) {
            res.write(`data: ${JSON.stringify({ type: 'ERROR', message: 'Redis not initialized' })}\n\n`);
            return res.end();
        }

        let subscriber: any = null;
        try {
            subscriber = redisClient.duplicate();
            subscriber.on('error', (err: any) => {
                console.error('[UserController:liveUpdateSub] Redis subscriber error:', err?.message);
            });
            await subscriber.connect();

            await subscriber.subscribe(channel, (message: string) => {
                try {
                    res.write(`data: ${message}\n\n`);
                } catch (e) {
                    console.error('[UserController:liveUpdateSub] Error writing to SSE stream:', e);
                }
            });
        } catch (err: any) {
            console.error('[UserController:liveUpdateSub] Failed to subscribe to channel:', err?.message);
            res.write(`data: ${JSON.stringify({ type: 'ERROR', message: err?.message || 'Subscription failed' })}\n\n`);
            if (subscriber) {
                try { await subscriber.disconnect(); } catch (_) {}
            }
            return res.end();
        }

        // Keep-alive heartbeat every 25 seconds
        const heartbeatInterval = setInterval(() => {
            try {
                res.write(`: heartbeat\n\n`);
            } catch (_) {}
        }, 25000);

        req.on('close', async () => {
            clearInterval(heartbeatInterval);
            if (subscriber) {
                try {
                    await subscriber.unsubscribe(channel);
                    await subscriber.disconnect();
                } catch (_) {}
            }
        });
    }

    async liveUpdatePub(req, res) {
        try {
            const tableKey = req.body?.table_key || req.query?.table_key || 'users_table_1234';
            const channel = `table:${tableKey}:live`;
            const payload = req.body && Object.keys(req.body).length > 0 ? req.body : req.query;

            const redisClient = (globalThis as any).context?.redis;
            if (!redisClient) {
                return res.status(500).json({
                    data: null,
                    message: "Redis is not connected",
                    status: "failed",
                    code: 500
                });
            }

            const messageString = typeof payload === 'string' ? payload : JSON.stringify(payload);
            const subscribersCount = await redisClient.publish(channel, messageString);

            return res.status(200).json({
                data: {
                    channel,
                    subscribers: subscribersCount,
                    published: true
                },
                message: "liveUpdatePub broadcasted successfully",
                status: "success",
                code: 200
            });
        } catch (error: any) {
            console.error('[UserController:liveUpdatePub] Publish error:', error);
            return res.status(500).json({
                data: null,
                message: error?.message || "Failed to publish live event",
                status: "failed",
                code: 500
            });
        }
    }

    async importCreateUsers(req, res) {}
    async importUpdateUsers(req, res) {}
}
