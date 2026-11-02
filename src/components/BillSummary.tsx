import { Info, PartyPopper, Bike } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatPaise, DELIVERY_CONFIG, type DeliveryBreakdown } from "@/lib/delivery";

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
    return (
        <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            <span className={strong ? "font-semibold text-foreground" : "text-foreground"}>{value}</span>
        </div>
    );
}

const FREE = <span className="font-medium text-green-600">FREE</span>;

export function BillSummary({ b }: { b: DeliveryBreakdown }) {
    const grandTotal = b.cartTotalPaise + b.deliveryFeePaise + b.smallOrderFeePaise;
    const progress = Math.min(100, Math.round((b.cartTotalPaise / DELIVERY_CONFIG.FREE_MIN_CART_PAISE) * 100));
    const feesWaived = b.isFreeDelivery && b.smallOrderFeePaise === 0;

    if (!b.isDeliverable) {
        return (
            <Card className="mb-6 space-y-1 p-6 text-sm">
                <p className="font-semibold text-foreground">This kitchen is too far from your location.</p>
                <p className="text-muted-foreground">We can&apos;t deliver this order. Try a kitchen closer to you.</p>
            </Card>
        );
    }

    return (
        <Card className="mb-6 space-y-4 p-6">
            {b.isFreeDelivery && (
                <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                    <PartyPopper className="h-5 w-5 shrink-0" />
                    <span>
                        <span className="font-semibold">Free delivery unlocked.</span>
                        {b.savedPaise >= 100 && <> You saved {formatPaise(b.savedPaise)} on this order.</>}
                    </span>
                </div>
            )}

            {b.amountToFreePaise > 0 && (
                <div className="space-y-2 rounded-lg bg-secondary/60 p-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Bike className="h-4 w-4 shrink-0" />
                        <span>
                            Add <span className="font-semibold">{formatPaise(b.amountToFreePaise)}</span> more for
                            free delivery
                        </span>
                    </div>
                    <div
                        className="h-1.5 overflow-hidden rounded-full bg-border"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            <div className="space-y-3 text-sm">
                <Row label="Item total" value={formatPaise(b.cartTotalPaise)} />

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span>Delivery charge ({b.distanceKm.toFixed(1)} km)</span>

                        <Popover>
                            <PopoverTrigger
                                aria-label="View fee breakdown"
                                className="inline-flex cursor-pointer items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Info className="h-4 w-4" />
                            </PopoverTrigger>

                            <PopoverContent className="w-72 space-y-2 p-4 text-xs">
                                <p className="text-sm font-semibold text-foreground">Fee breakdown</p>
                                <Row label="Distance" value={`${b.distanceKm.toFixed(1)} km`} />
                                <Row
                                    label="Delivery charge"
                                    value={b.isFreeDelivery ? FREE : formatPaise(b.deliveryFeePaise)}
                                />
                                <Row
                                    label="Platform & handling fee"
                                    value={feesWaived ? FREE : formatPaise(b.smallOrderFeePaise)}
                                />
                                <div className="border-t pt-2">
                                    <Row
                                        label="Total fees"
                                        value={formatPaise(b.deliveryFeePaise + b.smallOrderFeePaise)}
                                        strong
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <span>{b.isFreeDelivery ? FREE : formatPaise(b.deliveryFeePaise)}</span>
                </div>

                <Row
                    label="Platform & handling fee"
                    value={feesWaived ? FREE : `+${formatPaise(b.smallOrderFeePaise)}`}
                />
            </div>

            <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Grand total</span>
                <span>{formatPaise(grandTotal)}</span>
            </div>
        </Card>
    );
}