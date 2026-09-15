import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'focus-ring inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-control',
        secondary: 'bg-ink-100 text-ink-900 hover:bg-ink-200',
        outline: 'border-ink-300 text-ink-900 hover:bg-ink-50 border bg-transparent',
        ghost: 'text-ink-900 hover:bg-ink-100 bg-transparent',
        danger: 'bg-danger shadow-control text-white hover:brightness-95',
      },
      size: {
        sm: 'rounded-control h-8 px-3 text-sm',
        md: 'rounded-control h-10 px-4 text-sm',
        lg: 'rounded-control h-12 px-6 text-base',
        icon: 'rounded-control h-10 w-10 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;
