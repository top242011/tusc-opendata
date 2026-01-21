"use client";

import { useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Search, Filter, ChevronDown, ChevronUp, FileText, Plus, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
            case 'create': return <Plus className="w-4 h-4 text-green-600" />;
            case 'update': return <Edit2 className="w-4 h-4 text-yellow-600" />;
            case 'delete': return <Trash2 className="w-4 h-4 text-red-600" />;
            default: return <FileText className="w-4 h-4 text-slate-500" />;
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
            case 'project': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">โครงการ</Badge>;
            default: return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Controls */}
            <div className="p-4 border-b bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยอีเมล หรือ ชื่อข้อมูล..."
                        className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select
                        className="text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                    >
                        <option value="all">ทุกการกระทำ</option>
                        <option value="create">สร้าง</option>
                        <option value="update">แก้ไข</option>
                        <option value="delete">ลบ</option>
                    </select>

                    <select
                        className="text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={filterEntity}
                        onChange={(e) => setFilterEntity(e.target.value)}
                    >
                        <option value="all">ทุกประเภท</option>
                        <option value="project">โครงการ</option>
                        <option value="file">ไฟล์</option>
                        <option value="complaint">ข้อร้องเรียน</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-medium border-b">
                        <tr>
                            <th className="px-6 py-3 text-left w-48">เวลา</th>
                            <th className="px-6 py-3 text-left w-64">ผู้ใช้งาน</th>
                            <th className="px-6 py-3 text-left w-32">การกระทำ</th>
                            <th className="px-6 py-3 text-left w-32">ประเภท</th>
                            <th className="px-6 py-3 text-left">ข้อมูล</th>
                            <th className="px-6 py-3 text-right w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    ไม่พบข้อมูลประวัติการใช้งาน
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <>
                                    <tr
                                        key={log.id}
                                        className={cn("hover:bg-slate-50 transition-colors cursor-pointer", expandedRows.includes(log.id) && "bg-slate-50")}
                                        onClick={() => toggleRow(log.id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                            {format(new Date(log.created_at), "d MMM yyyy HH:mm", { locale: th })}
                                        </td>
                                        <td className="px-6 py-4 truncate max-w-[200px]" title={log.user_email}>
                                            {log.user_email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getActionIcon(log.action)}
                                                <span>{getActionLabel(log.action)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getEntityBadge(log.entity_type)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 truncate max-w-[300px]">
                                            {log.entity_name}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {expandedRows.includes(log.id) ? (
                                                <ChevronUp className="w-4 h-4 text-slate-400 ml-auto" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" />
                                            )}
                                        </td>
                                    </tr>
                                    {expandedRows.includes(log.id) && (
                                        <tr className="bg-slate-50/50">
                                            <td colSpan={6} className="px-6 py-4 pl-14">
                                                <div className="bg-white border rounded-lg p-4 font-mono text-xs text-slate-600 overflow-x-auto">
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
        </div>
    );
}
