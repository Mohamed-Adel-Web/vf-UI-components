import { cva, type VariantProps } from 'class-variance-authority';

export const tabsListVariants = cva('flex items-stretch gap-0 border-ink-200 dark:border-ink-800', {
  variants: {
    orientation: {
      horizontal: 'flex-row border-b-[1.5px]',
      vertical: 'flex-col border-e-[1.5px]',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export const tabVariants = cva(
  'focus-ring inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-t-lg border-b-[1.5px] px-2 text-base font-medium whitespace-nowrap transition-[opacity,color] select-none disabled:pointer-events-none disabled:opacity-30',
  {
    variants: {
      selected: {
        true: 'border-ink-950 text-ink-950 dark:border-white dark:text-white opacity-100',
        false:
          'border-ink-200 text-ink-950 dark:border-ink-800 dark:text-ink-50 opacity-50 hover:opacity-80',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

export type TabsOrientation = NonNullable<VariantProps<typeof tabsListVariants>['orientation']>;
