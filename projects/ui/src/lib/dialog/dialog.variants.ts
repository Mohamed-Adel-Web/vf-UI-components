import { cva } from 'class-variance-authority';

export const DIALOG_WIDTHS = {
  sm: '24rem',
  md: '32rem',
  lg: '44rem',
  xl: '60rem',
} as const;

export type DialogSize = keyof typeof DIALOG_WIDTHS;

export const dialogHeaderVariants = cva('flex items-start gap-3 px-6 pt-6 pb-2');

export const dialogTitleVariants = cva(
  'min-w-0 flex-1 text-lg leading-7 font-semibold text-balance',
);

export const dialogDescriptionVariants = cva(
  'text-ink-950/70 dark:text-ink-50/70 text-sm leading-6',
);

export const dialogBodyVariants = cva('block px-6 py-2 text-base leading-6');

export const dialogFooterVariants = cva(
  // Stacked with the primary action on top on phones; row, aligned to the end, from sm up.
  'flex flex-col-reverse gap-2 px-6 pt-4 pb-6 sm:flex-row sm:justify-end',
);

export const dialogCloseIconVariants = cva(
  'focus-ring -me-2 -mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-lg ' +
    'opacity-60 transition-opacity hover:opacity-100 motion-reduce:transition-none',
);
