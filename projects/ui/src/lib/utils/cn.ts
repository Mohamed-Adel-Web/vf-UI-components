import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes so a consumer-supplied `class` always wins over the
 * component's defaults (e.g. `bg-brand-600` + `bg-ink-900` -> `bg-ink-900`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
