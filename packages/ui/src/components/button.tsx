import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[5px] text-sm font-medium ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'text-white bg-main border-2 border-border shadow-[4px_4px_0px_0px_border] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none',
        noShadow: 'text-white bg-main border-2 border-border',
        neutral:
          'bg-secondary-background text-foreground border-2 border-border shadow-[4px_4px_0px_0px_border] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none',
        reverse:
          'text-white bg-main border-2 border-border hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_0px_border]',
        outline:
          'bg-secondary-background text-foreground border-2 border-border hover:bg-main hover:text-white',
        ghost:
          'bg-transparent text-foreground border-2 border-transparent hover:border-border hover:bg-secondary-background',
        link: 'text-foreground underline-offset-4 hover:underline border-0',
        destructive:
          'text-white bg-destructive border-2 border-border shadow-[4px_4px_0px_0px_border] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants, type ButtonProps }
