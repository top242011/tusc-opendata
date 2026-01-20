"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Shield, MessageCircle, LogIn, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackModal } from '@/components/feedback-modal';

export function PublicNavbar() {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const toggleTools = () => setIsToolsOpen(!isToolsOpen);

    return (
        <>
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50" aria-label="Main Navigation">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group" aria-label="หน้าหลัก TU Open Data">
                        <span className="font-semibold text-slate-900 text-lg tracking-tight">
                            TU <span className="text-blue-600">Open Data</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                            หน้าหลัก
                        </Link>

                        {/* Tools Dropdown */}
                        <div className="relative group">
                            <button
                                className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors py-2 focus:outline-none"
                                onClick={toggleTools}
                                onBlur={() => setTimeout(() => setIsToolsOpen(false), 200)} // Delay to allow clicking links
                            >
                                เครื่องมือ
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            <div className={`absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg border border-slate-100 transition-all duration-200 transform origin-top-left z-50 ${isToolsOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                                <div className="p-2">
                                    <Link href="/tools/document-checker" className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors group/item" onClick={() => setIsToolsOpen(false)}>
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

                        <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                            เกี่ยวกับโครงการ
                        </Link>
                        <Link href="/api-docs" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                            Open API
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Mobile Hamburger Button */}
                        <button
                            className="md:hidden p-2 text-slate-600 hover:text-blue-600 focus:outline-none"
                            onClick={toggleMobileMenu}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <div className="hidden md:flex items-center gap-3">
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
                                <span>Feedback</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white absolute w-full shadow-lg">
                        <div className="flex flex-col p-4 gap-4">
                            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                หน้าหลัก
                            </Link>

                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-600">เครื่องมือ</div>
                                <div className="pl-4 space-y-2">
                                    <Link href="/tools/document-checker" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Shield className="w-4 h-4" />
                                        ตรวจสอบเอกสารโครงการ
                                    </Link>
                                </div>
                            </div>

                            <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                เกี่ยวกับโครงการ
                            </Link>
                            <Link href="/api-docs" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                Open API
                            </Link>

                            <hr className="border-slate-100" />

                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                    <LogIn className="w-4 h-4" />
                                    สำหรับเจ้าหน้าที่
                                </div>
                            </Link>

                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-center gap-2"
                                onClick={() => {
                                    setIsFeedbackOpen(true);
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>ส่งข้อเสนอแนะ (Feedback)</span>
                            </Button>
                        </div>
                    </div>
                )}
            </nav>

            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />
        </>
    );
}
