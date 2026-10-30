"use server"


import { getCart, saveCart, CartItem } from "./cart"
import { revalidatePath } from "next/cache"
import { requireUser } from "./guards";

export async function addToCart(item: CartItem, forceClear: boolean = false) {
    const session = await requireUser();
    if (!session.id) return null
    const userId = session?.id
    if (!userId) return { error: "Unauthenticate, Please login again" }

    const cart = await getCart(userId)
    // Rule: If cart has items from a DIFFERENT restaurant, clear or prompt
    if (cart.restaurantId && cart.restaurantId !== item.restaurantId && !forceClear) {
        return {
            success: false,
            error: "Do you want to clear your cart and start a fresh one ?",
            cart
        }
    }
    if (forceClear) {
        cart.item = [];
        cart.restaurantId = null;
    }
    // we put restaurantId in cart from item.restaurantId 
    cart.restaurantId = item.restaurantId

    const cartItemExistenceIndex = cart.item.findIndex((i) => i.id === item.id)
    if (cartItemExistenceIndex > -1) {
        // cart.item[existingIndex] is represnt here index of an array 
        // and inside this quantity increament with item.quantity
        cart.item[cartItemExistenceIndex].quantity += item.quantity
    }
    else {
        cart.item.push(item)
    }
    await saveCart(userId, cart);
    revalidatePath(`/restaurant/${item.restaurantId}`)

    return { success: true, cart }
}

export async function updateCartQuantity(itemId: string, itemQuantity: number) {
    const session = await requireUser();
    if (!session?.id) return { error: "Unauthorized" }

    // get data from redis
    const cart = await getCart(session.id)
    // find items that present in cart and match it with fetched data
    const itemIndex = cart.item.findIndex((i) => i.id === itemId)
    // 
    if (itemIndex > -1) {
        // update the quantity of item in cart accordingly
        cart.item[itemIndex].quantity += itemQuantity

        // if cart value is equal to zero or less then zero, rmv the item
        if (cart.item[itemIndex].quantity <= 0) {
            cart.item.splice(itemIndex, 1)
        }
    }
    // if nothng exist in cart and length of cart is 0 then rmv the restaurantId from cart
    if (cart.item.length === 0) cart.restaurantId = null;

    // save data in cart
    await saveCart(session?.id, cart)
    revalidatePath("/cart")
    return { success: true }

}

export async function removeCartItem(itemId: string) {
    const session = await requireUser();
    if (!session?.id) return { error: "Unauthorized" }

    const cart = await getCart(session?.id)
    cart.item = cart.item.filter((i) => i.id !== itemId)

    if (cart.item.length === 0) {
        cart.restaurantId = null
    }

    await saveCart(session.id, cart)
    revalidatePath("/cart")
    return { success: true }
}