'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react';
import { createBudgetCategory, updateBudgetCategory, deleteBudgetCategory } from '@/lib/budget-category-actions';
import type { BudgetCategory } from '@/lib/types';

interface Props {
    initialCategories: BudgetCategory[];
}

export function BudgetCategoriesManager({ initialCategories }: Props) {
    const router = useRouter();
    const [categories, setCategories] = useState(initialCategories);
    const [editing, setEditing] = useState<BudgetCategory | null>(null);
    const [creating, setCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: '',
        description: '',
        max_rate: '',
        unit: '',
        rules: '',
        is_active: true,
    });

    const resetForm = () => {
        setForm({ name: '', description: '', max_rate: '', unit: '', rules: '', is_active: true });
        setEditing(null);
        setCreating(false);
        setError(null);
    };

    const startEdit = (cat: BudgetCategory) => {
        setEditing(cat);
        setCreating(false);
        setForm({
            name: cat.name,
            description: cat.description || '',
            max_rate: cat.max_rate?.toString() || '',
            unit: cat.unit || '',
            rules: cat.rules || '',
            is_active: cat.is_active,
        });
    };

    const startCreate = () => {
        resetForm();
        setCreating(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) { setError('กรุณาระบุชื่อหมวดงบ'); return; }
        setLoading(true);
        setError(null);

        const payload = {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            max_rate: form.max_rate ? Number(form.max_rate) : undefined,
            unit: form.unit.trim() || undefined,
            rules: form.rules.trim() || undefined,
            is_active: form.is_active,
        };

        const result = editing
            ? await updateBudgetCategory(editing.id, payload)
            : await createBudgetCategory(payload);

        setLoading(false);
        if ('error' in result && result.error) {
            setError(result.error);
        } else {
            resetForm();
            router.refresh();
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('ต้องการลบหมวดงบนี้?')) return;
        const result = await deleteBudgetCategory(id);
        if ('error' in result && result.error) {
            alert(result.error);
        } else {
            router.refresh();
        }
    };

    const showForm = creating || editing;

    return (
        <div className="space-y-4">
            {/* Add Button */}
            {!showForm && (
                <button
                    onClick={startCreate}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white hover:opacity-90 ios-press"
                >
                    <Plus className="w-4 h-4" />
                    เพิ่มหมวดงบ
                </button>
            )}

            {/* Inline Form */}
            {showForm && (
                <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 p-5">
                    <h3 className="text-sm font-semibold text-[rgb(var(--ios-text-primary))] mb-4">
                        {editing ? 'แก้ไขหมวดงบ' : 'เพิ่มหมวดงบใหม่'}
                    </h3>

                    {error && (
                        <div className="p-3 mb-4 rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-red))]/5 border border-[rgb(var(--ios-red))]/20">
                            <p className="text-sm text-[rgb(var(--ios-red))]">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-[rgb(var(--ios-text-secondary))] mb-1">ชื่อหมวด *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="เช่น ค่าอาหาร"
                                className="w-full px-3 py-2 text-sm rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[rgb(var(--ios-text-secondary))] mb-1">หน่วย</label>
                            <input
                                value={form.unit}
                                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                                placeholder="เช่น มื้อ, คน, ชั่วโมง"
                                className="w-full px-3 py-2 text-sm rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[rgb(var(--ios-text-secondary))] mb-1">อัตราสูงสุด (บาท)</label>
                            <input
                                type="number"
                                value={form.max_rate}
                                onChange={e => setForm(f => ({ ...f, max_rate: e.target.value }))}
                                placeholder="0"
                                className="w-full px-3 py-2 text-sm rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[rgb(var(--ios-text-secondary))] mb-1">คำอธิบาย</label>
                            <input
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="รายละเอียดเพิ่มเติม"
                                className="w-full px-3 py-2 text-sm rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))]"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-medium text-[rgb(var(--ios-text-secondary))] mb-1">เงื่อนไข/กฎ</label>
                        <textarea
                            value={form.rules}
                            onChange={e => setForm(f => ({ ...f, rules: e.target.value }))}
                            rows={2}
                            placeholder="เช่น ต้องแนบใบเสร็จรับเงิน"
                            className="w-full px-3 py-2 text-sm rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))] resize-none"
                        />
                    </div>

                    <label className="flex items-center gap-2 mb-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                            className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-[rgb(var(--ios-text-primary))]">ใช้งานอยู่</span>
                    </label>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-semibold rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white hover:opacity-90 disabled:opacity-40 ios-press"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'บันทึก' : 'เพิ่ม'}
                        </button>
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            {categories.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-sm text-[rgb(var(--ios-text-tertiary))]">ยังไม่มีหมวดงบประมาณ</p>
                </div>
            ) : (
                <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[rgb(var(--ios-fill-tertiary))]">
                                    <th className="px-4 py-2.5 text-left font-medium text-[rgb(var(--ios-text-secondary))]">ชื่อหมวด</th>
                                    <th className="px-4 py-2.5 text-left font-medium text-[rgb(var(--ios-text-secondary))]">หน่วย</th>
                                    <th className="px-4 py-2.5 text-right font-medium text-[rgb(var(--ios-text-secondary))]">อัตราสูงสุด</th>
                                    <th className="px-4 py-2.5 text-left font-medium text-[rgb(var(--ios-text-secondary))]">สถานะ</th>
                                    <th className="px-4 py-2.5 text-center font-medium text-[rgb(var(--ios-text-secondary))] w-24">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[rgb(var(--ios-separator))]/30">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-[rgb(var(--ios-text-primary))]">{cat.name}</p>
                                            {cat.description && (
                                                <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-0.5">{cat.description}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-[rgb(var(--ios-text-secondary))]">
                                            {cat.unit || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums text-[rgb(var(--ios-text-primary))]">
                                            {cat.max_rate ? `${cat.max_rate.toLocaleString('th-TH')} ฿` : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                                                cat.is_active
                                                    ? 'bg-[rgb(var(--ios-green))]/10 text-[rgb(var(--ios-green))]'
                                                    : 'bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-tertiary))]'
                                            }`}>
                                                {cat.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => startEdit(cat)}
                                                    className="p-1.5 text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-accent))]/5 rounded-[var(--ios-radius-sm)]"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="p-1.5 text-[rgb(var(--ios-red))] hover:bg-[rgb(var(--ios-red))]/5 rounded-[var(--ios-radius-sm)]"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-2 border-t border-[rgb(var(--ios-separator))]/30 text-xs text-[rgb(var(--ios-text-tertiary))]">
                        ทั้งหมด {categories.length} หมวด
                    </div>
                </div>
            )}
        </div>
    );
}
