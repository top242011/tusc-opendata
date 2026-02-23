import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

const buttonVariants = cva(
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ios-press",
    {
        variants: {
            variant: {
                default:
                    "bg-[rgb(var(--ios-accent))] text-white hover:bg-[rgb(var(--ios-accent-hover))] focus-visible:ring-[rgb(var(--ios-accent))]",
                destructive:
                    "bg-[rgb(var(--ios-red))] text-white hover:opacity-90 focus-visible:ring-[rgb(var(--ios-red))]",
                outline:
                    "border border-[rgb(var(--ios-separator))] bg-[rgb(var(--ios-bg-secondary))] text-[rgb(var(--ios-text-primary))] hover:bg-[rgb(var(--ios-fill-tertiary))]",
                secondary:
                    "bg-[rgb(var(--ios-fill-secondary))] text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-fill-primary))]",
                ghost:
                    "text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-fill-tertiary))]",
                link:
                    "text-[rgb(var(--ios-accent))] underline-offset-4 hover:underline",
            },
            size: {
                default: "h-11 px-5 py-2.5 text-[15px] rounded-[var(--ios-radius-md)]",
                sm: "h-9 px-4 text-[13px] rounded-[var(--ios-radius-sm)]",
                lg: "h-12 px-8 text-[17px] rounded-[var(--ios-radius-md)]",
                icon: "h-11 w-11 rounded-[var(--ios-radius-md)]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
