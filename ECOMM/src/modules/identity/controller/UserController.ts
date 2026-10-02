export class UserController {

    private readonly userService:any;
    private readonly userValidator:any;

    constructor({ userService, userValidator })
    {
        this.userService = userService;
        this.userValidator = userValidator;
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

    updateUserStatus(req, res)
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

    importUsers() {}

}