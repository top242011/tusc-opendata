"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ReportIssueModal } from "@/components/report-issue-modal";

interface ReportButtonProps {
    projectId: number;
    projectName: string;
}

export function ReportButton({ projectId, projectName }: ReportButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="flex justify-center pb-8">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-full font-medium transition-colors border border-red-200 shadow-sm"
                >
                    <AlertTriangle className="w-4 h-4" />
                    แจ้งแก้ไขข้อมูล / รายงานปัญหา
                </button>
            </div>

            <ReportIssueModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projectId={projectId}
                projectName={projectName}
            />
        </>
    );
}
