import ClientUserService from "./ClientUserService.js";

export class ClientUserServiceImpl implements ClientUserService {

    private readonly repo: any;

    constructor({ clientUserRepository }: any) {
        this.repo = clientUserRepository;
    }

    async createClientUser(input: any) {
        return await this.repo.createClientUser(input);
    }

    async getClientUser(id: any) {
        return await this.repo.getClientUser(id);
    }

    async getClientusers(page: number, limit: number, inputs: any = {}) {
        const offset = (page - 1) * limit;
        const records = await this.repo.getClientusers(limit, offset, inputs);
        const total = await this.repo.getTotalClientusers(inputs);
        return {
            data: records,
            records,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit))
            }
        };
    }

    async updateClientUser(id: any, data: any) {
        return await this.repo.updateClientUser(id, data);
    }

    async deleteClientUser(id: any) {
        return await this.repo.deleteClientUser(id);
    }

    async createAllClientusers(records: any[]) {
        return await this.repo.createBulkClientusers(records);
    }

    async updateBulkClientusers(updates: any[]) {
        return await this.repo.updateBulkClientusers(updates);
    }

    async updateAllClientusers(ids: any[], data: any) {
        return await this.repo.updateAllClientusers(ids, data);
    }

    async deleteAllClientusers(ids: any[]) {
        return await this.repo.deleteAllClientusers(ids);
    }

    async importClientusers(records: any[], options: any = {}) {
        return await this.repo.importClientusers(records, options);
    }

    async importUpdateClientusers(updates: any[], options: any = {}) {
        return await this.repo.importUpdateClientusers(updates, options);
    }

    async getViews(tableKey = 'client_users_table_5005', userId = null) {
        return await this.repo.getViews(tableKey, userId);
    }

    async saveView(data: any) {
        return await this.repo.saveView(data);
    }

    async getView(id: any) {
        return await this.repo.getViewById(id);
    }

    async deleteView(id: any) {
        return await this.repo.deleteView(id);
    }

    async setDefaultView(id: any, tableKey = 'client_users_table_5005', userId = null) {
        return await this.repo.setDefaultView(id, tableKey, userId);
    }
}
