import { useState, useRef } from 'react';
import { Project, BudgetBreakdownItem } from '@/lib/types'; // Import BudgetBreakdownItem
import { updateProjectDetails } from '@/lib/actions';
import { Loader2, Save, Sparkles, Upload } from 'lucide-react';
import BudgetBreakdownEditor from './budget-breakdown-editor';
import { parseProjectPDF } from '@/lib/gemini';

interface ProjectDetailFormProps {
    project: Project;
}

export default function ProjectDetailForm({ project }: ProjectDetailFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        responsible_person: project.responsible_person || '',
        advisor: project.advisor || '',
        activity_type: project.activity_type || '',
        rationale: project.rationale || '',
        objectives: project.objectives?.join('\n') || '',
        targets: project.targets || '',
        sdg_goals: project.sdg_goals?.join(', ') || '',
        budget_breakdown: project.budget_breakdown || [],
    });

    const handleAutoFillClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const result = await parseProjectPDF(data);
            if (result.success && result.data) {
                const extracted = result.data;

                setFormData(prev => ({
                    ...prev,
                    responsible_person: extracted.responsible_person || prev.responsible_person,
                    advisor: extracted.advisor || prev.advisor,
                    activity_type: extracted.activity_type || prev.activity_type,
                    rationale: extracted.rationale || prev.rationale,
                    objectives: Array.isArray(extracted.objectives) ? extracted.objectives.join('\n') : (extracted.objectives || prev.objectives),
                    targets: extracted.targets || prev.targets,
                    sdg_goals: Array.isArray(extracted.sdg_goals) ? extracted.sdg_goals.join(', ') : (extracted.sdg_goals || prev.sdg_goals),
                    budget_breakdown: (extracted.budget_breakdown as BudgetBreakdownItem[]) || prev.budget_breakdown,
                }));

                alert('ดึงข้อมูลสำเร็จ! กรุณาตรวจสอบความถูกต้องก่อนบันทึก');
            } else {
                alert('ไม่สามารถวิเคราะห์ข้อมูลได้: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการวิเคราะห์เอกสาร');
        } finally {
            setIsAnalyzing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const objectivesArray = formData.objectives.split('\n').filter(s => s.trim() !== '');
        const sdgArray = formData.sdg_goals.split(',').map(s => s.trim()).filter(s => s !== '');

        try {
            await updateProjectDetails(project.id, {
                ...formData,
                objectives: objectivesArray,
                sdg_goals: sdgArray
            });
            alert('บันทึกข้อมูลเรียบร้อยแล้ว');
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Auto-fill Section */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Auto-fill from Document
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                        อัปโหลดไฟล์โครงการ (PDF) เพื่อให้ AI ช่วยกรอกข้อมูลให้คุณอัตโนมัติ
                    </p>
                </div>
                <div>
                    <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <button
                        type="button"
                        onClick={handleAutoFillClick}
                        disabled={isAnalyzing}
                        className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                กำลังวิเคราะห์...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                อัปโหลดไฟล์ PDF
                            </>
                        )}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ผู้รับผิดชอบโครงการ</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-100 outline-none border-slate-300"
                            placeholder="ชื่อ-สกุล, คณะ, เบอร์โทร"
                            value={formData.responsible_person}
                            onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">อาจารย์ที่ปรึกษา</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-100 outline-none border-slate-300"
                            value={formData.advisor}
                            onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทกิจกรรม</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-100 outline-none border-slate-300"
                        placeholder="เช่น วิชาการ, กีฬา, ศิลปวัฒนธรรม"
                        value={formData.activity_type}
                        onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">หลักการและเหตุผล</label>
                    <textarea
                        rows={6}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-100 outline-none border-slate-300"
                        value={formData.rationale}
                        onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">วัตถุประสงค์ (บรรทัดละ 1 ข้อ)</label>
                        <textarea
                            rows={5}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-100 outline-none border-slate-300"
                            placeholder="- เพื่อ..."
                            value={formData.objectives}
                            onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">เป้าหมาย / ตัวชี้วัด</label>
                        <textarea
                            rows={5}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-100 outline-none border-slate-300"
                            value={formData.targets}
                            onChange={(e) => setFormData({ ...formData, targets: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">SDG Goals (คั่นด้วยจุลภาค)</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-100 outline-none border-slate-300"
                        placeholder="เช่น SDG 1, SDG 4, SDG 17"
                        value={formData.sdg_goals}
                        onChange={(e) => setFormData({ ...formData, sdg_goals: e.target.value })}
                    />
                </div>

                {/* Budget Breakdown Editor */}
                <div className="pt-4 border-t border-slate-100">
                    <BudgetBreakdownEditor
                        value={formData.budget_breakdown}
                        onChange={(val) => setFormData({ ...formData, budget_breakdown: val })}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        บันทึกข้อมูล
                    </button>
                </div>
            </form>
        </div>
    );
}
