import { cva, type VariantProps } from 'class-variance-authority';

// Floats clear of the viewport edge on every side, matching the Figma panel.
export const drawerPanelVariants = cva(
  'bg-ink-50 text-ink-950 dark:bg-ink-950 dark:text-ink-50 border-ink-200 dark:border-ink-800 shadow-overlay drawer-panel-transition rounded-overlay fixed inset-y-4 z-50 flex flex-col overflow-hidden border outline-none',
  {
    variants: {
      side: {
        start: 'start-4',
        end: 'end-4',
      },
      size: {
        sm: 'w-80',
        md: 'w-96',
        lg: 'w-[30rem]',
        full: 'start-4 end-4 w-auto',
      },
    },
    defaultVariants: {
      side: 'end',
      size: 'md',
    },
  },
);

export type DrawerSide = NonNullable<VariantProps<typeof drawerPanelVariants>['side']>;
export type DrawerSize = NonNullable<VariantProps<typeof drawerPanelVariants>['size']>;
