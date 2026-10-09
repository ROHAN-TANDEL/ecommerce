import CustomerService from "./CustomerService.js";

export class CustomerServiceImpl implements CustomerService {

    private readonly repo: any;

    constructor({ customerRepository }: any) {
        this.repo = customerRepository;
    }

    async createCustomer(input: any) {
        return await this.repo.createCustomer(input);
    }

    async getCustomer(id: any) {
        return await this.repo.getCustomer(id);
    }

    async getcustomers(page: number, limit: number, inputs: any = {}) {
        const offset = (page - 1) * limit;
        const records = await this.repo.getcustomers(limit, offset, inputs);
        const total = await this.repo.getTotalcustomers(inputs);
        return {
            records,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit))
            }
        };
    }

    async updateCustomer(id: any, data: any) {
        return await this.repo.updateCustomer(id, data);
    }

    async deleteCustomer(id: any) {
        return await this.repo.deleteCustomer(id);
    }

    async createAllcustomers(records: any[]) {
        return await this.repo.createBulkcustomers(records);
    }

    async updateBulkcustomers(updates: any[]) {
        return await this.repo.updateBulkcustomers(updates);
    }

    async updateAllcustomers(ids: any[], data: any) {
        return await this.repo.updateAllcustomers(ids, data);
    }

    async deleteAllcustomers(ids: any[]) {
        return await this.repo.deleteAllcustomers(ids);
    }

    async importcustomers(records: any[], options: any = {}) {
        return await this.repo.importcustomers(records, options);
    }

    async importUpdatecustomers(updates: any[], options: any = {}) {
        return await this.repo.importUpdatecustomers(updates, options);
    }

    async getViews(tableKey = 'customers_table_1234', userId = null) {
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

    async setDefaultView(id: any, tableKey = 'customers_table_1234', userId = null) {
        return await this.repo.setDefaultView(id, tableKey, userId);
    }
}
