import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Enter motion uses `@starting-style` (Tailwind's `starting:` variant), so no Angular
 * animations package is needed. CDK removes overlays immediately on close, so there is
 * no exit motion by design.
 */
const enter =
  'transition-[opacity,scale,translate] duration-200 ease-out motion-reduce:transition-none';

export const backdropVariants = cva('bg-ink-950/60');

/** Applied to the CDK overlay pane that hosts a dialog or drawer. */
export const modalSurfaceVariants = cva(
  [
    'flex flex-col bg-white text-ink-950 shadow-xl dark:bg-ink-900 dark:text-ink-50',
    // The pane's only child is `cdk-dialog-container`; it becomes the scroll area.
    '*:overflow-y-auto *:outline-none',
    enter,
  ],
  {
    variants: {
      placement: {
        center: 'rounded-surface starting:scale-95 starting:opacity-0',
        start: 'starting:-translate-x-full rtl:starting:translate-x-full',
        end: 'starting:translate-x-full rtl:starting:-translate-x-full',
        bottom: 'rounded-t-surface starting:translate-y-full',
      },
    },
    defaultVariants: {
      placement: 'center',
    },
  },
);

/** Shared by menus and popovers so floating UI looks like one family. */
export const floatingSurfaceVariants = cva([
  'block rounded-lg border border-ink-200 bg-white text-ink-950 shadow-lg outline-none',
  'dark:border-ink-800 dark:bg-ink-900 dark:text-ink-50',
  'transition-[opacity,scale] duration-150 ease-out motion-reduce:transition-none',
  'starting:scale-95 starting:opacity-0',
]);

export type ModalPlacement = NonNullable<VariantProps<typeof modalSurfaceVariants>['placement']>;
