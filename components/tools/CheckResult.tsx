
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

interface CheckItem {
    category: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    description: string;
    issue?: string;
    suggestion?: string;
}

interface CheckResultProps {
    data: {
        overall_status: 'PASS' | 'WARN' | 'FAIL';
        summary: string;
        items: CheckItem[];
    };
}

export default function CheckResult({ data }: CheckResultProps) {
    const [expandedItems, setExpandedItems] = useState<number[]>([]);

    const toggleExpand = (index: number) => {
        setExpandedItems(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const statusConfig = {
        PASS: { color: 'green', icon: CheckCircle, label: 'ผ่านเกณฑ์', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
        WARN: { color: 'amber', icon: AlertTriangle, label: 'ควรตรวจสอบ', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
        FAIL: { color: 'red', icon: XCircle, label: 'ไม่ผ่านเกณฑ์', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
    };

    const overall = statusConfig[data.overall_status] || statusConfig.WARN;

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Summary Card */}
            <div className={cn("p-6 rounded-xl border-l-4 shadow-sm bg-white", overall.border)}>
                <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-full", overall.bg)}>
                        <overall.icon className={cn("w-8 h-8", overall.text)} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            ผลการตรวจสอบ: <span className={overall.text}>{overall.label}</span>
                        </h2>
                        <p className="text-slate-600 mt-2 leading-relaxed">
                            {data.summary}
                        </p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-800 px-1">รายการตรวจสอบ ({data.items.length})</h3>

                {data.items.map((item, index) => {
                    const status = statusConfig[item.status] || statusConfig.WARN;
                    const isExpanded = expandedItems.includes(index);

                    return (
                        <div
                            key={index}
                            className="bg-white border rounded-lg hover:shadow-sm transition-all overflow-hidden"
                        >
                            <button
                                onClick={() => toggleExpand(index)}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <status.icon className={cn("w-5 h-5 flex-shrink-0", status.text)} />
                                    <div>
                                        <div className="font-medium text-slate-800">{item.category}</div>
                                        <div className="text-sm text-slate-500 line-clamp-1">{item.description}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", status.bg, status.text)}>
                                        {status.label}
                                    </span>
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                </div>
                            </button>

                            {(isExpanded || item.status !== 'PASS') && (
                                <div className={cn(
                                    "px-4 pb-4 pt-0 text-sm pl-12 space-y-2",
                                    !isExpanded && item.status !== 'PASS' ? "hidden" : "block" // Auto-expand non-pass items logic could be applied, but kept manual for now or controlled by state
                                )}>
                                    <div className="p-3 bg-slate-50 rounded-md space-y-2">
                                        <div className="grid grid-cols-[100px_1fr] gap-2">
                                            <span className="text-slate-500 font-medium">รายละเอียด:</span>
                                            <span className="text-slate-700">{item.description}</span>
                                        </div>

                                        {item.issue && (
                                            <div className="grid grid-cols-[100px_1fr] gap-2">
                                                <span className="text-red-500 font-medium">ปัญหา:</span>
                                                <span className="text-red-700">{item.issue}</span>
                                            </div>
                                        )}

                                        {item.suggestion && (
                                            <div className="grid grid-cols-[100px_1fr] gap-2">
                                                <span className="text-blue-500 font-medium">คำแนะนำ:</span>
                                                <span className="text-blue-700">{item.suggestion}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
