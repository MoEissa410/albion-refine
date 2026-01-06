/**
 * FORMATTERS UTILITY
 *
 * Contains standardized formatting functions used across the application
 * to ensure consistent display of data (currency, numbers, etc.).
 */

/**
 * formatMoney
 *
 * Formats a number as a currency string (Albion Silver).
 * Handles infinite/NaN values gracefully by defaulting to 0.
 *
 * @param value - The numeric amount to format
 * @returns A formatted string (e.g., "1,250,000")
 */
export const formatMoney = (value: number): string =>
  new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

/**
 * formatPercent
 *
 * Formats a number as a percentage string.
 *
 * @param value - The decimal percentage (e.g., 0.15 for 15%)
 * @returns A formatted string (e.g., "15%")
 */
export const formatPercent = (value: number): string =>
  new Intl.NumberFormat("en", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
