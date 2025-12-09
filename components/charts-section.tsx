"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/lib/types";
import { formatTHB } from "@/lib/utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface ChartsSectionProps {
    projects: Project[];
}

export function ChartsSection({ projects }: ChartsSectionProps) {
    // Process data for Pie Chart (Status)
    const statusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
    }));

    const COLORS = {
        'อนุมัติ': '#16a34a', // green-600
        'ตัดงบ': '#dc2626', // red-600
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
            <Card>
                <CardHeader>
                    <CardTitle>สัดส่วนสถานะโครงการ</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>เปรียบเทียบงบประมาณแยกตามองค์กร</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={barData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `฿${val / 1000}k`} />
                            <Tooltip formatter={(value: number) => formatTHB(value)} />
                            <Legend />
                            <Bar dataKey="requested" name="งบที่เสนอขอ" fill="#2563eb" radius={[4, 4, 0, 0]} /> {/* blue-600 */}
                            <Bar dataKey="approved" name="งบที่ได้รับ" fill="#16a34a" radius={[4, 4, 0, 0]} /> {/* green-600 */}
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
