export class ProductService {

    private readonly productRepository:any;

    constructor({ productRepository }:any)
    {
        this.productRepository = productRepository;
    }

    async createProduct(input:any)
    {
        return await this.productRepository.createProduct(input);
    }
}