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
        return await this.repo.createAllcustomers(records);
    }

    async updateAllcustomers(records: any[]) {
        return await this.repo.updateAllcustomers(records);
    }

    async deleteAllcustomers(ids: any[]) {
        return await this.repo.deleteAllcustomers(ids);
    }

    async updateMatchingcustomers(data: any, filters: any, excluded: any[]) {
        return await this.repo.updateMatchingcustomers(data, filters, excluded);
    }

    async deleteMatchingcustomers(filters: any, excluded: any[]) {
        return await this.repo.deleteMatchingcustomers(filters, excluded);
    }

    async importcustomers(records: any[], options: any) {
        return await this.repo.importcustomers(records, options);
    }

    async importUpdatecustomers(updates: any[], options: any) {
        return await this.repo.importUpdatecustomers(updates, options);
    }
}
