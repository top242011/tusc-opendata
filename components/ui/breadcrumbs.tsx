import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/utils/cn";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm text-[rgb(var(--ios-text-tertiary))] mb-6", className)}>
            <Link
                href="/"
                className="flex items-center hover:text-[rgb(var(--ios-accent))] transition-colors"
                title="หน้าหลัก"
            >
                <Home className="w-4 h-4" />
            </Link>

            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <div key={index} className="flex items-center">
                        <ChevronRight className="w-4 h-4 mx-2 text-[rgb(var(--ios-text-quaternary))]" />
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-[rgb(var(--ios-accent))] transition-colors font-medium"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                className="text-[rgb(var(--ios-text-primary))] font-semibold cursor-default"
                                aria-current={isLast ? "page" : undefined}
                            >
                                {item.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
