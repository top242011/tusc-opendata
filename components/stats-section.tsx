import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTHB } from "@/lib/utils";
import { DashboardStats } from "@/lib/types";
import { Wallet, CheckCircle2, Scissors, Percent } from "lucide-react";

interface StatsSectionProps {
    stats: DashboardStats;
}

export function StatsSection({ stats }: StatsSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        งบเสนอขอทั้งหมด
                    </CardTitle>
                    <Wallet className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatTHB(stats.totalRequested)}</div>
                    <p className="text-xs text-muted-foreground">จากทุกองค์กรในปีนี้</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        งบอนุมัติแล้ว
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-700">{formatTHB(stats.totalApproved)}</div>
                    <p className="text-xs text-muted-foreground">เงินที่สามารถเบิกจ่ายได้จริง</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        ถูกตัดงบประมาณ
                    </CardTitle>
                    <Scissors className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{formatTHB(stats.totalCut)}</div>
                    <p className="text-xs text-muted-foreground">ส่วนต่างที่ถูกตัดออก</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        อัตราการอนุมัติ
                    </CardTitle>
                    <Percent className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">เทียบกับยอดที่เสนอขอ</p>
                </CardContent>
            </Card>
        </div>
    );
}
