import { cva, type VariantProps } from 'class-variance-authority';

// 88px collapsed / 215px expanded — matches the Figma `web / sidebarNavigation` frames exactly.
export const sidebarNavVariants = cva(
  'sidebar-nav-transition flex h-full flex-col overflow-hidden border-e bg-ink-50 text-ink-950 border-ink-200 dark:bg-ink-950 dark:text-ink-50 dark:border-ink-800',
  {
    variants: {
      collapsed: {
        true: 'w-[5.5rem]',
        false: 'w-[13.4375rem]',
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  },
);

export type SidebarNavCollapsed = NonNullable<VariantProps<typeof sidebarNavVariants>['collapsed']>;

export const sidebarNavItemVariants = cva(
  'focus-ring group/nav-item relative flex h-10 shrink-0 items-center gap-2 rounded-control text-sm font-medium outline-none transition-colors disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      active: {
        true: 'bg-ink-200 text-ink-950 dark:bg-ink-800 dark:text-white',
        false: 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-900',
      },
      collapsed: {
        // w-11 == 44px, matching the collapsed nav item width in Figma.
        true: 'w-11 shrink-0 self-center justify-center px-0',
        false: 'w-full justify-start px-3',
      },
    },
    defaultVariants: {
      active: false,
      collapsed: false,
    },
  },
);

export type SidebarNavItemActive = NonNullable<
  VariantProps<typeof sidebarNavItemVariants>['active']
>;

export const sidebarNavUserVariants = cva(
  'focus-ring flex items-center gap-2 rounded-control p-3 text-start transition-colors hover:bg-ink-100 dark:hover:bg-ink-900',
  {
    variants: {
      collapsed: {
        true: 'w-11 shrink-0 self-center justify-center px-0',
        false: 'w-full justify-start',
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  },
);

export type SidebarNavUserCollapsed = NonNullable<
  VariantProps<typeof sidebarNavUserVariants>['collapsed']
>;

export const sidebarNavSectionLabelClass =
  'px-3 pb-1 text-xs font-semibold tracking-wide text-ink-500 uppercase dark:text-ink-400';

export const sidebarNavBadgeClass =
  'flex h-4 min-w-4 shrink-0 items-center justify-center rounded px-1 text-xs font-medium text-white bg-brand-700 dark:bg-brand-800';

// Rotates a single chevron/sidebar-arrow icon 180° instead of requiring two projected icons.
export const sidebarNavToggleClass =
  'focus-ring rounded-control dark:hover:bg-ink-800 flex h-8 w-8 shrink-0 items-center justify-center hover:bg-ink-100 [&_svg]:transition-transform';
