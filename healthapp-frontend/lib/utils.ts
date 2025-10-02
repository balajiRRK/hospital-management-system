import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * From Google word for word, "the cn refers to a utility function commonly found in projects utilizing shadcn/ui and Tailwind CSS.
 * provides a streamlined way to manage and combine class names in a React/Next.js application using Tailwind CSS,
 * ensuring that classes are applied conditionally and conflicts are resolved automatically.
 * This simplifies component styling and improves maintainability."
 *
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Date object into a 'YYYY-MM-DD' string.
 * for sending dates to an API
 */
export function yyyyMmDd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Formats the Date object into a readable string.
 *  for displaying dates to the user
 */
export function fmtHumanDate(d: Date): string {
  return d.toLocaleString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
