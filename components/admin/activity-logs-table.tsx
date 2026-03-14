"use client";

import { useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Search, ChevronDown, ChevronUp, FileText, Plus, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface ActivityLog {
    id: number;
    user_email: string;
    action: string;
    entity_type: string;
    entity_id: string;
    entity_name: string;
    details: any;
    created_at: string;
}

interface ActivityLogsTableProps {
    logs: ActivityLog[];
}

export function ActivityLogsTable({ logs }: ActivityLogsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [filterEntity, setFilterEntity] = useState('all');
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const toggleRow = (id: number) => {
        setExpandedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.entity_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === 'all' || log.action === filterAction;
        const matchesEntity = filterEntity === 'all' || log.entity_type === filterEntity;
        return matchesSearch && matchesAction && matchesEntity;
    });

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'create': return <Plus className="w-4 h-4 text-[rgb(var(--ios-green))]" />;
            case 'update': return <Edit2 className="w-4 h-4 text-[rgb(var(--ios-orange))]" />;
            case 'delete': return <Trash2 className="w-4 h-4 text-[rgb(var(--ios-red))]" />;
            default: return <FileText className="w-4 h-4 text-[rgb(var(--ios-text-tertiary))]" />;
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'create': return 'สร้าง';
            case 'update': return 'แก้ไข';
            case 'delete': return 'ลบ';
            default: return action;
        }
    };

    const getEntityBadge = (type: string) => {
        switch (type) {
            case 'project':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] border border-[rgb(var(--ios-accent))]/20">โครงการ</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-tertiary))] border border-[rgb(var(--ios-separator))]/50">{type}</span>;
        }
    };

    const selectCls = "text-sm border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-sm)] px-2.5 py-2 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--ios-accent))]";

    return (
        <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden">
            {/* Controls */}
            <div className="px-4 py-3 border-b border-[rgb(var(--ios-separator))]/30 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-2.5 top-2.5 text-[rgb(var(--ios-text-tertiary))] w-4 h-4" />
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยอีเมล หรือ ชื่อข้อมูล..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))] placeholder:text-[rgb(var(--ios-text-tertiary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--ios-accent))]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select className={selectCls} value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
                        <option value="all">ทุกการกระทำ</option>
                        <option value="create">สร้าง</option>
                        <option value="update">แก้ไข</option>
                        <option value="delete">ลบ</option>
                    </select>
                    <select className={selectCls} value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)}>
                        <option value="all">ทุกประเภท</option>
                        <option value="project">โครงการ</option>
                        <option value="file">ไฟล์</option>
                        <option value="complaint">ข้อร้องเรียน</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b border-[rgb(var(--ios-separator))]/30 text-xs uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))]">
                            <th className="px-4 py-3 font-semibold w-44">เวลา</th>
                            <th className="px-4 py-3 font-semibold w-56">ผู้ใช้งาน</th>
                            <th className="px-4 py-3 font-semibold w-28">การกระทำ</th>
                            <th className="px-4 py-3 font-semibold w-28">ประเภท</th>
                            <th className="px-4 py-3 font-semibold">ข้อมูล</th>
                            <th className="px-4 py-3 font-semibold w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgb(var(--ios-separator))]/20">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-[rgb(var(--ios-text-tertiary))]">
                                    ไม่พบข้อมูลประวัติการใช้งาน
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <>
                                    <tr
                                        key={log.id}
                                        className={cn(
                                            "hover:bg-[rgb(var(--ios-fill-tertiary))]/50 transition-colors cursor-pointer",
                                            expandedRows.includes(log.id) && "bg-[rgb(var(--ios-fill-tertiary))]/30"
                                        )}
                                        onClick={() => toggleRow(log.id)}
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap text-[rgb(var(--ios-text-secondary))]">
                                            {format(new Date(log.created_at), "d MMM yyyy HH:mm", { locale: th })}
                                        </td>
                                        <td className="px-4 py-3 truncate max-w-[200px] text-[rgb(var(--ios-text-secondary))]" title={log.user_email}>
                                            {log.user_email}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                                                {getActionIcon(log.action)}
                                                <span className="text-xs font-medium">{getActionLabel(log.action)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getEntityBadge(log.entity_type)}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-[rgb(var(--ios-text-primary))] truncate max-w-[300px]">
                                            {log.entity_name}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {expandedRows.includes(log.id) ? (
                                                <ChevronUp className="w-4 h-4 text-[rgb(var(--ios-text-tertiary))] ml-auto" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-[rgb(var(--ios-text-tertiary))] ml-auto" />
                                            )}
                                        </td>
                                    </tr>
                                    {expandedRows.includes(log.id) && (
                                        <tr className="bg-[rgb(var(--ios-fill-tertiary))]/20">
                                            <td colSpan={6} className="px-4 py-4 pl-12">
                                                <div className="bg-[rgb(var(--ios-bg-primary))] border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-md)] p-4 font-mono text-xs text-[rgb(var(--ios-text-secondary))] overflow-x-auto">
                                                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {filteredLogs.length > 0 && (
                <div className="px-4 py-3 border-t border-[rgb(var(--ios-separator))]/30 text-xs text-[rgb(var(--ios-text-tertiary))]">
                    แสดง {filteredLogs.length} จาก {logs.length} รายการ — คลิกที่แถวเพื่อดูรายละเอียด
                </div>
            )}
        </div>
    );
}
