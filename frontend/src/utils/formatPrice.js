/**
 * Formats a price value as US dollars.
 * Example: 2800 → "US$ 2.800"
 */
export const formatPrice = (amount) => {
    if (amount == null) return "US$ 0"
    return `US$ ${Number(amount).toLocaleString("es-CL")}`
}
