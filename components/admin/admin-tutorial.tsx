'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Upload, FileSpreadsheet, Eye, Save, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TutorialStep {
    title: string;
    description: string;
    icon: React.ReactNode;
    tip?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: 'เลือกศูนย์',
        description: 'เริ่มต้นด้วยการเลือกศูนย์ที่จะนำเข้าข้อมูล (ส่วนกลาง, รังสิต, ท่าพระจันทร์, หรือลำปาง) ข้อมูลทั้งหมดที่นำเข้าจะถูกบันทึกเป็นของศูนย์ที่เลือก',
        icon: <MapPin className="w-8 h-8" />,
        tip: '💡 สามารถนำเข้าข้อมูลทีละศูนย์ได้ หากต้องการเปลี่ยนศูนย์ให้กลับมาเลือกใหม่',
    },
    {
        title: 'อัปโหลดไฟล์ Excel (ทางเลือก)',
        description: 'อัปโหลดไฟล์ Excel สรุปรายชื่อโครงการทั้งหมด ระบบจะใช้เป็น "รายชื่อหลัก" เพื่อตรวจสอบความถูกต้องและเติมข้อมูลงบประมาณที่อนุมัติ',
        icon: <FileSpreadsheet className="w-8 h-8" />,
        tip: '💡 ไม่จำเป็นต้องอัปโหลด Excel ก็ได้ แต่จะช่วยให้ระบบตรวจสอบความถูกต้องได้ดีขึ้น',
    },
    {
        title: 'อัปโหลดไฟล์ข้อเสนอโครงการ',
        description: 'อัปโหลดไฟล์ PDF ข้อเสนอโครงการ หรือไฟล์ ZIP ที่รวม PDF หลายไฟล์ ระบบ AI จะวิเคราะห์และดึงข้อมูลจากไฟล์อัตโนมัติ',
        icon: <Upload className="w-8 h-8" />,
        tip: '💡 รองรับไฟล์ .pdf, .zip, .xlsx, .xls, .csv',
    },
    {
        title: 'ตรวจสอบข้อมูล',
        description: 'ตรวจสอบข้อมูลในพื้นที่เตรียมก่อนนำเข้า ระบบจะแสดงสถานะของแต่ละรายการ (ใหม่, อัปเดต, เชื่อมโยงแล้ว) และแจ้งเตือนหากพบปัญหา',
        icon: <Eye className="w-8 h-8" />,
        tip: '💡 รายการที่มี ⚠️ ควรตรวจสอบเพิ่มเติมก่อนนำเข้า',
    },
    {
        title: 'นำเข้าข้อมูล',
        description: 'เมื่อตรวจสอบเรียบร้อยแล้ว กดปุ่ม "นำเข้า" เพื่อบันทึกข้อมูลทั้งหมดลงในระบบ',
        icon: <Save className="w-8 h-8" />,
        tip: '💡 หลังนำเข้าสำเร็จ สามารถแก้ไขรายละเอียดเพิ่มเติมได้ที่หน้าจัดการโครงการ',
    },
];

const STORAGE_KEY = 'admin_tutorial_seen';

interface AdminTutorialProps {
    forceShow?: boolean;
    onClose?: () => void;
}

export default function AdminTutorial({ forceShow = false, onClose }: AdminTutorialProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (forceShow) {
            setIsOpen(true);
            return;
        }

        // Check if user has seen the tutorial
        const hasSeen = localStorage.getItem(STORAGE_KEY);
        if (!hasSeen) {
            setIsOpen(true);
        }
    }, [forceShow]);

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsOpen(false);
        onClose?.();
    };

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!isOpen) return null;

    const step = TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">คู่มือการใช้งาน</h2>
                                <p className="text-blue-100 text-sm">ศูนย์นำเข้าข้อมูลรวม</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-lg transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Step indicator */}
                    <div className="flex gap-2 mt-4">
                        {TUTORIAL_STEPS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all flex-1",
                                    index === currentStep ? "bg-white" : "bg-white/30 hover:bg-white/50"
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                            {step.icon}
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-slate-400 font-medium mb-1">
                                ขั้นตอนที่ {currentStep + 1} / {TUTORIAL_STEPS.length}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{step.description}</p>

                            {step.tip && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
                                    {step.tip}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t flex justify-between items-center">
                    <button
                        onClick={handleClose}
                        className="text-slate-500 hover:text-slate-700 text-sm font-medium transition"
                    >
                        ข้ามไป
                    </button>

                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                ย้อนกลับ
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                        >
                            {isLastStep ? 'เริ่มใช้งาน' : 'ถัดไป'}
                            {!isLastStep && <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
