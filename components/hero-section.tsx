"use client";

import { ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
    latestFiscalYear: number;
}

export function HeroSection({ latestFiscalYear }: HeroSectionProps) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[rgb(var(--ios-accent))] via-blue-600 to-indigo-700 dark:from-blue-900 dark:via-blue-800 dark:to-indigo-900 text-white py-16 md:py-20 px-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
            </div>

            <div className="container mx-auto max-w-6xl flex flex-col items-center text-center space-y-6 relative z-10">
                {/* Icon */}
                <div className="p-4 rounded-[var(--ios-radius-lg)] bg-white/15 backdrop-blur-sm border border-white/20">
                    <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>

                {/* Large Title - iOS Style */}
                <h1 className="ios-large-title text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                    ระบบตรวจสอบงบประมาณสภานักศึกษา
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-blue-100 max-w-3xl font-light">
                    เปิดเผย โปร่งใส ตรวจสอบได้ — เพื่อประโยชน์สูงสุดของนักศึกษา
                </p>

                {/* Info Box */}
                <div className="pt-6 flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center px-6 py-4 rounded-[var(--ios-radius-lg)] bg-white/10 backdrop-blur-sm border border-white/15">
                        <span className="text-sm text-blue-200 font-medium">ปีงบประมาณล่าสุด</span>
                        <span className="text-3xl font-bold mt-1">{latestFiscalYear}</span>
                    </div>

                    {/* Scroll Indicator */}
                    <button
                        onClick={() => {
                            const tableElement = document.getElementById('project-table');
                            if (tableElement) {
                                tableElement.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="animate-bounce p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer border border-white/15 mt-2 group ios-press"
                        aria-label="เลื่อนลงเพื่อดูข้อมูลโครงการ"
                    >
                        <svg
                            className="w-5 h-5 text-blue-100 group-hover:text-white transition-colors"
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
