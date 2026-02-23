import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTHB } from "@/lib/utils";
import { DashboardStats } from "@/lib/types";
import { Wallet, CheckCircle2, Scissors, Percent } from "lucide-react";

interface StatsSectionProps {
    stats: DashboardStats;
}

export function StatsSection({ stats }: StatsSectionProps) {
    const statCards = [
        {
            title: "งบเสนอขอทั้งหมด",
            value: formatTHB(stats.totalRequested),
            description: "จากทุกองค์กรในปีนี้",
            icon: Wallet,
            iconColor: "text-[rgb(var(--ios-accent))]",
            iconBg: "bg-[rgb(var(--ios-accent))]/10",
        },
        {
            title: "งบอนุมัติแล้ว",
            value: formatTHB(stats.totalApproved),
            description: "เงินที่สามารถเบิกจ่ายได้จริง",
            icon: CheckCircle2,
            iconColor: "text-[rgb(var(--ios-green))]",
            iconBg: "bg-[rgb(var(--ios-green))]/10",
            valueColor: "text-[rgb(var(--ios-green))]",
        },
        {
            title: "ถูกตัดงบประมาณ",
            value: formatTHB(stats.totalCut),
            description: "ส่วนต่างที่ถูกตัดออก",
            icon: Scissors,
            iconColor: "text-[rgb(var(--ios-red))]",
            iconBg: "bg-[rgb(var(--ios-red))]/10",
            valueColor: "text-[rgb(var(--ios-red))]",
        },
        {
            title: "อัตราการอนุมัติ",
            value: `${stats.approvalRate.toFixed(1)}%`,
            description: "เทียบกับยอดที่เสนอขอ",
            icon: Percent,
            iconColor: "text-[rgb(var(--ios-orange))]",
            iconBg: "bg-[rgb(var(--ios-orange))]/10",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-[rgb(var(--ios-text-secondary))]">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-[var(--ios-radius-sm)] ${stat.iconBg}`}>
                            <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stat.valueColor || 'text-[rgb(var(--ios-text-primary))]'}`}>
                            {stat.value}
                        </div>
                        <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-1">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
