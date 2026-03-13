import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/types";
import { getStatusLabel } from "@/lib/utils";

interface StatusBadgeProps {
    status: ProjectStatus | string;
    className?: string;
}

function getStatusVariant(status: string): "success" | "warning" | "destructive" | "secondary" {
    switch (status) {
        case "อนุมัติ":
            return "success";
        case "ตัดงบ":
            return "warning";
        case "ไม่อนุมัติ":
            return "destructive";
        case "รอพิจารณา":
        default:
            return "secondary";
    }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <Badge variant={getStatusVariant(status)} className={className}>
            {getStatusLabel(status)}
        </Badge>
    );
}

export { getStatusVariant };
