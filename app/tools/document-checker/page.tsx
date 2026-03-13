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
        <main id="main-content" className="min-h-screen bg-[rgb(var(--ios-bg-primary))] pb-20">
            {/* Header */}
            <div className="bg-[rgb(var(--ios-bg-secondary))] border-b border-[rgb(var(--ios-separator))]/30">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <Link href="/" className="inline-flex items-center gap-2 text-[rgb(var(--ios-text-tertiary))] hover:text-[rgb(var(--ios-accent))] transition-colors text-sm mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        กลับหน้าหลัก
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[rgb(var(--ios-accent))]/10 rounded-[var(--ios-radius-lg)]">
                            <FileCheck className="w-8 h-8 text-[rgb(var(--ios-accent))]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">ตรวจสอบเอกสารโครงการ</h1>
                            <p className="text-[rgb(var(--ios-text-secondary))] mt-1">
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
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] p-6 border border-[rgb(var(--ios-separator))]/30 shadow-[var(--ios-shadow-sm)] flex gap-4">
                        <div className="flex-shrink-0">
                            <Info className="w-6 h-6 text-[rgb(var(--ios-accent))]" />
                        </div>
                        <div className="text-sm text-[rgb(var(--ios-text-secondary))] space-y-2">
                            <p className="font-medium text-[rgb(var(--ios-text-primary))]">คำแนะนำการใช้งาน</p>
                            <ul className="list-disc list-inside space-y-1 ml-1">
                                <li>ระบบรองรับไฟล์ <strong>PDF</strong> (แบบฟอร์มโครงการ) หรือ <strong>Excel</strong> (ตารางงบประมาณ)</li>
                                <li>AI จะตรวจสอบรายการค่าใช้จ่ายเทียบกับเกณฑ์ราคากลางและเงื่อนไขต่างๆ</li>
                                <li>ผลการตรวจสอบเป็นเพียงข้อแนะนำเบื้องต้น โปรดอ้างอิงระเบียบฉบับจริงเป็นหลัก</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Campus Selector */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] shadow-[var(--ios-shadow-sm)] p-6 border border-[rgb(var(--ios-separator))]/30">
                    <h2 className="text-lg font-semibold text-[rgb(var(--ios-text-primary))] mb-2">เลือกหลักเกณฑ์งบประมาณ</h2>
                    <p className="text-sm text-[rgb(var(--ios-text-tertiary))] mb-4">
                        เลือก Campus ที่ใช้หลักเกณฑ์งบประมาณสำหรับตรวจสอบเอกสาร
                    </p>
                    <CampusSelector
                        selectedCampus={selectedCampus}
                        onCampusChange={setSelectedCampus}
                        disabled={isAnalyzing}
                    />
                </div>

                {/* Uploader */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] shadow-[var(--ios-shadow-sm)] p-6 border border-[rgb(var(--ios-separator))]/30">
                    <h2 className="text-lg font-semibold text-[rgb(var(--ios-text-primary))] mb-4">อัปโหลดเอกสาร</h2>
                    <DocumentUploader
                        onFileUploaded={handleFileUploaded}
                        isAnalyzing={isAnalyzing}
                    />

                    {error && (
                        <div className="mt-4 p-4 bg-[rgb(var(--ios-red))]/10 text-[rgb(var(--ios-red))] rounded-[var(--ios-radius-sm)] flex items-center gap-2 text-sm border border-[rgb(var(--ios-red))]/20" role="alert">
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
        </main>
    );
}
