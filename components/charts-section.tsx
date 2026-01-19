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

    const COLORS = {
        'อนุมัติเต็มจำนวน': '#16a34a', // green-600
        'ตัดงบบางส่วน': '#dc2626', // red-600
        'ไม่อนุมัติ': '#52525b', // zinc-600
        'รอพิจารณา': '#f97316', // orange-500
    };

    // Process data for Bar Chart (By Organization)
    // Aggregate budget by organization
    const orgStats = projects.reduce((acc, project) => {
        if (!acc[project.organization]) {
            acc[project.organization] = { name: project.organization, requested: 0, approved: 0 };
        }
        acc[project.organization].requested += Number(project.budget_requested);
        acc[project.organization].approved += Number(project.budget_approved);
        return acc;
    }, {} as Record<string, any>);

    const barData = Object.values(orgStats).sort((a: any, b: any) => b.requested - a.requested); // Sort by requested desc

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary Statistics */}
                    <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">สรุปผลการอนุมัติ</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                                    <span className="text-sm text-green-700 font-medium">อนุมัติเต็มจำนวน</span>
                                </div>
                                <div className="text-2xl font-bold text-green-700">
                                    {statusCounts['อนุมัติเต็มจำนวน'] || 0} <span className="text-base font-normal">โครงการ</span>
                                </div>
                                <div className="text-sm text-green-600 mt-1">
                                    {projects.length > 0 ? ((statusCounts['อนุมัติเต็มจำนวน'] || 0) / projects.length * 100).toFixed(1) : 0}% ของทั้งหมด
                                </div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
                                    <span className="text-sm text-red-700 font-medium">ตัดงบบางส่วน</span>
                                </div>
                                <div className="text-2xl font-bold text-red-700">
                                    {statusCounts['ตัดงบบางส่วน'] || 0} <span className="text-base font-normal">โครงการ</span>
                                </div>
                                <div className="text-sm text-red-600 mt-1">
                                    {projects.length > 0 ? ((statusCounts['ตัดงบบางส่วน'] || 0) / projects.length * 100).toFixed(1) : 0}% ของทั้งหมด
                                </div>
                            </div>
                        </div>
                        <div className="text-center text-sm text-slate-500 pt-2">
                            จากโครงการทั้งหมด <span className="font-semibold text-slate-700">{projects.length}</span> โครงการ
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>10 อันดับองค์กรที่เสนของบประมาณสูงสุด</CardTitle>
                </CardHeader>
                <CardContent className="h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={barData.slice(0, 10)}
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" tickFormatter={(val) => `฿${val / 1000}k`} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={120}
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => formatTHB(value)}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="requested" name="งบที่เสนอขอ" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} />
                            <Bar dataKey="approved" name="งบที่ได้รับ" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
