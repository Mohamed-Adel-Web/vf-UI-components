import { cva, type VariantProps } from 'class-variance-authority';

/** Scroll container. Required for `stickyHeader`, which needs a scrolling ancestor. */
export const tableContainerVariants = cva(
  'rounded-surface border-ink-200 dark:border-ink-800 relative w-full overflow-auto border',
);

export const tableVariants = cva(
  'text-ink-950 dark:text-ink-50 w-full border-collapse text-left text-sm',
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

export const tableCheckboxVariants = cva(
  'focus-ring accent-brand-600 size-4 shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
);

export type TableDensity = NonNullable<VariantProps<typeof tableCellVariants>['density']>;
export type TableAlign = NonNullable<VariantProps<typeof tableCellVariants>['align']>;
