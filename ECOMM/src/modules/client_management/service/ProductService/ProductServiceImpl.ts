import ProductService from "./ProductService.js";

export class ProductServiceImpl implements ProductService {

    private readonly repo: any;

    constructor({ productRepository }: any) {
        this.repo = productRepository;
    }

    async createProduct(input: any) {
        return await this.repo.createProduct(input);
    }

    async getProduct(id: any) {
        return await this.repo.getProduct(id);
    }

    async getProducts(page: number, limit: number, inputs: any = {}) {
        const offset = (page - 1) * limit;
        const records = await this.repo.getProducts(limit, offset, inputs);
        const total = await this.repo.getTotalProducts(inputs);
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

    async updateProduct(id: any, data: any) {
        return await this.repo.updateProduct(id, data);
    }

    async deleteProduct(id: any) {
        return await this.repo.deleteProduct(id);
    }

    async createAllProducts(records: any[]) {
        return await this.repo.createBulkProducts(records);
    }

    async updateBulkProducts(updates: any[]) {
        return await this.repo.updateBulkProducts(updates);
    }

    async updateAllProducts(ids: any[], data: any) {
        return await this.repo.updateAllProducts(ids, data);
    }

    async deleteAllProducts(ids: any[]) {
        return await this.repo.deleteAllProducts(ids);
    }

    async importProducts(records: any[], options: any = {}) {
        return await this.repo.importProducts(records, options);
    }

    async importUpdateProducts(updates: any[], options: any = {}) {
        return await this.repo.importUpdateProducts(updates, options);
    }

    async getViews(tableKey = 'products_table_5003', userId = null) {
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

    async setDefaultView(id: any, tableKey = 'products_table_5003', userId = null) {
        return await this.repo.setDefaultView(id, tableKey, userId);
    }
}
