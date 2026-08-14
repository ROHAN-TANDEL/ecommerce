// src/modules/cart/types/cartTypes.ts
export interface ICartItem {
    id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    unit_price: string;
    subtotal: string;
    // Product details (joined from API)
    name: string;
    sku: string;
    description: string;
    price: string;
    stock_quantity: number;
    image_url?: string;
}

export interface Cart {
    items: ICartItem[];
    subtotal: string;
    totalItems: number;
}

export interface AddToCartData {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemData {
    quantity: number;
}

export interface CheckoutResponse {
    status: string;
    message: string;
    orderId?: string;
}