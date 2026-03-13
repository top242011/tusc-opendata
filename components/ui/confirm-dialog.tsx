"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "default";
    loading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message,
    confirmLabel = "ยืนยัน",
    cancelLabel = "ยกเลิก",
    variant = "default",
    loading = false,
}: ConfirmDialogProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
            className="w-[90%] max-w-sm sm:max-w-[400px]"
        >
            <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3">
                    {variant === "danger" && (
                        <div className="p-2 rounded-full bg-[rgb(var(--ios-red))]/10 shrink-0">
                            <AlertTriangle className="w-5 h-5 text-[rgb(var(--ios-red))]" />
                        </div>
                    )}
                    <p className="text-sm text-[rgb(var(--ios-text-secondary))] leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === "danger" ? "destructive" : "default"}
                        size="sm"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "กำลังดำเนินการ..." : confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
