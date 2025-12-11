'use client';

import { useState, useEffect } from 'react';
import { BudgetBreakdownItem } from '@/lib/types';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { formatTHB } from '@/lib/utils';
import { cn } from '@/utils/cn';

interface BudgetBreakdownEditorProps {
    value?: BudgetBreakdownItem[];
    onChange: (value: BudgetBreakdownItem[]) => void;
}

export default function BudgetBreakdownEditor({ value = [], onChange }: BudgetBreakdownEditorProps) {
    const [items, setItems] = useState<BudgetBreakdownItem[]>(value || []);

    useEffect(() => {
        setItems(value || []);
    }, [value]);

    const handleAddItem = () => {
        const newItem: BudgetBreakdownItem = {
            item: '',
            amount: 1,
            unit: '',
            cost_per_unit: 0,
            total: 0
        };
        const newItems = [...items, newItem];
        setItems(newItems);
        onChange(newItems);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        onChange(newItems);
    };

    const handleChange = (index: number, field: keyof BudgetBreakdownItem, val: any) => {
        const newItems = [...items];
        const currentItem = { ...newItems[index] };

        // Type safety and calculation logic
        if (field === 'amount' || field === 'cost_per_unit') {
            currentItem[field] = parseFloat(val) || 0;
            // Auto-calc total
            currentItem.total = currentItem.amount * currentItem.cost_per_unit;
        } else if (field === 'total') {
            currentItem.total = parseFloat(val) || 0;
        } else {
            (currentItem as any)[field] = val;
        }

        newItems[index] = currentItem;
        setItems(newItems);
        onChange(newItems);
    };

    const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">รายละเอียดงบประมาณ (Budget Breakdown)</label>
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    <Plus className="w-4 h-4" /> เพิ่มรายการ
                </button>
            </div>

            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-2 font-medium w-[30%]">รายการ</th>
                            <th className="px-4 py-2 font-medium w-[15%]">จำนวน</th>
                            <th className="px-4 py-2 font-medium w-[15%]">หน่วย</th>
                            <th className="px-4 py-2 font-medium w-[20%]">ราคา/หน่วย</th>
                            <th className="px-4 py-2 font-medium w-[15%]">รวม (บาท)</th>
                            <th className="px-4 py-2 w-[5%]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                                    ยังไม่มีรายการค่าใช้จ่าย
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={index} className="group hover:bg-slate-50">
                                    <td className="px-2 py-2">
                                        <input
                                            type="text"
                                            className="w-full p-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                            placeholder="ชื่อรายการ"
                                            value={item.item}
                                            onChange={(e) => handleChange(index, 'item', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            className="w-full p-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-right"
                                            value={item.amount}
                                            onChange={(e) => handleChange(index, 'amount', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <input
                                            type="text"
                                            className="w-full p-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-center"
                                            placeholder="หน่วยนับ"
                                            value={item.unit}
                                            onChange={(e) => handleChange(index, 'unit', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full p-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-right"
                                            value={item.cost_per_unit}
                                            onChange={(e) => handleChange(index, 'cost_per_unit', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            readOnly
                                            className="w-full p-1 bg-slate-100 border rounded text-right text-slate-500"
                                            value={item.total}
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                            <td colSpan={4} className="px-4 py-3 text-right font-semibold text-slate-700">รวมเป็นเงินทั้งสิ้น</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-600">{formatTHB(grandTotal)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
