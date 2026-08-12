export default class UserController {

    context;

    constructor(context) {
        this.context = context;
    }

    getUser = async (req, res) => {
        const user = await this.userExistsById(req.params.id);
        if (!user || user.status === 'failed' || user?.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "user not found"
            });
        }
        const result = user?.at(0);
        delete result?.password_hash;
        return res.status(200).json({
            status: "success",
            data: result
        });
    };

    getUsers = async (req, res) => {
        try {
            const filter = req.query;
            let query = `SELECT id, first_name, last_name, email, status, role_id, created_at, updated_at, deleted_at, last_login_at FROM master.users where 1=1 `;
            /** filters added */
            if (filter?.id !== undefined) {
                query += ` AND id = '${filter.id}' `;
            }
            if (filter?.first_name !== undefined) {
                query += ` AND first_name like '%${filter.first_name}%' `;
            }
            if (filter?.last_name !== undefined) {
                query += ` AND first_name like '%${filter.last_name}%' `;
            }
            if (filter?.email !== undefined) {
                query += ` AND first_name like '%${filter.email}%' `;
            }
            if (filter?.role?.toLowerCase() === "admin" ||
                filter?.role?.toLowerCase() === "user") {
                const role = await this.getRole(filter.role);
                if (role.status === "failed") {
                    return res.status(400).json({
                        "status": "failed",
                        message: role.message
                    });
                }
                const roleId = role.data;
                query += ` AND role_id = ${roleId} `;
            }
            if (filter?.status?.toLowerCase() === "active" ||
                filter?.status?.toLowerCase() === "inactive") {
                query += ` AND status = '${filter.status.toUpperCase()}' `;
            }
            if (filter?.deleted !== undefined && !Boolean(filter.deleted)) {
                query += ` AND deleted_at IS NULL `;
            }
            else if (filter?.deleted !== undefined && Boolean(filter?.deleted)) {
                query += ` AND deleted_at IS NOT NULL `;
            }
            /** Add standard sorting */
            query += ` ORDER BY created_at DESC `;
            const result = await this.context.client.query(query);
            return res.status(200).json({
                status: "success",
                data: result.rows
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "failed",
                message: error.message
            });
        }
    };

    deleteUser = async (req, res) => {
        try {
            const userId = req.params.id;
            const query = `UPDATE master.users
                           SET deleted_at = NOW()
                           WHERE id = $1
                                AND deleted_at IS NULL
                                RETURNING id, email, deleted_at`;
            const result = await this.context.client.query(query, [userId]);
            return res.status(200).json({
                status: "success",
                data: result.rows.at(0)
            });
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({
                status: "failed",
                message: error.message
            });
        }
    };

    updateUser = async (req, res) => {
        try {
            const user = req.body;
            const userId = parseInt(req.params.id);
            const role = await this.getRole(user.role);
            if (role.status === "failed") {
                return res.status(400).json({
                    "status": "failed",
                    message: role.message
                });
            }
            const roleId = role.data;
            const query = `UPDATE master.users 
                                SET 
                                    first_name = COALESCE($1, first_name),
                                    last_name = COALESCE($2, last_name),
                                    role_id = COALESCE($3, role_id),
                                    updated_at = NOW()
                                WHERE id = $4
                                    AND status = 'ACTIVE'
                                    AND deleted_at IS NULL
                                RETURNING id, first_name, last_name, updated_at;
            `;
            const result = await this.context.client.query(query, [
                user.first_name,
                user.last_name,
                roleId,
                userId
            ]);
            if (result && result.rowCount && result.rowCount > 0) {
                return res.status(200).json({
                    status: "success",
                    data: result.rows.at(0)
                });
            }
            return res.status(400).json({
                status: "failed",
                message: "update is invalid for the user"
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "failed",
                message: error.message
            });
        }
    };

    async getRole(role) {
        try {
            const roles = await this.getRoles();
            if (!roles) {
                return {
                    status: "failed",
                    message: "user not created, can not get roles"
                };
            }
            let roleDetail = roles.find((roleObj) => roleObj.name.toLowerCase() === role.toLowerCase());
            if (roleDetail) {
                return {
                    status: "success",
                    data: parseInt(roleDetail.id)
                };
            }
            else {
                return {
                    status: "failed",
                    message: "Invalid role provided"
                };
            }
        }
        catch (error) {
            console.log(error);
            return {
                status: "failed",
                message: "role fetch error"
            };
        }
    }

    async getRoles() {
        try {
            const query = 'SELECT * FROM master.roles';
            const result = await this.context.client.query(query);
            return result.rows;
        }
        catch (error) {
            console.log(error);
            return [];
        }
    }

    async userExistsById(id) {
        try {
            const query = `SELECT * FROM master.users WHERE id=$1 AND status='ACTIVE' AND deleted_at IS NULL `;
            const result = await this.context.client.query(query, [id]);
            return result.rows;
        }
        catch (error) {
            console.log(error);
            return {
                "status": "failed",
                "message": error.message
            };
        }
    }
}
//# sourceMappingURL=UserController.js.map