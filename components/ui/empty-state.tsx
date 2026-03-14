import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-12 px-6 text-center",
            className
        )}>
            {icon && (
                <div className="p-4 rounded-full bg-[rgb(var(--ios-fill-tertiary))] mb-4">
                    {icon}
                </div>
            )}
            <h3 className="text-base font-semibold text-[rgb(var(--ios-text-primary))] mb-1.5">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] max-w-sm mb-4">
                    {description}
                </p>
            )}
            {action && (
                <Button variant="outline" size="sm" onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}
