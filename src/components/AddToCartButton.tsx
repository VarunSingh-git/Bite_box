"use client"

import { useState } from "react"
import { addToCart } from "@/lib/cart-actions"
import { Button } from "@base-ui/react/button"
import { toast } from "sonner"

interface AddToCartButton {
    item: {
        id: string,
        name: string,
        pricePaise: number,
        restaurantId: string
    }
}

export function AddToCartButton({ item }: AddToCartButton) {
    const [IsLoading, setIsLoading] = useState(false)
    const [btnValue, setBtnValue] = useState("")
    const [isSuccess, setIsSuccess] = useState(false);

    const handleAddCart = async () => {
        try {
            setIsLoading(true)
            const res = await addToCart({
                ...item,
                quantity: 1 // Default quantity 1
            })

            if (res && res.error) {
                toast.error(res.error); // Error Toast
            } else {
                setIsSuccess(true);
                toast.success(`${item.name} added to cart!`);
                setTimeout(() => {
                    setIsSuccess(false);
                }, 800);
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            onClick={handleAddCart}
            disabled={IsLoading}
            className={`rounded-lg px-6 py-3 font-semibold transition-all duration-300
                active:scale-[0.98]
                ${isSuccess
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-black text-white hover:bg-gray-200 hover:text-black"
                }`}
        >

            {IsLoading
                ? "Adding..."
                : isSuccess
                    ? "✓ Added to cart!"
                    : "Add to cart"}
        </Button>
    )
}