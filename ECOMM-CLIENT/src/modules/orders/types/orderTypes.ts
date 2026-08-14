// src/modules/orders/types/orderTypes.ts
export interface Order {
    id: string;
    user_id: string;
    order_number: string;
    status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    subtotal: string;
    total_items: number;
    created_at: string;
    updated_at: string;
    user?: {
        first_name: string;
        last_name: string;
        email: string;
    };
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: string;
    line_total: string;
    product?: {
        name: string;
        sku: string;
    };
}

export interface UpdateOrderStatus {
    status: Order['status'];
}