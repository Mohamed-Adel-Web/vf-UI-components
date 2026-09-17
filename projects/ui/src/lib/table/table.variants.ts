import { cva, type VariantProps } from 'class-variance-authority';

/** Scroll container. Required for `stickyHeader`, which needs a scrolling ancestor. */
export const tableContainerVariants = cva(
  'rounded-surface border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-950 relative w-full overflow-auto border',
);

export const tableVariants = cva(
  'bg-ink-50 text-ink-950 dark:bg-ink-950 dark:text-ink-50 w-full border-collapse text-left text-sm',
);

export const tableRowVariants = cva(
  'border-ink-200 dark:border-ink-800 border-b transition-colors last:border-b-0',
  {
    variants: {
      // Declared before `selected` so tailwind-merge lets the selected background win.
      striped: {
        true: 'odd:bg-ink-50 dark:odd:bg-ink-900/40',
        false: '',
      },
      hoverable: {
        true: 'hover:bg-ink-100 dark:hover:bg-ink-800/60',
        false: '',
      },
      selected: {
        true: 'bg-brand-50 dark:bg-brand-950/60',
        false: '',
      },
      disabled: {
        true: 'pointer-events-none opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      striped: false,
      hoverable: false,
      selected: false,
      disabled: false,
    },
  },
);

export const tableCellVariants = cva('align-middle', {
  variants: {
    density: {
      compact: 'px-3 py-1.5',
      comfortable: 'px-4 py-2.5',
      spacious: 'px-6 py-4',
    },
    align: {
      start: 'text-left',
      center: 'text-center',
      end: 'text-right',
    },
    numeric: {
      true: 'text-right tabular-nums',
      false: '',
    },
  },
  defaultVariants: {
    density: 'comfortable',
    align: 'start',
    numeric: false,
  },
});

export const tableHeadVariants = cva(
  'bg-ink-50 dark:bg-ink-900 text-ink-700 dark:text-ink-300 align-middle font-medium whitespace-nowrap',
  {
    variants: {
      density: {
        compact: 'px-3 py-1.5',
        comfortable: 'px-4 py-2.5',
        spacious: 'px-6 py-4',
      },
      align: {
        start: 'text-left',
        center: 'text-center',
        end: 'text-right',
      },
      numeric: {
        true: 'text-right tabular-nums',
        false: '',
      },
      sticky: {
        true: 'sticky top-0 z-10',
        false: '',
      },
    },
    defaultVariants: {
      density: 'comfortable',
      align: 'start',
      numeric: false,
      sticky: false,
    },
  },
);

// Hand-drawn (not native `accent-color`) so unchecked/checked/indeterminate all match the
// table's own surface tokens in dark mode instead of the browser's light UA checkbox chrome.
export const tableCheckboxVariants = cva(
  "focus-ring relative inline-flex size-4 shrink-0 cursor-pointer appearance-none items-center justify-center rounded border transition-colors border-ink-300 bg-white dark:border-ink-700 dark:bg-ink-950 checked:border-brand-600 checked:bg-brand-600 indeterminate:border-brand-600 indeterminate:bg-brand-600 dark:checked:border-brand-600 dark:checked:bg-brand-600 dark:indeterminate:border-brand-600 dark:indeterminate:bg-brand-600 before:content-[''] before:hidden indeterminate:before:block before:h-0.5 before:w-2 before:rounded-full before:bg-white after:content-[''] after:hidden checked:after:block after:h-2 after:w-1 after:-translate-y-px after:rotate-45 after:border-b-2 after:border-r-2 after:border-white disabled:cursor-not-allowed disabled:opacity-50",
);

export type TableDensity = NonNullable<VariantProps<typeof tableCellVariants>['density']>;
export type TableAlign = NonNullable<VariantProps<typeof tableCellVariants>['align']>;
