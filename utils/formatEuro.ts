/**
 * Formats a numeric monetary value as a Euro string with exactly 2 decimal places.
 * e.g. 12330.4 => "12330.40 €"
 *
 * This utility is placed in /utils so Nuxt 3 auto-imports it in every page and component.
 */
export const formatEuro = (value: number | string | null | undefined): string => {
  return Number(value ?? 0).toFixed(2) + ' €';
};
