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

    async getCustomers(page: number, limit: number, inputs: any = {}) {
        const offset = (page - 1) * limit;
        const records = await this.repo.getCustomers(limit, offset, inputs);
        const total = await this.repo.getTotalCustomers(inputs);
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

    async updateCustomer(id: any, data: any) {
        return await this.repo.updateCustomer(id, data);
    }

    async deleteCustomer(id: any) {
        return await this.repo.deleteCustomer(id);
    }

    async createAllCustomers(records: any[]) {
        return await this.repo.createBulkCustomers(records);
    }

    async updateBulkCustomers(updates: any[]) {
        return await this.repo.updateBulkCustomers(updates);
    }

    async updateAllCustomers(ids: any[], data: any) {
        return await this.repo.updateAllCustomers(ids, data);
    }

    async deleteAllCustomers(ids: any[]) {
        return await this.repo.deleteAllCustomers(ids);
    }

    async importCustomers(records: any[], options: any = {}) {
        return await this.repo.importCustomers(records, options);
    }

    async importUpdateCustomers(updates: any[], options: any = {}) {
        return await this.repo.importUpdateCustomers(updates, options);
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
