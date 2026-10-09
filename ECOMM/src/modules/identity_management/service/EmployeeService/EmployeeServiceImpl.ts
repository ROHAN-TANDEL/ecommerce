import EmployeeService from "./EmployeeService.js";

export class EmployeeServiceImpl implements EmployeeService {

    private readonly repo: any;

    constructor({ employeeRepository }: any) {
        this.repo = employeeRepository;
    }

    async createEmployee(input: any) {
        return await this.repo.createEmployee(input);
    }

    async getEmployee(id: any) {
        return await this.repo.getEmployee(id);
    }

    async getemployees(page: number, limit: number, inputs: any = {}) {
        const offset = (page - 1) * limit;
        const records = await this.repo.getemployees(limit, offset, inputs);
        const total = await this.repo.getTotalemployees(inputs);
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

    async updateEmployee(id: any, data: any) {
        return await this.repo.updateEmployee(id, data);
    }

    async deleteEmployee(id: any) {
        return await this.repo.deleteEmployee(id);
    }

    async createAllemployees(records: any[]) {
        return await this.repo.createAllemployees(records);
    }

    async updateAllemployees(records: any[]) {
        return await this.repo.updateAllemployees(records);
    }

    async deleteAllemployees(ids: any[]) {
        return await this.repo.deleteAllemployees(ids);
    }

    async updateMatchingemployees(data: any, filters: any, excluded: any[]) {
        return await this.repo.updateMatchingemployees(data, filters, excluded);
    }

    async deleteMatchingemployees(filters: any, excluded: any[]) {
        return await this.repo.deleteMatchingemployees(filters, excluded);
    }

    async importemployees(records: any[], options: any) {
        return await this.repo.importemployees(records, options);
    }

    async importUpdateemployees(updates: any[], options: any) {
        return await this.repo.importUpdateemployees(updates, options);
    }
}
