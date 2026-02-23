"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/lib/types";
import { formatTHB, getStatusLabel } from "@/lib/utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface ChartsSectionProps {
    projects: Project[];
}

export function ChartsSection({ projects }: ChartsSectionProps) {
    // Process data for Pie Chart (Status)
    const statusCounts = projects.reduce((acc, project) => {
        const label = getStatusLabel(project.status);
        acc[label] = (acc[label] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
    }));

    // iOS-style colors
    const COLORS = {
        'อนุมัติเต็มจำนวน': 'rgb(52 199 89)',   // iOS green
        'ตัดงบบางส่วน': 'rgb(255 59 48)',      // iOS red
        'ไม่อนุมัติ': 'rgb(142 142 147)',       // iOS gray
        'รอพิจารณา': 'rgb(255 149 0)',         // iOS orange
    };

    // Process data for Bar Chart (By Organization)
    const orgStats = projects.reduce((acc, project) => {
        if (!acc[project.organization]) {
            acc[project.organization] = { name: project.organization, requested: 0, approved: 0 };
        }
        acc[project.organization].requested += Number(project.budget_requested);
        acc[project.organization].approved += Number(project.budget_approved);
        return acc;
    }, {} as Record<string, any>);

    const barData = Object.values(orgStats).sort((a: any, b: any) => b.requested - a.requested);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>สัดส่วนสถานะโครงการ</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 'var(--ios-radius-md)',
                                        border: 'none',
                                        boxShadow: 'var(--ios-shadow-lg)',
                                        background: 'rgb(var(--ios-bg-secondary))',
                                        color: 'rgb(var(--ios-text-primary))'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary Statistics */}
                    <div className="mt-6 pt-6 border-t border-[rgb(var(--ios-separator))] space-y-4">
                        <h4 className="text-xs font-semibold text-[rgb(var(--ios-text-tertiary))] uppercase tracking-wide">สรุปผลการอนุมัติ</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[rgb(var(--ios-green))]/10 rounded-[var(--ios-radius-md)] p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--ios-green))]"></div>
                                    <span className="text-sm text-[rgb(var(--ios-green))] font-medium">อนุมัติเต็มจำนวน</span>
                                </div>
                                <div className="text-2xl font-bold text-[rgb(var(--ios-green))]">
                                    {statusCounts['อนุมัติเต็มจำนวน'] || 0} <span className="text-base font-normal">โครงการ</span>
                                </div>
                                <div className="text-sm text-[rgb(var(--ios-green))]/80 mt-1">
                                    {projects.length > 0 ? ((statusCounts['อนุมัติเต็มจำนวน'] || 0) / projects.length * 100).toFixed(1) : 0}% ของทั้งหมด
                                </div>
                            </div>
                            <div className="bg-[rgb(var(--ios-red))]/10 rounded-[var(--ios-radius-md)] p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--ios-red))]"></div>
                                    <span className="text-sm text-[rgb(var(--ios-red))] font-medium">ตัดงบบางส่วน</span>
                                </div>
                                <div className="text-2xl font-bold text-[rgb(var(--ios-red))]">
                                    {statusCounts['ตัดงบบางส่วน'] || 0} <span className="text-base font-normal">โครงการ</span>
                                </div>
                                <div className="text-sm text-[rgb(var(--ios-red))]/80 mt-1">
                                    {projects.length > 0 ? ((statusCounts['ตัดงบบางส่วน'] || 0) / projects.length * 100).toFixed(1) : 0}% ของทั้งหมด
                                </div>
                            </div>
                        </div>
                        <div className="text-center text-sm text-[rgb(var(--ios-text-secondary))] pt-2">
                            จากโครงการทั้งหมด <span className="font-semibold text-[rgb(var(--ios-text-primary))]">{projects.length}</span> โครงการ
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>10 อันดับองค์กรที่เสนองบประมาณสูงสุด</CardTitle>
                </CardHeader>
                <CardContent className="h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={barData.slice(0, 10)}
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgb(var(--ios-separator))" />
                            <XAxis
                                type="number"
                                tickFormatter={(val) => `฿${val / 1000}k`}
                                tick={{ fill: 'rgb(var(--ios-text-secondary))' }}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={120}
                                tick={{ fontSize: 11, fill: 'rgb(var(--ios-text-secondary))' }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgb(var(--ios-fill-tertiary))' }}
                                contentStyle={{
                                    borderRadius: 'var(--ios-radius-md)',
                                    border: 'none',
                                    boxShadow: 'var(--ios-shadow-lg)',
                                    background: 'rgb(var(--ios-bg-secondary))',
                                    color: 'rgb(var(--ios-text-primary))'
                                }}
                                formatter={(value: number) => formatTHB(value)}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar
                                dataKey="requested"
                                name="งบที่เสนอขอ"
                                fill="rgb(var(--ios-accent))"
                                radius={[0, 6, 6, 0]}
                                barSize={18}
                            />
                            <Bar
                                dataKey="approved"
                                name="งบที่ได้รับ"
                                fill="rgb(var(--ios-green))"
                                radius={[0, 6, 6, 0]}
                                barSize={18}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
