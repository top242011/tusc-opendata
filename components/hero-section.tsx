"use client";

import { ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
    latestFiscalYear: number;
}

export function HeroSection({ latestFiscalYear }: HeroSectionProps) {
    return (
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-20 px-4">
            <div className="container mx-auto max-w-6xl flex flex-col items-center text-center space-y-6">
                <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm border border-white/20">
                    <ShieldCheck className="w-12 h-12 text-blue-200" />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    ระบบตรวจสอบงบประมาณสภานักศึกษา
                </h1>

                <p className="text-xl md:text-2xl text-blue-100 max-w-3xl font-light">
                    เปิดเผย โปร่งใส ตรวจสอบได้ — เพื่อประโยชน์สูงสุดของนักศึกษา
                </p>

                <div className="pt-8 flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center bg-white/5 px-6 py-3 rounded-lg border border-white/10 backdrop-blur-sm">
                        <span className="text-sm text-blue-200">ปีงบประมาณล่าสุด</span>
                        <span className="text-2xl font-bold">{latestFiscalYear}</span>
                    </div>

                    <button
                        onClick={() => {
                            const tableElement = document.getElementById('project-table');
                            if (tableElement) {
                                tableElement.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="animate-bounce p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer border border-white/10 mt-4 group"
                        aria-label="เลื่อนลงเพื่อดูข้อมูลโครงการ"
                    >
                        <svg
                            className="w-6 h-6 text-blue-200 group-hover:text-white transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
}
