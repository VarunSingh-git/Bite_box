import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCart } from "@/lib/cart";
import { auth } from "@/lib/auth";

export async function CartButtonBadge() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const cart = await getCart(session?.user?.id);
  const totalItems = cart.item.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItems === 0) return null;

  return (
    <Link href="/cart">
      <div className="relative inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium shadow-md hover:bg-primary/90 transition-all">
        <ShoppingCart className="w-4 h-4" />
        <span>Go to Cart</span>
        <span className="bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full">
          {totalItems}
        </span>
      </div>
    </Link>
  );
}