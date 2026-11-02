"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "free-delivery-unlocked";

/**
 * Shows "🎉 Congrats! You've unlocked Free Delivery!" once, at the moment the cart
 * qualifies. If the cart stops qualifying and later qualifies again, it shows again.
 * No external toast library needed.
 */
export function DeliveryToast({ isFreeDelivery }: { isFreeDelivery: boolean }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let alreadyShown = false;
        try {
            alreadyShown = sessionStorage.getItem(STORAGE_KEY) === "1";
        } catch {
            /* storage unavailable – just show it */
        }

        if (!isFreeDelivery) {
            try {
                sessionStorage.removeItem(STORAGE_KEY);
            } catch { }
            setVisible(false);
            return;
        }
        if (alreadyShown) return;

        try {
            sessionStorage.setItem(STORAGE_KEY, "1");
        } catch { }
        setVisible(true);
        const t = setTimeout(() => setVisible(false), 5000);
        return () => clearTimeout(t);
    }, [isFreeDelivery]);

    if (!visible) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-in fade-in slide-in-from-top-4 duration-300"
        >
            <div className="flex items-start gap-3 rounded-xl border border-green-600/30 bg-green-50 px-4 py-3 shadow-lg dark:bg-green-950">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                        🎉 Congrats! You&apos;ve unlocked Free Delivery!
                    </p>
                    <p className="mt-0.5 text-xs text-green-700/80 dark:text-green-300/80">
                        Delivery and platform fee are waived on this order.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    aria-label="Dismiss"
                    className="text-green-800/60 hover:text-green-800 dark:text-green-200/60 dark:hover:text-green-200"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}