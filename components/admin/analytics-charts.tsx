"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatTHB } from '@/lib/utils';
import {
    AnalyticsData,
    FiscalYearTrend,
    OrgPerformance,
    ActivityTypeBreakdown,
    Anomaly,
} from '@/lib/analytics-queries';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area,
} from 'recharts';
import {
    TrendingUp, TrendingDown, AlertTriangle, AlertOctagon,
    Building2, Target, FileBarChart, Download,
} from 'lucide-react';

// ============================================
// Color Palette
// ============================================

const COLORS = {
    accent: 'rgb(var(--ios-accent))',
    green: 'rgb(var(--ios-green))',
    red: 'rgb(var(--ios-red))',
    purple: 'rgb(var(--ios-purple))',
    orange: 'rgb(255 149 0)',
    gray: 'rgb(var(--ios-text-tertiary))',
};

const CHART_COLORS = [
    'rgb(var(--ios-accent))',
    'rgb(var(--ios-green))',
    'rgb(var(--ios-red))',
    'rgb(var(--ios-purple))',
    'rgb(255 149 0)',
    'rgb(88 86 214)',    // indigo
    'rgb(255 45 85)',    // pink
    'rgb(90 200 250)',   // teal
    'rgb(175 82 222)',   // violet
    'rgb(255 204 0)',    // yellow
];

// ============================================
// Shared Tooltip
// ============================================

function ChartTooltip({ active, payload, label, formatter }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-[var(--ios-radius-md)] border-0 shadow-lg bg-[rgb(var(--ios-bg-secondary))] p-3 text-sm max-w-[280px]">
            <p className="font-semibold text-[rgb(var(--ios-text-primary))] mb-2">{label}</p>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-4 py-0.5">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                        <span className="text-[rgb(var(--ios-text-secondary))]">{entry.name}</span>
                    </span>
                    <span className="font-mono font-medium text-[rgb(var(--ios-text-primary))]">
                        {formatter ? formatter(entry.value) : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ============================================
// Main Component
// ============================================

interface AnalyticsChartsProps {
    data: AnalyticsData;
    selectedYear?: number;
}

export function AnalyticsCharts({ data, selectedYear }: AnalyticsChartsProps) {
    const [activeSection, setActiveSection] = useState<string>('trends');

    const sections = [
        { id: 'trends', label: 'แนวโน้มงบประมาณ', icon: TrendingUp },
        { id: 'orgs', label: 'ผลงานองค์กร', icon: Building2 },
        { id: 'allocation', label: 'การจัดสรรงบ', icon: Target },
        { id: 'anomalies', label: 'ตรวจจับความผิดปกติ', icon: AlertTriangle },
    ];

    return (
        <div>
            {/* Section Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {sections.map((s) => {
                    const Icon = s.icon;
                    const isActive = activeSection === s.id;
                    return (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                                whitespace-nowrap transition-all ios-press
                                ${isActive
                                    ? 'bg-[rgb(var(--ios-accent))] text-white shadow-sm'
                                    : 'bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]/80'
                                }
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            {s.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {activeSection === 'trends' && <BudgetTrendsSection data={data} />}
            {activeSection === 'orgs' && <OrgPerformanceSection data={data} />}
            {activeSection === 'allocation' && <AllocationSection data={data} />}
            {activeSection === 'anomalies' && <AnomaliesSection data={data} />}
        </div>
    );
}

// ============================================
// 1. Budget Trend Analysis
// ============================================

function BudgetTrendsSection({ data }: { data: AnalyticsData }) {
    const trends = data.fiscalYearTrends;

    if (trends.length === 0) {
        return <EmptyState message="ไม่มีข้อมูลแนวโน้มงบประมาณ" />;
    }

    const latestTrend = trends[trends.length - 1];
    const previousTrend = trends.length > 1 ? trends[trends.length - 2] : null;

    const requestedChange = previousTrend
        ? ((latestTrend.total_requested - previousTrend.total_requested) / previousTrend.total_requested) * 100
        : 0;
    const approvalRateChange = previousTrend
        ? latestTrend.approval_rate - previousTrend.approval_rate
        : 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            {previousTrend && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <TrendCard
                        label="งบเสนอขอ"
                        value={formatTHB(latestTrend.total_requested)}
                        change={requestedChange}
                        suffix="%"
                    />
                    <TrendCard
                        label="งบอนุมัติ"
                        value={formatTHB(latestTrend.total_approved)}
                        change={previousTrend
                            ? ((latestTrend.total_approved - previousTrend.total_approved) / previousTrend.total_approved) * 100
                            : 0
                        }
                        suffix="%"
                    />
                    <TrendCard
                        label="อัตราอนุมัติ"
                        value={`${latestTrend.approval_rate.toFixed(1)}%`}
                        change={approvalRateChange}
                        suffix=" จุด"
                    />
                    <TrendCard
                        label="จำนวนโครงการ"
                        value={latestTrend.project_count.toString()}
                        change={previousTrend
                            ? ((latestTrend.project_count - previousTrend.project_count) / previousTrend.project_count) * 100
                            : 0
                        }
                        suffix="%"
                    />
                </div>
            )}

            {/* Budget Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>แนวโน้มงบประมาณรายปี</CardTitle>
                    <CardDescription>เปรียบเทียบงบเสนอขอ งบอนุมัติ และงบที่ถูกตัดข้ามปีงบประมาณ</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="gradRequested" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ios-separator))" />
                                <XAxis
                                    dataKey="fiscal_year"
                                    tick={{ fill: 'rgb(var(--ios-text-secondary))', fontSize: 12 }}
                                />
                                <YAxis
                                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                                    tick={{ fill: 'rgb(var(--ios-text-secondary))', fontSize: 12 }}
                                />
                                <Tooltip content={<ChartTooltip formatter={(v: number) => formatTHB(v)} />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="total_requested"
                                    name="งบเสนอขอ"
                                    stroke={COLORS.accent}
                                    fill="url(#gradRequested)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total_approved"
                                    name="งบอนุมัติ"
                                    stroke={COLORS.green}
                                    fill="url(#gradApproved)"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total_cut"
                                    name="งบที่ถูกตัด"
                                    stroke={COLORS.red}
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ r: 4 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Approval Rate Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>แนวโน้มอัตราอนุมัติ</CardTitle>
                    <CardDescription>อัตราส่วนงบอนุมัติต่องบเสนอขอในแต่ละปีงบประมาณ</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ios-separator))" />
                                <XAxis
                                    dataKey="fiscal_year"
                                    tick={{ fill: 'rgb(var(--ios-text-secondary))', fontSize: 12 }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tickFormatter={(v) => `${v}%`}
                                    tick={{ fill: 'rgb(var(--ios-text-secondary))', fontSize: 12 }}
                                />
                                <Tooltip
                                    content={<ChartTooltip formatter={(v: number) => `${v.toFixed(1)}%`} />}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="approval_rate"
                                    name="อัตราอนุมัติ"
                                    stroke={COLORS.purple}
                                    strokeWidth={3}
                                    dot={{ r: 5, fill: COLORS.purple }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Campus Comparison */}
            {data.campusBreakdown.length > 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>เปรียบเทียบศูนย์การศึกษา</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.campusBreakdown} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ios-separator))" />
                                    <XAxis
                                        dataKey="campus_label"
                                        tick={{ fill: 'rgb(var(--ios-text-secondary))', fontSize: 12 }}
                                    />
                                    <YAxis
                                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                        tick={{ fill: 'rgb(var(--ios-text-secondary))', fontSize: 12 }}
                                    />
                                    <Tooltip content={<ChartTooltip formatter={(v: number) => formatTHB(v)} />} />
                                    <Legend />
                                    <Bar dataKey="total_requested" name="งบเสนอขอ" fill={COLORS.accent} radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="total_approved" name="งบอนุมัติ" fill={COLORS.green} radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// ============================================
// 2. Organization Performance
// ============================================

function OrgPerformanceSection({ data }: { data: AnalyticsData }) {
    const [sortBy, setSortBy] = useState<'approved' | 'ratio' | 'count'>('approved');
    const orgs = data.orgPerformance;

    if (orgs.length === 0) {
        return <EmptyState message="ไม่มีข้อมูลองค์กร" />;
    }

    const sortedOrgs = useMemo(() => {
        const sorted = [...orgs];
        switch (sortBy) {
            case 'approved': sorted.sort((a, b) => b.total_approved - a.total_approved); break;
            case 'ratio': sorted.sort((a, b) => b.approval_ratio - a.approval_ratio); break;
            case 'count': sorted.sort((a, b) => b.project_count - a.project_count); break;
        }
        return sorted;
    }, [orgs, sortBy]);

    const top10 = sortedOrgs.slice(0, 10);

    // Approval ratio chart data
    const ratioData = top10.map(o => ({
        name: truncateLabel(o.organization),
        fullName: o.organization,
        ratio: Math.round(o.approval_ratio * 10) / 10,
        requested: o.total_requested,
        approved: o.total_approved,
    }));

    return (
        <div className="space-y-6">
            {/* Sort Controls */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-[rgb(var(--ios-text-secondary))]">เรียงตาม:</span>
                {[
                    { key: 'approved', label: 'งบอนุมัติ' },
                    { key: 'ratio', label: 'อัตราอนุมัติ' },
                    { key: 'count', label: 'จำนวนโครงการ' },
                ].map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => setSortBy(opt.key as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ios-press ${
                            sortBy === opt.key
                                ? 'bg-[rgb(var(--ios-accent))]/15 text-[rgb(var(--ios-accent))]'
                                : 'bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-tertiary))]'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Org Ranking Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>10 อันดับองค์กร</CardTitle>
                    <CardDescription>
                        {sortBy === 'approved' && 'เรียงตามงบอนุมัติสูงสุด'}
                        {sortBy === 'ratio' && 'เรียงตามอัตราอนุมัติสูงสุด'}
                        {sortBy === 'count' && 'เรียงตามจำนวนโครงการมากสุด'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={ratioData}
                                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgb(var(--ios-separator))" />
                                <XAxis
                                    type="number"
                                    tickFormatter={(v) => sortBy === 'ratio' ? `${v}%` : `฿${(v / 1000).toFixed(0)}k`}
                                    tick={{ fill: 'rgb(var(--ios-text-secondary))', fontSize: 11 }}
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={130}
                                    tick={{ fontSize: 11, fill: 'rgb(var(--ios-text-secondary))' }}
                                />
                                <Tooltip
                                    content={({ active, payload }: any) => {
                                        if (!active || !payload?.length) return null;
                                        const d = payload[0].payload;
                                        return (
                                            <div className="rounded-[var(--ios-radius-md)] border-0 shadow-lg bg-[rgb(var(--ios-bg-secondary))] p-3 text-sm max-w-[260px]">
                                                <p className="font-semibold text-[rgb(var(--ios-text-primary))] mb-2">{d.fullName}</p>
                                                <div className="space-y-1 text-[rgb(var(--ios-text-secondary))]">
                                                    <p>งบเสนอขอ: <span className="font-mono text-[rgb(var(--ios-text-primary))]">{formatTHB(d.requested)}</span></p>
                                                    <p>งบอนุมัติ: <span className="font-mono text-[rgb(var(--ios-green))]">{formatTHB(d.approved)}</span></p>
                                                    <p>อัตราอนุมัติ: <span className="font-mono text-[rgb(var(--ios-accent))]">{d.ratio}%</span></p>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                {sortBy === 'ratio' ? (
                                    <Bar dataKey="ratio" name="อัตราอนุมัติ (%)" fill={COLORS.purple} radius={[0, 6, 6, 0]} barSize={20} />
                                ) : sortBy === 'count' ? (
                                    <>
                                        <Bar dataKey="requested" name="งบเสนอขอ" fill={COLORS.accent} radius={[0, 6, 6, 0]} barSize={16} />
                                        <Bar dataKey="approved" name="งบอนุมัติ" fill={COLORS.green} radius={[0, 6, 6, 0]} barSize={16} />
                                    </>
                                ) : (
                                    <>
                                        <Bar dataKey="requested" name="งบเสนอขอ" fill={COLORS.accent} radius={[0, 6, 6, 0]} barSize={16} />
                                        <Bar dataKey="approved" name="งบอนุมัติ" fill={COLORS.green} radius={[0, 6, 6, 0]} barSize={16} />
                                    </>
                                )}
                                <Legend />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Org Table */}
            <Card>
                <CardHeader>
                    <CardTitle>รายละเอียดผลงานองค์กร</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[rgb(var(--ios-separator))]/50">
                                    <th className="text-left py-3 px-3 text-[rgb(var(--ios-text-tertiary))] font-medium">#</th>
                                    <th className="text-left py-3 px-3 text-[rgb(var(--ios-text-tertiary))] font-medium">องค์กร</th>
                                    <th className="text-right py-3 px-3 text-[rgb(var(--ios-text-tertiary))] font-medium">โครงการ</th>
                                    <th className="text-right py-3 px-3 text-[rgb(var(--ios-text-tertiary))] font-medium">งบเสนอขอ</th>
                                    <th className="text-right py-3 px-3 text-[rgb(var(--ios-text-tertiary))] font-medium">งบอนุมัติ</th>
                                    <th className="text-right py-3 px-3 text-[rgb(var(--ios-text-tertiary))] font-medium">อัตราอนุมัติ</th>
                                    <th className="text-right py-3 px-3 text-[rgb(var(--ios-text-tertiary))] font-medium">ถูกตัดเฉลี่ย</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedOrgs.slice(0, 20).map((org, i) => (
                                    <tr key={org.organization} className="border-b border-[rgb(var(--ios-separator))]/20 hover:bg-[rgb(var(--ios-fill-tertiary))]/50">
                                        <td className="py-2.5 px-3 text-[rgb(var(--ios-text-tertiary))] font-mono">{i + 1}</td>
                                        <td className="py-2.5 px-3 text-[rgb(var(--ios-text-primary))] font-medium max-w-[200px] truncate">{org.organization}</td>
                                        <td className="py-2.5 px-3 text-right font-mono text-[rgb(var(--ios-text-secondary))]">{org.project_count}</td>
                                        <td className="py-2.5 px-3 text-right font-mono text-[rgb(var(--ios-text-secondary))]">{formatTHB(org.total_requested)}</td>
                                        <td className="py-2.5 px-3 text-right font-mono text-[rgb(var(--ios-green))]">{formatTHB(org.total_approved)}</td>
                                        <td className="py-2.5 px-3 text-right">
                                            <span className={`font-mono ${org.approval_ratio >= 80 ? 'text-[rgb(var(--ios-green))]' : org.approval_ratio >= 50 ? 'text-[rgb(var(--ios-accent))]' : 'text-[rgb(var(--ios-red))]'}`}>
                                                {org.approval_ratio.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono text-[rgb(var(--ios-red))]">
                                            {org.avg_cut_percentage > 0 ? `-${org.avg_cut_percentage.toFixed(1)}%` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ============================================
// 3. Budget Allocation Insights
// ============================================

function AllocationSection({ data }: { data: AnalyticsData }) {
    const activityTypes = data.activityTypes;
    const sdgBreakdown = data.sdgBreakdown;

    return (
        <div className="space-y-6">
            {/* Activity Type Pie */}
            {activityTypes.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>สัดส่วนงบตามประเภทกิจกรรม</CardTitle>
                            <CardDescription>งบอนุมัติแยกตามประเภทของกิจกรรม</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={activityTypes as any[]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={3}
                                            dataKey="total_approved"
                                            nameKey="activity_type"
                                        >
                                            {activityTypes.map((_, i) => (
                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }: any) => {
                                                if (!active || !payload?.length) return null;
                                                const d = payload[0].payload;
                                                const total = activityTypes.reduce((s, a) => s + a.total_approved, 0);
                                                return (
                                                    <div className="rounded-[var(--ios-radius-md)] border-0 shadow-lg bg-[rgb(var(--ios-bg-secondary))] p-3 text-sm">
                                                        <p className="font-semibold text-[rgb(var(--ios-text-primary))] mb-1">{d.activity_type}</p>
                                                        <p className="text-[rgb(var(--ios-text-secondary))]">{d.project_count} โครงการ</p>
                                                        <p className="font-mono text-[rgb(var(--ios-green))]">{formatTHB(d.total_approved)}</p>
                                                        <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                                                            {total > 0 ? ((d.total_approved / total) * 100).toFixed(1) : 0}% ของทั้งหมด
                                                        </p>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Type Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>รายละเอียดประเภทกิจกรรม</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {activityTypes.map((at, i) => {
                                    const total = activityTypes.reduce((s, a) => s + a.total_approved, 0);
                                    const pct = total > 0 ? (at.total_approved / total) * 100 : 0;
                                    return (
                                        <div key={at.activity_type} className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-[rgb(var(--ios-text-primary))] truncate font-medium">{at.activity_type}</span>
                                                    <span className="text-xs font-mono text-[rgb(var(--ios-text-secondary))] ml-2">{pct.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-2 bg-[rgb(var(--ios-fill-tertiary))] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                                                    />
                                                </div>
                                                <div className="flex justify-between mt-1">
                                                    <span className="text-xs text-[rgb(var(--ios-text-tertiary))]">{at.project_count} โครงการ</span>
                                                    <span className="text-xs font-mono text-[rgb(var(--ios-text-tertiary))]">{formatTHB(at.total_approved)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* SDG Goals */}
            {sdgBreakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>งบประมาณตาม SDG Goals</CardTitle>
                        <CardDescription>เป้าหมายการพัฒนาที่ยั่งยืนที่ได้รับงบมากที่สุด</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sdgBreakdown.slice(0, 12)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ios-separator))" />
                                    <XAxis
                                        dataKey="sdg_goal"
                                        tick={{ fill: 'rgb(var(--ios-text-secondary))', fontSize: 10 }}
                                        interval={0}
                                        angle={-30}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis
                                        tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`}
                                        tick={{ fill: 'rgb(var(--ios-text-secondary))', fontSize: 12 }}
                                    />
                                    <Tooltip content={<ChartTooltip formatter={(v: number) => formatTHB(v)} />} />
                                    <Bar dataKey="total_approved" name="งบอนุมัติ" fill={COLORS.green} radius={[6, 6, 0, 0]}>
                                        {sdgBreakdown.slice(0, 12).map((_, i) => (
                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Complaint Summary */}
            {data.complaintSummary.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>สรุปเรื่องร้องเรียน/แจ้งแก้ไข</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {data.complaintSummary.map((cs) => {
                                const statusConfig: Record<string, { label: string; color: string }> = {
                                    pending: { label: 'รอดำเนินการ', color: 'rgb(255 149 0)' },
                                    acknowledged: { label: 'รับทราบแล้ว', color: 'rgb(var(--ios-accent))' },
                                    resolved: { label: 'แก้ไขแล้ว', color: 'rgb(var(--ios-green))' },
                                    ignored: { label: 'ไม่ดำเนินการ', color: 'rgb(var(--ios-text-tertiary))' },
                                };
                                const config = statusConfig[cs.status] || { label: cs.status, color: 'rgb(var(--ios-text-tertiary))' };
                                return (
                                    <div key={cs.status} className="text-center p-4 bg-[rgb(var(--ios-fill-tertiary))]/50 rounded-[var(--ios-radius)]">
                                        <div className="text-2xl font-bold font-mono" style={{ color: config.color }}>{cs.count}</div>
                                        <div className="text-xs text-[rgb(var(--ios-text-secondary))] mt-1">{config.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// ============================================
// 4. Anomaly Detection
// ============================================

function AnomaliesSection({ data }: { data: AnalyticsData }) {
    const anomalies = data.anomalies;

    if (anomalies.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[rgb(var(--ios-green))]/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-[rgb(var(--ios-green))]" />
                    </div>
                    <p className="text-[rgb(var(--ios-text-primary))] font-medium">ไม่พบความผิดปกติ</p>
                    <p className="text-sm text-[rgb(var(--ios-text-tertiary))] mt-1">ข้อมูลงบประมาณอยู่ในเกณฑ์ปกติ</p>
                </CardContent>
            </Card>
        );
    }

    const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
    const warningCount = anomalies.filter(a => a.severity === 'warning').length;

    const groupedAnomalies = {
        high_cut: anomalies.filter(a => a.type === 'high_cut'),
        zero_approved: anomalies.filter(a => a.type === 'zero_approved'),
        repeat_submission: anomalies.filter(a => a.type === 'repeat_submission'),
    };

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-[rgb(var(--ios-red))]/5 border border-[rgb(var(--ios-red))]/20 rounded-[var(--ios-radius)]">
                    <AlertOctagon className="w-8 h-8 text-[rgb(var(--ios-red))]" />
                    <div>
                        <div className="text-2xl font-bold text-[rgb(var(--ios-red))]">{criticalCount}</div>
                        <div className="text-xs text-[rgb(var(--ios-text-secondary))]">ความผิดปกติร้ายแรง</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[rgb(255,149,0)]/5 border border-[rgb(255,149,0)]/20 rounded-[var(--ios-radius)]">
                    <AlertTriangle className="w-8 h-8 text-[rgb(255,149,0)]" />
                    <div>
                        <div className="text-2xl font-bold text-[rgb(255,149,0)]">{warningCount}</div>
                        <div className="text-xs text-[rgb(var(--ios-text-secondary))]">ข้อสังเกต</div>
                    </div>
                </div>
            </div>

            {/* High Cut Projects */}
            {groupedAnomalies.high_cut.length > 0 && (
                <AnomalyGroup
                    title="โครงการที่ถูกตัดงบสูงผิดปกติ"
                    description="งบถูกตัดมากกว่า 50% และเกินค่าเฉลี่ย 1.5 เท่า"
                    anomalies={groupedAnomalies.high_cut}
                />
            )}

            {/* Zero Approved */}
            {groupedAnomalies.zero_approved.length > 0 && (
                <AnomalyGroup
                    title="โครงการที่ไม่ได้รับอนุมัติเลย"
                    description="เสนอของบแต่ไม่ได้รับอนุมัติแม้แต่บาทเดียว"
                    anomalies={groupedAnomalies.zero_approved}
                />
            )}

            {/* Repeat Submissions */}
            {groupedAnomalies.repeat_submission.length > 0 && (
                <AnomalyGroup
                    title="องค์กรที่ส่งโครงการจำนวนมาก"
                    description="จำนวนโครงการเกินค่าเฉลี่ย 2.5 เท่า"
                    anomalies={groupedAnomalies.repeat_submission}
                />
            )}
        </div>
    );
}

function AnomalyGroup({ title, description, anomalies }: { title: string; description: string; anomalies: Anomaly[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="divide-y divide-[rgb(var(--ios-separator))]/30">
                    {anomalies.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 py-3">
                            {a.severity === 'critical' ? (
                                <AlertOctagon className="w-5 h-5 text-[rgb(var(--ios-red))] flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-[rgb(255,149,0)] flex-shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0 flex-1">
                                {a.project_name && (
                                    <p className="text-sm font-medium text-[rgb(var(--ios-text-primary))] truncate">
                                        {a.project_name}
                                    </p>
                                )}
                                {a.organization && (
                                    <p className="text-xs text-[rgb(var(--ios-text-secondary))]">
                                        {a.organization}
                                    </p>
                                )}
                                <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-0.5">
                                    {a.message}
                                </p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                a.severity === 'critical'
                                    ? 'bg-[rgb(var(--ios-red))]/10 text-[rgb(var(--ios-red))]'
                                    : 'bg-[rgb(255,149,0)]/10 text-[rgb(255,149,0)]'
                            }`}>
                                {a.severity === 'critical' ? 'ร้ายแรง' : 'สังเกต'}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================
// Helpers
// ============================================

function TrendCard({ label, value, change, suffix }: { label: string; value: string; change: number; suffix: string }) {
    const isPositive = change >= 0;
    return (
        <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 p-4">
            <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mb-1">{label}</p>
            <p className="text-lg font-bold text-[rgb(var(--ios-text-primary))] mb-1">{value}</p>
            <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-[rgb(var(--ios-green))]' : 'text-[rgb(var(--ios-red))]'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{isPositive ? '+' : ''}{change.toFixed(1)}{suffix} จากปีก่อน</span>
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <Card>
            <CardContent className="py-12 text-center">
                <FileBarChart className="w-12 h-12 mx-auto mb-4 text-[rgb(var(--ios-text-tertiary))]" />
                <p className="text-[rgb(var(--ios-text-secondary))]">{message}</p>
            </CardContent>
        </Card>
    );
}

function truncateLabel(label: string, maxLen = 18) {
    return label.length > maxLen ? label.slice(0, maxLen) + '...' : label;
}

// ============================================
// Export Button Component
// ============================================

export function ExportButton({ data }: { data: AnalyticsData }) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            // Build CSV content
            const lines: string[] = [];

            // Section 1: Fiscal Year Trends
            lines.push('=== แนวโน้มงบประมาณรายปี ===');
            lines.push('ปีงบประมาณ,งบเสนอขอ,งบอนุมัติ,งบถูกตัด,จำนวนโครงการ,อัตราอนุมัติ (%)');
            for (const t of data.fiscalYearTrends) {
                lines.push(`${t.fiscal_year},${t.total_requested},${t.total_approved},${t.total_cut},${t.project_count},${t.approval_rate.toFixed(1)}`);
            }

            lines.push('');
            lines.push('=== ผลงานองค์กร ===');
            lines.push('องค์กร,จำนวนโครงการ,งบเสนอขอ,งบอนุมัติ,อัตราอนุมัติ (%),ถูกตัดเฉลี่ย (%)');
            for (const o of data.orgPerformance) {
                lines.push(`"${o.organization}",${o.project_count},${o.total_requested},${o.total_approved},${o.approval_ratio.toFixed(1)},${o.avg_cut_percentage.toFixed(1)}`);
            }

            lines.push('');
            lines.push('=== ประเภทกิจกรรม ===');
            lines.push('ประเภท,จำนวนโครงการ,งบเสนอขอ,งบอนุมัติ');
            for (const a of data.activityTypes) {
                lines.push(`"${a.activity_type}",${a.project_count},${a.total_requested},${a.total_approved}`);
            }

            if (data.sdgBreakdown.length > 0) {
                lines.push('');
                lines.push('=== SDG Goals ===');
                lines.push('SDG,จำนวนโครงการ,งบอนุมัติ');
                for (const s of data.sdgBreakdown) {
                    lines.push(`"${s.sdg_goal}",${s.project_count},${s.total_approved}`);
                }
            }

            if (data.anomalies.length > 0) {
                lines.push('');
                lines.push('=== ความผิดปกติ ===');
                lines.push('ประเภท,ระดับ,โครงการ,องค์กร,รายละเอียด');
                for (const a of data.anomalies) {
                    lines.push(`${a.type},${a.severity},"${a.project_name || ''}","${a.organization || ''}","${a.message}"`);
                }
            }

            // BOM for Thai encoding support in Excel
            const BOM = '\uFEFF';
            const csvContent = BOM + lines.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white text-sm font-medium hover:opacity-90 transition-opacity ios-press disabled:opacity-50"
        >
            <Download className="w-4 h-4" />
            {exporting ? 'กำลังส่งออก...' : 'ส่งออก CSV'}
        </button>
    );
}
