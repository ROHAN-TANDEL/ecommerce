import ClientProductService from "./ClientProductService.js";

export class ClientProductServiceImpl implements ClientProductService {

    private readonly repo: any;

    constructor({ clientProductRepository }: any) {
        this.repo = clientProductRepository;
    }

    async createClientProduct(input: any) {
        return await this.repo.createClientProduct(input);
    }

    async getClientProduct(id: any) {
        return await this.repo.getClientProduct(id);
    }

    async getClientproducts(page: number, limit: number, inputs: any = {}) {
        const offset = (page - 1) * limit;
        const records = await this.repo.getClientproducts(limit, offset, inputs);
        const total = await this.repo.getTotalClientproducts(inputs);
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

    async updateClientProduct(id: any, data: any) {
        return await this.repo.updateClientProduct(id, data);
    }

    async deleteClientProduct(id: any) {
        return await this.repo.deleteClientProduct(id);
    }

    async createAllClientproducts(records: any[]) {
        return await this.repo.createBulkClientproducts(records);
    }

    async updateBulkClientproducts(updates: any[]) {
        return await this.repo.updateBulkClientproducts(updates);
    }

    async updateAllClientproducts(ids: any[], data: any) {
        return await this.repo.updateAllClientproducts(ids, data);
    }

    async deleteAllClientproducts(ids: any[]) {
        return await this.repo.deleteAllClientproducts(ids);
    }

    async importClientproducts(records: any[], options: any = {}) {
        return await this.repo.importClientproducts(records, options);
    }

    async importUpdateClientproducts(updates: any[], options: any = {}) {
        return await this.repo.importUpdateClientproducts(updates, options);
    }

    async getViews(tableKey = 'client_products_table_5004', userId = null) {
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

    async setDefaultView(id: any, tableKey = 'client_products_table_5004', userId = null) {
        return await this.repo.setDefaultView(id, tableKey, userId);
    }
}
