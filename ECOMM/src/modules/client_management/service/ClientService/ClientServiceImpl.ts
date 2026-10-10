import ClientService from "./ClientService.js";

export class ClientServiceImpl implements ClientService {

    private readonly repo: any;

    constructor({ clientRepository }: any) {
        this.repo = clientRepository;
    }

    async createClient(input: any) {
        return await this.repo.createClient(input);
    }

    async getClient(id: any) {
        return await this.repo.getClient(id);
    }

    async getClients(page: number, limit: number, inputs: any = {}) {
        const offset = (page - 1) * limit;
        const records = await this.repo.getClients(limit, offset, inputs);
        const total = await this.repo.getTotalClients(inputs);
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

    async updateClient(id: any, data: any) {
        return await this.repo.updateClient(id, data);
    }

    async deleteClient(id: any) {
        return await this.repo.deleteClient(id);
    }

    async createAllClients(records: any[]) {
        return await this.repo.createBulkClients(records);
    }

    async updateBulkClients(updates: any[]) {
        return await this.repo.updateBulkClients(updates);
    }

    async updateAllClients(ids: any[], data: any) {
        return await this.repo.updateAllClients(ids, data);
    }

    async deleteAllClients(ids: any[]) {
        return await this.repo.deleteAllClients(ids);
    }

    async importClients(records: any[], options: any = {}) {
        return await this.repo.importClients(records, options);
    }

    async importUpdateClients(updates: any[], options: any = {}) {
        return await this.repo.importUpdateClients(updates, options);
    }

    async getViews(tableKey = 'clients_table_5002', userId = null) {
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

    async setDefaultView(id: any, tableKey = 'clients_table_5002', userId = null) {
        return await this.repo.setDefaultView(id, tableKey, userId);
    }
}
