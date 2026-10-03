import UserService from "./UserService";
import db from "../../../../platformdb/facade.js";

export class UserServiceImpl implements UserService {

    private readonly userRepo:any;

    constructor({userRepository}) {
        this.userRepo = userRepository;
    }

    deleteUser() {}
    updateUser() {}

    async createUser(input)
    {
        if (!input?.status) {
            input.status = 'ACTIVE';
        }

        return await this.userRepo.createUser(input);
    }

    async getUser(inputs)
    {
        return await this.userRepo.getUser(inputs);
    }

    async getUsers(page, limit)
    {
        try {
            const offset = (page - 1) * limit;

            const users = await this.userRepo.getUsers(limit, offset);

            if (users?.message) {
               throw new Error("Users not found");
            }

            const total = await this.userRepo.getTotalUsers();

            return {
                user : users,

                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            console.error({ message : 'Failed to fetch users:', error : error});

            return {
                message: 'Failed to fetch users'
            };
        }
    }

    async updateUser(id, inputs)
    {
        try {
            const updatedUser = await this.userRepo.updateUser(id, inputs);
            return updatedUser;
        } catch (error) {
            throw error;
        }
    }

    async deleteUser(inputs)
    {
        try {
            const deleted = await this.userRepo.deleteUser(inputs);
            return deleted;
        } catch (error) {
            throw error;
        }
    }

    async updateUserStatus()
    {
        try {
            const deleted = await this.userRepo.updateUserStatus(inputs);
            return deleted;
        } catch (error) {
            throw error;
        }
    }


    async createBulkUsers(users) {
        return await this.userRepo.createBulkUsers(users);
    }

    async updateBulkUsers(updates) {
        return await this.userRepo.updateBulkUsers(updates);
    }

    async updateMatchingUsers(data, filters, excluded) {
        return await this.userRepo.updateMatchingUsers(data, filters, excluded);
    }

    async deleteMatchingUsers(filters, excluded) {
        return await this.userRepo.deleteMatchingUsers(filters, excluded);
    }

    async updateAllUsers(ids, data) {
        return await this.userRepo.updateAllUsers(ids, data);
    }

    async deleteAllUsers(ids) {
        return await this.userRepo.deleteAllUsers(ids);
    }

    importUsers() {}

}
