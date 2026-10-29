import { redis } from "./redis";

// Cart item shape
export interface CartItem {
    id: string,
    name: string,
    pricePaise: number,
    quantity: number,
    restaurantId: string
}

// Cart shape
export interface Cart {
    restaurantId: string | null,
    item: CartItem[]
}

const CART_PREFIX = 'cart:'

// in redis we save data in JSON.stringify() and get data using JSON.parse()

export async function getCart(userId: string): Promise<Cart> {
    const cartData = await redis.get(`${CART_PREFIX}${userId}`)
    if (!cartData) return { restaurantId: null, item: [] }

    // Parse JSON data stored in Redis
    return typeof cartData === "string" ? JSON.parse(cartData) : cartData
}

// Save cart to Redis
export async function saveCart(userId: string, cart: Cart): Promise<void> {
    await redis.set(`${CART_PREFIX}${userId}`, JSON.stringify(cart))
}