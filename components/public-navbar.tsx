"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Shield, MessageCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackModal } from '@/components/feedback-modal';

export function PublicNavbar() {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    return (
        <>
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50" aria-label="Main Navigation">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group" aria-label="หน้าหลัก TU Open Data">
                        <span className="font-semibold text-slate-900 text-lg tracking-tight">
                            TU <span className="text-blue-600">Open Data</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                            หน้าหลัก
                        </Link>

                        {/* Tools Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors py-2 focus:outline-none">
                                เครื่องมือ
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                                <div className="p-2">
                                    <Link href="/tools/document-checker" className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors group/item">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover/item:bg-blue-100 transition-colors">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">ตรวจสอบเอกสารโครงการ</div>
                                            <div className="text-xs text-slate-500 mt-0.5">เช็คความถูกต้องตามระเบียบงบฯ</div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                            เกี่ยวกับโครงการ
                        </a>
                        <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                            Open API
                        </a>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-blue-600">
                                <LogIn className="w-4 h-4" />
                                สำหรับเจ้าหน้าที่
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => setIsFeedbackOpen(true)}
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Feedback</span>
                        </Button>
                    </div>
                </div>
            </nav>

            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />
        </>
    );
}
