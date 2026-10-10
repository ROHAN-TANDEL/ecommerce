import { UserColumnConfig, UserColumnOptionsConfig } from "../config/user.column.config.js";
import { UserActionsConfig } from "../config/user.actions.config.js";
import { UserHeaderConfig } from "../config/user.header.config.js";
import { UserRowActionsConfig } from "../config/user.row-actions.config.js";

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
        try {
            const users = this.userValidator.createAllUsers
                ? this.userValidator.createAllUsers(req)
                : this.userValidator.createBulkUsers(req);

            const result = await this.userService.createAllUsers(users);

            return res.status(200).json({
                data: result,
                message: "all users created successfully",
                status: "success",
                code: 200
            });
        } catch (errors: any) {
            console.log({error: errors});

            return res.status(400).json({
                data: null,
                message: errors?.message ?? "all users failed to create",
                status: "failed",
                code: 400
            });
        }
    }

    async getUsers(req, res)
    {
        try {
            const validated = this.userValidator.getUsers(req);
            const { page, limit, ...filterInputs } = validated;

            const users = await this.userService.getUsers(page, limit, filterInputs);
            const userList = users?.user || users?.data || [];

            return res.status(200).json({
                data: userList,
                pagination: users?.pagination,
                message: "users list",
                status: "success",
                code: 200
            });

        } catch(errors: any) {
            console.log({errors:errors});

            return res.status(400).json({
                data : null,
                message: errors?.message ?? "user not found",
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
        return res.json({
            columns: UserColumnConfig,
            options: UserColumnOptionsConfig
        });
    }

    async getUserActionsConfig(req, res) {
        return res.json(UserActionsConfig);
    }

    async getUserHeaderConfig(req, res) {
        return res.json(UserHeaderConfig);
    }

    async getUserRowActionsConfig(req, res) {
        return res.json(UserRowActionsConfig);
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
            return res.status(200).json({ data: result, message: "successully rows delete requested", code: 200 });
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

    async importCreateUsers(req, res)
    {
        try {
            const { users, options, duplicates, invalidRows } = this.userValidator.importCreateUsers(req);
            const inserted = await this.userService.importUsers(users, options);
            const insertedList: any[] = Array.isArray(inserted) ? inserted : (inserted?.rows || []);

            const insertedEmails = new Set(insertedList.map((u: any) => u.email?.toLowerCase()));
            const dbDuplicates = users
                .filter((u: any) => !insertedEmails.has(u.email?.toLowerCase()))
                .map((u: any) => ({
                    row: u.rowNumber,
                    email: u.email,
                    reason: "User with this email already exists in database"
                }));

            const allDuplicates = [...(duplicates || []), ...dbDuplicates];
            const skippedCount = allDuplicates.length;
            const importedCount = insertedList.length;

            return res.status(200).json({
                data: {
                    imported_count: importedCount,
                    skipped_count: skippedCount,
                    failed_count: (invalidRows || []).length,
                    users: insertedList,
                    duplicates: allDuplicates,
                    errors: invalidRows || [],
                    options
                },
                message: `Successfully imported ${importedCount} user(s)${skippedCount > 0 ? `, skipped ${skippedCount} duplicate(s)` : ''}`,
                status: "success",
                code: 200
            });
        } catch (errors: any) {
            console.log({ error: errors });

            return res.status(400).json({
                data: null,
                message: errors?.message ?? "failed to import users",
                status: "failed",
                code: 400
            });
        }
    }
    async importUpdateUsers(req, res)
    {
        try {
            const { updates, identifierKey, invalidRows, options } = this.userValidator.importUpdateUsers(req);
            const { updated, not_found, errors: dbErrors } = await this.userService.importUpdateUsers(updates, options);

            const allErrors = [
                ...(invalidRows || []),
                ...(dbErrors || []),
                ...(not_found || []).map((nf: any) => ({
                    row: nf.row,
                    [identifierKey]: nf[identifierKey],
                    error: nf.reason
                }))
            ];

            const updatedCount = (updated || []).length;
            const failedCount = allErrors.length;

            return res.status(200).json({
                data: {
                    updated_count: updatedCount,
                    failed_count: failedCount,
                    updated: updated || [],
                    not_found: not_found || [],
                    errors: allErrors,
                    identifier_key: identifierKey,
                    options
                },
                message: "user updates imported successfully",
                status: "success",
                code: 200
            });
        } catch (errors: any) {
            console.log({ error: errors });

            return res.status(400).json({
                data: null,
                message: errors?.message ?? "failed to import user updates",
                status: "failed",
                code: 400
            });
        }
    }

    /**
     * @route POST /users/ai/summary
     * @desc  AI Summary: Summarizes the table as a whole or specific selected rows
     */
    async aiSummary(req, res) {
        try {
            const inputs = this.userValidator.aiSummary(req);
            let summaryData: any = {};

            // 1. If specific rows are selected: summarize only those rows
            if (inputs.selected_row_ids.length > 0 || inputs.selected_rows.length > 0) {
                let rowsToSummarize = inputs.selected_rows;

                if (rowsToSummarize.length === 0 && inputs.selected_row_ids.length > 0) {
                    const fetchedUsers: any[] = [];
                    for (const id of inputs.selected_row_ids) {
                        try {
                            const u = await this.userService.getUser([Number(id) || id]);
                            if (u && !u.message) fetchedUsers.push(u);
                        } catch (e) {}
                    }
                    rowsToSummarize = fetchedUsers;
                }

                const count = rowsToSummarize.length || inputs.selected_row_ids.length;
                const statusCounts: Record<string, number> = { active: 0, inactive: 0, pending: 0 };
                const names: string[] = [];
                const emails: string[] = [];

                rowsToSummarize.forEach((r: any) => {
                    const st = String(r.status || 'active').toLowerCase();
                    statusCounts[st] = (statusCounts[st] || 0) + 1;
                    const name = `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email || `User #${r.id}`;
                    names.push(name);
                    if (r.email) emails.push(r.email);
                });

                const statusText = Object.entries(statusCounts)
                    .filter(([, v]) => v > 0)
                    .map(([k, v]) => `${v} ${k}`)
                    .join(', ');

                const namesSnippet = names.slice(0, 3).join(', ') + (names.length > 3 ? ` and ${names.length - 3} more` : '');

                summaryData = {
                    type: "row_summary",
                    title: `Selected Rows Summary (${count} User${count > 1 ? 's' : ''})`,
                    summary: `You have selected ${count} record(s): ${namesSnippet}. Status distribution among selected items: ${statusText || 'None'}.`,
                    highlights: [
                        `Selected user records: ${names.join(', ')}`,
                        `Status breakdown: ${statusText || 'N/A'}`,
                        emails.length > 0 ? `Associated emails: ${emails.slice(0, 5).join(', ')}` : null
                    ].filter(Boolean),
                    stats: {
                        selected_count: count,
                        status_counts: statusCounts,
                        selected_ids: inputs.selected_row_ids
                    },
                    generated_at: new Date().toISOString()
                };
            } else {
                // 2. Table-level summary: summarize overall table purpose and dataset metrics
                let totalUsers = 0;
                let sampleUsers: any[] = [];
                try {
                    const usersResult = await this.userService.getUsers(1, 100, inputs);
                    sampleUsers = usersResult?.user || [];
                    totalUsers = usersResult?.pagination?.total ?? sampleUsers.length;
                } catch (e) {}

                const statusCounts: Record<string, number> = { active: 0, inactive: 0, pending: 0 };
                sampleUsers.forEach((r: any) => {
                    const st = String(r.status || 'active').toLowerCase();
                    statusCounts[st] = (statusCounts[st] || 0) + 1;
                });

                const activeFiltersCount = Object.keys(inputs.active_filters || {}).length;
                const filterDesc = activeFiltersCount > 0
                    ? ` Table currently has ${activeFiltersCount} active filter(s) applied.`
                    : ' No filters are currently applied.';

                summaryData = {
                    type: "table_summary",
                    title: "User Management Table Overview",
                    summary: `This table manages core identity records, employee accounts, access permissions, and authentication baselines across the platform.${filterDesc} Total records: ${totalUsers}.`,
                    highlights: [
                        `Total registered users: ${totalUsers}`,
                        `Status breakdown: ${statusCounts.active} active, ${statusCounts.pending} pending, ${statusCounts.inactive} inactive`,
                        activeFiltersCount > 0 ? `Active filters applied: ${Object.keys(inputs.active_filters).join(', ')}` : 'Displaying unfiltered dataset'
                    ],
                    stats: {
                        total_users: totalUsers,
                        status_counts: statusCounts,
                        active_filters: inputs.active_filters
                    },
                    generated_at: new Date().toISOString()
                };
            }

            return res.status(200).json({
                status: "success",
                code: 200,
                message: "AI summary generated successfully",
                data: summaryData
            });
        } catch (error: any) {
            console.log({ error });
            return res.status(400).json({
                status: "failed",
                code: 400,
                message: error?.message ?? "Failed to generate AI summary",
                data: null
            });
        }
    }

    /**
     * @route POST /users/ai/interact
     * @desc  Interact with Table using AI:
     *        1. Add / remove filters
     *        2. Propose data edits (non-destructive; requires user review before saving)
     *        3. Generate up to 5 relative test data records
     */
    async aiInteract(req, res) {
        try {
            const inputs = this.userValidator.aiInteract(req);
            const query = inputs.query.toLowerCase();
            const currentRows = inputs.current_rows || [];

            let reply = "";
            let intent = "general";
            const actions: any = {
                filters: { set: {}, remove: [] },
                proposed_edits: [],
                generated_rows: [],
                requires_user_review: false
            };

            // 1. FILTER INTENTS
            const isFilterAdd = query.includes('filter') || query.includes('show only') || query.includes('find') || query.includes('search');
            const isFilterRemove = query.includes('remove filter') || query.includes('clear filter') || query.includes('reset filter') || query.includes('show all');

            if (isFilterRemove) {
                intent = "filter_remove";
                actions.filters.remove_all = true;
                reply = "I have cleared all table filters so you can see all records.";
            } else if (isFilterAdd) {
                intent = "filter_add";
                if (query.includes('active')) {
                    actions.filters.set['status'] = ['active'];
                    reply = "Filtered table to show only active users.";
                } else if (query.includes('inactive')) {
                    actions.filters.set['status'] = ['inactive'];
                    reply = "Filtered table to show only inactive users.";
                } else if (query.includes('pending')) {
                    actions.filters.set['status'] = ['pending'];
                    reply = "Filtered table to show only pending users.";
                } else {
                    const matchName = query.match(/(?:for|named|user|name)\s+([a-zA-Z]+)/);
                    if (matchName && matchName[1]) {
                        const nameTerm = matchName[1];
                        actions.filters.set['first_name'] = [nameTerm];
                        reply = `Filtered table for first name matching "${nameTerm}".`;
                    } else {
                        reply = "Understood. Please specify the column or value you wish to filter by (e.g. 'filter active users').";
                    }
                }
            }

            // 2. GENERATE NEW RELATIVE DATA (Max 5 records)
            const isGenerate = query.includes('generate') || query.includes('add random') || query.includes('create test') || query.includes('sample user') || query.includes('dummy user') || query.includes('fake user');
            if (isGenerate) {
                intent = "generate";
                const numMatch = query.match(/\b([1-9]|10)\b/);
                let count = numMatch ? parseInt(numMatch[1], 10) : 3;
                if (count > 5) count = 5;
                if (count < 1) count = 1;

                const firstNames = ['Liam', 'Sophia', 'Ethan', 'Olivia', 'Noah', 'Ava', 'Lucas', 'Mia', 'Jackson', 'Emma'];
                const lastNames = ['Vance', 'Sterling', 'Hayes', 'Brooks', 'Sinclair', 'Bennett', 'Reynolds', 'Sullivan', 'Carter', 'Morgan'];
                const domains = ['enterprise.io', 'techcorp.com', 'acme.org'];

                const genRows: any[] = [];
                for (let i = 0; i < count; i++) {
                    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
                    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
                    const domain = domains[Math.floor(Math.random() * domains.length)];
                    const randSuffix = Math.floor(Math.random() * 900) + 100;
                    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${randSuffix}@${domain}`;
                    const targetStatus = query.includes('pending') ? 'pending' : (query.includes('inactive') ? 'inactive' : 'active');

                    genRows.push({
                        temp_id: `ai_gen_${Date.now()}_${i + 1}`,
                        first_name: fn,
                        last_name: ln,
                        email: email,
                        status: targetStatus,
                        created_at: new Date().toLocaleDateString(),
                        is_ai_generated: true,
                        needs_review: true
                    });
                }

                actions.generated_rows = genRows;
                actions.requires_user_review = true;
                reply = `Generated ${count} relative sample user record(s) matching your table schema. They have been added in draft mode and marked for review. Please review and accept them before saving.`;
            }

            // 3. PROPOSED DATA EDITS (Non-destructive: AI does NOT execute any DB update!)
            const isEdit = query.includes('change') || query.includes('update') || query.includes('modify') || query.includes('set') || query.includes('make') || query.includes('capitalize');
            if (isEdit && !isGenerate) {
                intent = "edit_propose";
                const proposedEdits: any[] = [];

                if (query.includes('pending to active') || (query.includes('activate') && query.includes('pending'))) {
                    currentRows.forEach((r: any) => {
                        if (String(r.status).toLowerCase() === 'pending') {
                            proposedEdits.push({
                                row_id: String(r.id),
                                field: 'status',
                                old_value: r.status,
                                new_value: 'active',
                                user_name: `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email,
                                needs_review: true,
                                reason: 'Requested to change pending users to active'
                            });
                        }
                    });
                } else if (query.includes('inactive') && query.includes('to active')) {
                    currentRows.forEach((r: any) => {
                        if (String(r.status).toLowerCase() === 'inactive') {
                            proposedEdits.push({
                                row_id: String(r.id),
                                field: 'status',
                                old_value: r.status,
                                new_value: 'active',
                                user_name: `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email,
                                needs_review: true,
                                reason: 'Requested to change inactive users to active'
                            });
                        }
                    });
                } else if (query.includes('capitalize')) {
                    currentRows.forEach((r: any) => {
                        const fn = r.first_name || '';
                        const capitalized = fn.charAt(0).toUpperCase() + fn.slice(1);
                        if (fn && fn !== capitalized) {
                            proposedEdits.push({
                                row_id: String(r.id),
                                field: 'first_name',
                                old_value: fn,
                                new_value: capitalized,
                                user_name: fn,
                                needs_review: true,
                                reason: 'Capitalized first name'
                            });
                        }
                    });
                } else {
                    const idMatch = query.match(/user\s*(?:#|id\s*)?(\d+)/);
                    if (idMatch && idMatch[1]) {
                        const targetId = idMatch[1];
                        const row = currentRows.find((r: any) => String(r.id) === targetId);
                        if (row) {
                            const newStatus = query.includes('active') ? 'active' : (query.includes('inactive') ? 'inactive' : 'pending');
                            proposedEdits.push({
                                row_id: targetId,
                                field: 'status',
                                old_value: row.status,
                                new_value: newStatus,
                                user_name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.email,
                                needs_review: true,
                                reason: `Requested status change to ${newStatus}`
                            });
                        }
                    }
                }

                if (proposedEdits.length > 0) {
                    actions.proposed_edits = proposedEdits;
                    actions.requires_user_review = true;
                    reply = `I have prepared proposed updates for ${proposedEdits.length} record(s). No changes have been saved to the database. Please review the highlighted rows in the table and mark them as reviewed to commit them.`;
                } else if (!reply) {
                    reply = "I analyzed your request, but could not find matching rows on screen to edit. You can specify rows by status or user ID.";
                }
            }

            // Default response
            if (!reply) {
                reply = `I am your AI Table Assistant. You can ask me to:
1. Filter table records (e.g., "show only active users", "clear filters")
2. Propose data edits (e.g., "change all pending users to active")
3. Generate sample relative data (e.g., "generate 3 test users", max 5 records)
All proposed edits and generated rows are marked for your manual review before any database save.`;
            }

            return res.status(200).json({
                status: "success",
                code: 200,
                message: "AI interaction processed successfully",
                data: {
                    reply,
                    intent,
                    actions,
                    query: inputs.query,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error: any) {
            console.log({ error });
            return res.status(400).json({
                status: "failed",
                code: 400,
                message: error?.message ?? "Failed to process AI query",
                data: null
            });
        }
    }
}
