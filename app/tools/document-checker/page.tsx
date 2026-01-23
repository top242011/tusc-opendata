'use client';

import { useState } from 'react';
import budgetRulesCentral from '@/lib/data/budget-rules.json';
import budgetRulesLampang from '@/lib/data/budget-rules-lampang.json';
import DocumentUploader from '@/components/tools/DocumentUploader';
import CheckResult from '@/components/tools/CheckResult';
import CampusSelector, { CampusType } from '@/components/tools/CampusSelector';
import { ArrowLeft, FileCheck, Info } from 'lucide-react';
import Link from 'next/link';

export default function DocumentCheckerPage() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedCampus, setSelectedCampus] = useState<CampusType>('central');

    const handleFileUploaded = async (storagePath: string, fileName: string) => {
        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/check-document', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storagePath,
                    fileName,
                    campus: selectedCampus,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setResult(data.data);
            } else {
                setError(data.error || 'เกิดข้อผิดพลาดในการตรวจสอบเอกสาร');
            }
        } catch (err) {
            setError('ไม่สามารถเชื่อมต่อกับระบบตรวจสอบได้');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        กลับหน้าหลัก
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <FileCheck className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">ตรวจสอบเอกสารโครงการ</h1>
                            <p className="text-slate-600 mt-1">
                                ระบบ AI ผู้ช่วยตรวจสอบความถูกต้องของข้อเสนอโครงการตามระเบียบงบประมาณ
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">

                {/* Intro Card */}
                {!result && !isAnalyzing && (
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex gap-4">
                        <div className="flex-shrink-0">
                            <Info className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="text-sm text-slate-600 space-y-2">
                            <p className="font-medium text-slate-900">คำแนะนำการใช้งาน</p>
                            <ul className="list-disc list-inside space-y-1 ml-1">
                                <li>ระบบรองรับไฟล์ <strong>PDF</strong> (แบบฟอร์มโครงการ) หรือ <strong>Excel</strong> (ตารางงบประมาณ)</li>
                                <li>AI จะตรวจสอบรายการค่าใช้จ่ายเทียบกับเกณฑ์ราคากลางและเงื่อนไขต่างๆ</li>
                                <li>ผลการตรวจสอบเป็นเพียงข้อแนะนำเบื้องต้น โปรดอ้างอิงระเบียบฉบับจริงเป็นหลัก</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Campus Selector */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 mb-2">เลือกหลักเกณฑ์งบประมาณ</h2>
                    <p className="text-sm text-slate-500 mb-4">
                        เลือก Campus ที่ใช้หลักเกณฑ์งบประมาณสำหรับตรวจสอบเอกสาร
                    </p>
                    <CampusSelector
                        selectedCampus={selectedCampus}
                        onCampusChange={setSelectedCampus}
                        disabled={isAnalyzing}
                    />
                </div>

                {/* Uploader */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">อัปโหลดเอกสาร</h2>
                    <DocumentUploader
                        onFileUploaded={handleFileUploaded}
                        isAnalyzing={isAnalyzing}
                    />

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm border border-red-200">
                            <Info className="w-5 h-5" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Result */}
                {result && (
                    <CheckResult data={result} />
                )}
            </div>
        </div>
    );
}
