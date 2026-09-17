import { cva, type VariantProps } from 'class-variance-authority';

export const toastViewportVariants = cva('flex w-[min(24rem,calc(100vw-2rem))] gap-2', {
  variants: {
    edge: {
      // Newest sits closest to the screen edge it enters from.
      top: 'flex-col-reverse',
      bottom: 'flex-col',
    },
  },
  defaultVariants: { edge: 'bottom' },
});

export const toastVariants = cva(
  [
    'flex items-start gap-3 rounded-lg border border-s-4 p-3 pe-2 text-sm leading-5 shadow-lg',
    'border-ink-200 bg-white text-ink-950 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-50',
    'transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none',
    'starting:translate-y-2 starting:opacity-0',
  ],
  {
    variants: {
      // Default-palette colours: map these to your semantic tokens if the theme has them.
      tone: {
        neutral: 'border-s-ink-950 dark:border-s-ink-50',
        success: 'border-s-emerald-600',
        error: 'border-s-red-600',
        warning: 'border-s-amber-500',
        info: 'border-s-sky-600',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export const toastIconVariants = cva('mt-0.5 size-4 shrink-0', {
  variants: {
    tone: {
      neutral: 'hidden',
      success: 'text-emerald-600 dark:text-emerald-400',
      error: 'text-red-600 dark:text-red-400',
      warning: 'text-amber-600 dark:text-amber-400',
      info: 'text-sky-600 dark:text-sky-400',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export const toastActionVariants = cva(
  'focus-ring shrink-0 rounded-md px-2 py-0.5 text-sm font-semibold underline-offset-2 hover:underline',
);

export const toastDismissVariants = cva(
  'focus-ring -my-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md ' +
    'opacity-60 transition-opacity hover:opacity-100 motion-reduce:transition-none',
);

export type ToastTone = NonNullable<VariantProps<typeof toastVariants>['tone']>;
