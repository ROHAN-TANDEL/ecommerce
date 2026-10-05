// examples/redis/integrations/02-shopping-cart/cart.ts
export function shoppingCart(context: any) {
    const { redis } = context;

    const CART_PREFIX = 'cart:';
    const CART_TTL = 86400; // 24 hours

    // ============ GET CART ============
    async function getCart(userId: string) {
        const cartKey = `${CART_PREFIX}${userId}`;
        const cartData = await redis.get(cartKey);

        if (!cartData) {
            return { items: [], total: 0, count: 0 };
        }

        const cart = cartData;

        // Calculate totals
        let total = 0;
        let count = 0;
        for (const item of cart.items || []) {
            total += item.price * item.quantity;
            count += item.quantity;
        }

        return {
            ...cart,
            total: total.toFixed(2),
            count
        };
    }

    // ============ ADD TO CART ============
    async function addToCart(userId: string, productId: string, quantity: number = 1) {
        const cartKey = `${CART_PREFIX}${userId}`;
        let cart = await redis.get(cartKey) || { items: [] };

        // Find existing item
        const existingItem = cart.items.find((item: any) => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            // Fetch product details (from cache or DB)
            const product = await getProductDetails(productId);
            cart.items.push({
                productId,
                name: product.name,
                price: product.price,
                quantity,
                image: product.image
            });
        }

        await redis.set(cartKey, cart, CART_TTL);

        // Update cart count in session
        await updateCartCount(userId);

        return await getCart(userId);
    }

    // ============ UPDATE CART ITEM ============
    async function updateCartItem(userId: string, productId: string, quantity: number) {
        const cartKey = `${CART_PREFIX}${userId}`;
        let cart = await redis.get(cartKey);

        if (!cart) {
            throw new Error('Cart not found');
        }

        const item = cart.items.find((item: any) => item.productId === productId);
        if (!item) {
            throw new Error('Item not found in cart');
        }

        if (quantity <= 0) {
            // Remove item
            cart.items = cart.items.filter((item: any) => item.productId !== productId);
        } else {
            item.quantity = quantity;
        }

        await redis.set(cartKey, cart, CART_TTL);
        await updateCartCount(userId);

        return await getCart(userId);
    }

    // ============ REMOVE FROM CART ============
    async function removeFromCart(userId: string, productId: string) {
        return await updateCartItem(userId, productId, 0);
    }

    // ============ CLEAR CART ============
    async function clearCart(userId: string) {
        const cartKey = `${CART_PREFIX}${userId}`;
        await redis.del(cartKey);
        await updateCartCount(userId);
        return { success: true };
    }

    // ============ UPDATE CART COUNT IN SESSION ============
    async function updateCartCount(userId: string) {
        const cart = await getCart(userId);
        await redis.set(`cart:count:${userId}`, cart.count, CART_TTL);
        return cart.count;
    }

    // ============ GET CART COUNT ============
    async function getCartCount(userId: string) {
        const count = await redis.get(`cart:count:${userId}`);
        return count || 0;
    }

    // ============ MERGE CARTS (Guest → Logged-in) ============
    async function mergeCarts(guestId: string, userId: string) {
        const guestCart = await getCart(guestId);
        const userCart = await getCart(userId);

        if (guestCart.items.length === 0) {
            return userCart;
        }

        // Merge guest items into user cart
        const mergedItems = [...userCart.items];
        for (const guestItem of guestCart.items) {
            const existing = mergedItems.find((item: any) =>
                item.productId === guestItem.productId
            );
            if (existing) {
                existing.quantity += guestItem.quantity;
            } else {
                mergedItems.push(guestItem);
            }
        }

        // Update user cart
        const cartKey = `${CART_PREFIX}${userId}`;
        await redis.set(cartKey, { items: mergedItems }, CART_TTL);

        // Clear guest cart
        await redis.del(`${CART_PREFIX}${guestId}`);
        await updateCartCount(userId);

        return await getCart(userId);
    }

    // ============ RESTORE CART AFTER CHECKOUT ============
    async function restoreCart(userId: string, cartData: any) {
        const cartKey = `${CART_PREFIX}${userId}`;
        await redis.set(cartKey, cartData, CART_TTL);
        await updateCartCount(userId);
        return { success: true };
    }

    // ============ HELPER: Get Product Details ============
    async function getProductDetails(productId: string) {
        // First check cache
        const cached = await redis.get(`product:${productId}`);
        if (cached) return cached;

        // Fetch from DB (simulated)
        const product = {
            id: productId,
            name: `Product ${productId}`,
            price: 99.99,
            image: `/images/product-${productId}.jpg`
        };

        // Cache for 1 hour
        await redis.set(`product:${productId}`, product, 3600);
        return product;
    }

    return {
        getCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartCount,
        mergeCarts,
        restoreCart
    };
}