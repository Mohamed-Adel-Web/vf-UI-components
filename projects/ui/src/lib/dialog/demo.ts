// Story-only button styles. Swap for `vfButton` once the Button component lands.
// Not exported from the public API.
const base =
  'focus-ring inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 ' +
  'text-sm font-medium whitespace-nowrap';

export const demo = {
  primary: `${base} bg-ink-950 text-white dark:bg-white dark:text-ink-950`,
  secondary: `${base} border-[1.5px] border-ink-200 text-ink-950 dark:border-ink-800 dark:text-ink-50`,
  danger: `${base} bg-red-700 text-white`,
  icon:
    'focus-ring inline-flex size-10 items-center justify-center rounded-lg border-[1.5px] ' +
    'border-ink-200 text-ink-950 dark:border-ink-800 dark:text-ink-50',
  surface: 'bg-ink-50 dark:bg-ink-950 text-ink-950 dark:text-ink-50 p-4',
  field:
    'focus-ring h-10 rounded-lg border-[1.5px] border-ink-200 bg-transparent px-3 text-sm ' +
    'font-normal dark:border-ink-800',
} as const;
