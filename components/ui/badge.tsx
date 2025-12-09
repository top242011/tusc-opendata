import { cn } from "@/utils/cn"
import { cva, type VariantProps } from "class-variance-authority"

// Note: standard cva is not installed, so I'll do a simpler version or just use clsx logic manually 
// since I didn't install class-variance-authority. 
// I will implement a simpler version without cva to save an install, or I'll install it.
// Given constraints, I'll stick to simple props.

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80",
        secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        destructive: "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80",
        outline: "text-slate-950",
        success: "border-transparent bg-green-100 text-green-800",
        warning: "border-transparent bg-yellow-100 text-yellow-800",
    }

    return (
        <div className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
            variants[variant],
            className
        )} {...props} />
    )
}
