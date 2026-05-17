/**
 * Generic UI helpers. Keep tiny; domain-specific helpers belong in
 * lib/<domain>/ (e.g., lib/market/, lib/portfolio/, lib/tax/).
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Conditional + de-duplicated className helper. Standard shadcn/ui pattern.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
