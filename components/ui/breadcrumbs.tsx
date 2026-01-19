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
        <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm text-slate-500 mb-6", className)}>
            <Link
                href="/"
                className="flex items-center hover:text-blue-600 transition-colors"
                title="หน้าหลัก"
            >
                <Home className="w-4 h-4" />
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-blue-600 transition-colors font-medium"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-slate-900 font-semibold cursor-default">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
