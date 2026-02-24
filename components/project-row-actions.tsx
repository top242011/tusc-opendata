"use client";

import { Download, Share2 } from "lucide-react";

interface ProjectRowActionsProps {
    projectName: string;
    organization: string;
    budgetRequested: number;
    budgetApproved: number;
    status: string;
}

export function ProjectRowActions({ projectName, organization, budgetRequested, budgetApproved, status }: ProjectRowActionsProps) {
    const handleDownload = () => {
        const data = { projectName, organization, budgetRequested, budgetApproved, status };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${projectName.slice(0, 40).replace(/[^\wก-๙]/g, "_")}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch {
            // clipboard not available
        }
    };

    return (
        <div className="flex gap-2 justify-end">
            <button
                onClick={handleDownload}
                className="text-[rgb(var(--ios-text-quaternary))] hover:text-[rgb(var(--ios-accent))] transition-colors"
                title="ดาวน์โหลดข้อมูล"
            >
                <Download className="w-[18px] h-[18px]" />
            </button>
            <button
                onClick={handleShare}
                className="text-[rgb(var(--ios-text-quaternary))] hover:text-[rgb(var(--ios-accent))] transition-colors"
                title="คัดลอกลิงก์"
            >
                <Share2 className="w-[18px] h-[18px]" />
            </button>
        </div>
    );
}
