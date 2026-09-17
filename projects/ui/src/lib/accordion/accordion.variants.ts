import { cva, type VariantProps } from 'class-variance-authority';

export const accordionRootClass = 'flex w-full flex-col gap-3';

// Each item is its own bordered card (matches the Figma `accordionItemWithSlot` frame).
export const accordionItemVariants = cva(
  'bg-ink-50 dark:bg-ink-950 border-ink-200 dark:border-ink-800 rounded-surface flex flex-col overflow-hidden border transition-opacity',
  {
    variants: {
      disabled: {
        true: 'opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
);

export type AccordionItemDisabled = NonNullable<
  VariantProps<typeof accordionItemVariants>['disabled']
>;

export const accordionTriggerClass =
  'focus-ring flex w-full items-start gap-4 p-4 text-start disabled:pointer-events-none';

// Rotates a single projected chevron/arrow icon 180° instead of requiring two icons.
export const accordionChevronVariants = cva(
  'text-ink-950 dark:text-ink-50 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control [&_svg]:size-4 [&_svg]:transition-transform [&_svg]:duration-base',
  {
    variants: {
      expanded: {
        true: '[&_svg]:rotate-180',
        false: '',
      },
    },
    defaultVariants: {
      expanded: false,
    },
  },
);

export type AccordionChevronExpanded = NonNullable<
  VariantProps<typeof accordionChevronVariants>['expanded']
>;
