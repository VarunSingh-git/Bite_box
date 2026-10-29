interface DeliveryFeeParams {
    distanceKm: number, // distance b/w user and Restaurant
    cartTotalPaise: number, // cart total value in paise
    orderHour?: number; // current hour for time based charge apply
}

export function calculateDeliveryFee({
    distanceKm,
    cartTotalPaise,
    orderHour = new Date().getHours()
}: DeliveryFeeParams) {
    let deliveryFeePaise = 0;
    const cartTotalRupees = cartTotalPaise / 100;

    // 1. Distance-based calculation
    const baseDistanceKm = 3.0 // first 3 KM base fee
    const baseFeePaise = 3000 // 30 Rs. base delivery fee  
    const perKmExtraPaise = 1000 // 10 Rs. base delivery fee


    if (distanceKm < baseDistanceKm) deliveryFeePaise = baseFeePaise

    const extraKm = distanceKm - baseDistanceKm
    // 0 = 30 Rs + 2 (extra Km) * 10 Rs = 50 Rs (delivey charges)
    deliveryFeePaise = baseFeePaise + Math.ceil(extraKm) * perKmExtraPaise


    // 2. Time-of-Day Surge Pricing
    // Night Surge: 11 PM (23:00) to 6 AM (06:00) -> +₹30 extra
    if (orderHour >= 23 || orderHour < 6) { 
        deliveryFeePaise += 3000
    }
    // Peak Noon / Dinner Hour Surge: 12 PM - 2 PM or 8 PM - 10 PM -> +₹15 extra
    else if ((orderHour >= 12 && orderHour <= 14) || (orderHour >= 20 && orderHour <= 22)) {
        deliveryFeePaise += 1500
    }

    // 3. Cart Value Rules (Small Order & Free Delivery)
    let isFreeDelivery = false;
    let smallOrderFeePaise = 0

    if (cartTotalRupees <= 150) {
        // Agar order chota hai (<= ₹150, jaise ₹20 ya ₹50), toh small order surcharge ya normal delivery lagegi
        smallOrderFeePaise = 2000; // ₹20 extra handling fee for micro-orders
    } else if (cartTotalRupees >= 200) {
        // Agar order ₹200 se upar hai, toh delivery bilkul FREE!
        deliveryFeePaise = 0;
        isFreeDelivery = true;
    }

    const finalDeliveryFee = Math.max(0, deliveryFeePaise + smallOrderFeePaise);

    return {
        deliveryFeePaise: finalDeliveryFee,
        isFreeDelivery,
        smallOrderFeePaise,
    };
}