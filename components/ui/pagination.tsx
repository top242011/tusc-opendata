"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    shownItems?: number;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    shownItems,
    className,
}: PaginationProps) {
    if (totalPages <= 1 && !totalItems) return null;

    return (
        <div className={cn("flex items-center justify-between space-x-2 py-4", className)}>
            <div className="text-sm text-[rgb(var(--ios-text-secondary))]">
                {totalItems !== undefined && shownItems !== undefined
                    ? `แสดง ${shownItems} จาก ${totalItems} รายการ`
                    : `หน้า ${currentPage} จาก ${totalPages || 1}`
                }
            </div>
            <div className="flex items-center space-x-2">
                <button
                    className="h-9 w-9 p-0 flex items-center justify-center rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-fill-tertiary))] disabled:opacity-50 hover:bg-[rgb(var(--ios-fill-secondary))] transition-colors ios-press"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    aria-label="หน้าก่อนหน้า"
                >
                    <ChevronLeft className="h-4 w-4 text-[rgb(var(--ios-text-primary))]" aria-hidden="true" />
                </button>
                <div className="text-sm font-medium text-[rgb(var(--ios-text-primary))] min-w-[3rem] text-center">
                    {currentPage} / {totalPages || 1}
                </div>
                <button
                    className="h-9 w-9 p-0 flex items-center justify-center rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-fill-tertiary))] disabled:opacity-50 hover:bg-[rgb(var(--ios-fill-secondary))] transition-colors ios-press"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || totalPages === 0}
                    aria-label="หน้าถัดไป"
                >
                    <ChevronRight className="h-4 w-4 text-[rgb(var(--ios-text-primary))]" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
