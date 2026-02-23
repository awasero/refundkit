'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default: 'bg-accent text-black hover:bg-accent-hover rounded-lg',
        secondary: 'bg-surface-raised text-text-secondary border border-border hover:bg-surface-hover hover:text-text-primary rounded-lg',
        ghost: 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-lg',
        danger: 'bg-danger text-white hover:bg-danger-hover rounded-lg',
        outline: 'bg-transparent text-text-secondary border border-border hover:border-accent/30 hover:text-accent rounded-lg',
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5',
        default: 'h-10 px-4 py-2 gap-2',
        lg: 'h-12 px-6 text-base gap-2',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
