'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, PartyPopper } from 'lucide-react';

const TOUR_STORAGE_KEY = 'tu-opendata-tour-completed';

const STEPS = [
    {
        title: 'ยินดีต้อนรับ! 🎉',
        description: 'ยินดีต้อนรับสู่ระบบจัดการ TU Open Data สำหรับแอดมิน มาทำความรู้จักกับระบบกัน',
    },
    {
        title: 'เมนูด้านข้าง',
        description: 'ใช้เมนูด้านซ้ายเพื่อเข้าถึงส่วนต่างๆ เช่น โครงการ องค์กร นำเข้าข้อมูล และตั้งค่า',
    },
    {
        title: 'นำเข้าข้อมูล',
        description: 'ไปที่ "นำเข้าข้อมูล" เพื่อนำเข้าข้อมูลโครงการจาก Excel/CSV ดาวน์โหลด template ก่อนเริ่มต้น!',
    },
    {
        title: 'ขอความช่วยเหลือ',
        description: 'กดปุ่ม "?" มุมขวาล่างเพื่อดูคำแนะนำ หรือไปที่ "คู่มือการใช้งาน" ในเมนูระบบ',
    },
];

export function OnboardingTour() {
    const [show, setShow] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const completed = localStorage.getItem(TOUR_STORAGE_KEY);
        if (!completed) {
            // Delay to let page render first
            const timer = setTimeout(() => setShow(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = () => {
        setShow(false);
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    };

    const next = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            dismiss();
        }
    };

    if (!show) return null;

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={dismiss} />

            <div className="relative w-full max-w-md bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Progress */}
                <div className="flex gap-1 px-5 pt-5">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-colors ${
                                i <= step ? 'bg-[rgb(var(--ios-accent))]' : 'bg-[rgb(var(--ios-fill-tertiary))]'
                            }`}
                        />
                    ))}
                </div>

                {/* Close */}
                <button
                    onClick={dismiss}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-[rgb(var(--ios-fill-tertiary))]"
                >
                    <X className="w-4 h-4 text-[rgb(var(--ios-text-tertiary))]" />
                </button>

                {/* Content */}
                <div className="px-6 py-8 text-center">
                    <h3 className="text-lg font-bold text-[rgb(var(--ios-text-primary))] mb-3">{current.title}</h3>
                    <p className="text-sm text-[rgb(var(--ios-text-secondary))] leading-relaxed">{current.description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-6 pb-6">
                    <button
                        onClick={dismiss}
                        className="text-sm text-[rgb(var(--ios-text-tertiary))] hover:text-[rgb(var(--ios-text-secondary))]"
                    >
                        ข้าม
                    </button>
                    <button
                        onClick={next}
                        className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white hover:opacity-90 ios-press"
                    >
                        {isLast ? (
                            <>
                                <PartyPopper className="w-4 h-4" />
                                เริ่มใช้งาน
                            </>
                        ) : (
                            <>
                                ถัดไป
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
