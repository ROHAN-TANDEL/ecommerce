import PartnerService from "./PartnerService.js";

export class PartnerServiceImpl implements PartnerService {

    private readonly repo: any;

    constructor({ partnerRepository }: any) {
        this.repo = partnerRepository;
    }

    async createPartner(input: any) {
        return await this.repo.createPartner(input);
    }

    async getPartner(id: any) {
        return await this.repo.getPartner(id);
    }

    async getPartners(page: number, limit: number, inputs: any = {}) {
        const offset = (page - 1) * limit;
        const records = await this.repo.getPartners(limit, offset, inputs);
        const total = await this.repo.getTotalPartners(inputs);
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

    async updatePartner(id: any, data: any) {
        return await this.repo.updatePartner(id, data);
    }

    async deletePartner(id: any) {
        return await this.repo.deletePartner(id);
    }

    async createAllPartners(records: any[]) {
        return await this.repo.createBulkPartners(records);
    }

    async updateBulkPartners(updates: any[]) {
        return await this.repo.updateBulkPartners(updates);
    }

    async updateAllPartners(ids: any[], data: any) {
        return await this.repo.updateAllPartners(ids, data);
    }

    async deleteAllPartners(ids: any[]) {
        return await this.repo.deleteAllPartners(ids);
    }

    async importPartners(records: any[], options: any = {}) {
        return await this.repo.importPartners(records, options);
    }

    async importUpdatePartners(updates: any[], options: any = {}) {
        return await this.repo.importUpdatePartners(updates, options);
    }

    async getViews(tableKey = 'partners_table_5001', userId = null) {
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

    async setDefaultView(id: any, tableKey = 'partners_table_5001', userId = null) {
        return await this.repo.setDefaultView(id, tableKey, userId);
    }
}
