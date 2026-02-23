"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Shield, MessageCircle, LogIn, Menu, X, ChevronDown, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackModal } from '@/components/feedback-modal';
import { useTheme } from '@/components/theme-provider';

export function PublicNavbar() {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const { resolvedTheme, setTheme } = useTheme();

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const toggleTools = () => setIsToolsOpen(!isToolsOpen);
    const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

    return (
        <>
            <nav
                className="sticky top-0 z-50 ios-material-thick border-b border-[rgb(var(--ios-separator))]/50 transition-colors duration-200"
                aria-label="Main Navigation"
            >
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group ios-press" aria-label="หน้าหลัก TU Open Data">
                        <span className="font-semibold text-[rgb(var(--ios-text-primary))] text-lg tracking-tight">
                            TU <span className="text-[rgb(var(--ios-accent))]">Open Data</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link
                            href="/"
                            className="px-4 py-2 text-sm font-medium text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors ios-press"
                        >
                            หน้าหลัก
                        </Link>

                        {/* Tools Dropdown */}
                        <div className="relative">
                            <button
                                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors focus:outline-none ios-press"
                                onClick={toggleTools}
                                onBlur={() => setTimeout(() => setIsToolsOpen(false), 200)}
                            >
                                เครื่องมือ
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            <div className={`absolute top-full left-0 mt-1 w-72 bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-md)] shadow-[var(--ios-shadow-lg)] border border-[rgb(var(--ios-separator))]/50 transition-all duration-200 transform origin-top-left z-50 ${isToolsOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                                <div className="p-2">
                                    <Link
                                        href="/tools/document-checker"
                                        className="flex items-start gap-3 p-3 rounded-[var(--ios-radius-sm)] hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors group/item ios-press"
                                        onClick={() => setIsToolsOpen(false)}
                                    >
                                        <div className="p-2 bg-[rgb(var(--ios-accent))]/10 rounded-[var(--ios-radius-sm)] text-[rgb(var(--ios-accent))] group-hover/item:bg-[rgb(var(--ios-accent))]/15 transition-colors">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-[rgb(var(--ios-text-primary))]">ตรวจสอบเอกสารโครงการ</div>
                                            <div className="text-xs text-[rgb(var(--ios-text-secondary))] mt-0.5">เช็คความถูกต้องตามระเบียบงบฯ</div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/organizations"
                            className="px-4 py-2 text-sm font-medium text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors ios-press"
                        >
                            หน่วยงาน / คณะ
                        </Link>
                        <Link
                            href="/projects"
                            className="px-4 py-2 text-sm font-medium text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors ios-press"
                        >
                            โครงการทั้งหมด
                        </Link>
                        <Link
                            href="/open-data"
                            className="px-4 py-2 text-sm font-medium text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors ios-press"
                        >
                            ข้อมูลชุดเปิด (Open Data)
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full bg-[rgb(var(--ios-fill-tertiary))] hover:bg-[rgb(var(--ios-fill-secondary))] transition-colors ios-press"
                            aria-label={resolvedTheme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
                        >
                            {resolvedTheme === 'dark' ? (
                                <Sun className="w-5 h-5 text-[rgb(var(--ios-orange))]" />
                            ) : (
                                <Moon className="w-5 h-5 text-[rgb(var(--ios-indigo))]" />
                            )}
                        </button>

                        {/* Mobile Hamburger Button */}
                        <button
                            className="md:hidden p-2.5 rounded-full bg-[rgb(var(--ios-fill-tertiary))] hover:bg-[rgb(var(--ios-fill-secondary))] transition-colors ios-press"
                            onClick={toggleMobileMenu}
                            aria-label={isMobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5 text-[rgb(var(--ios-text-primary))]" />
                            ) : (
                                <Menu className="w-5 h-5 text-[rgb(var(--ios-text-primary))]" />
                            )}
                        </button>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <LogIn className="w-4 h-4" />
                                    สำหรับเจ้าหน้าที่
                                </Button>
                            </Link>
                            <Button
                                variant="secondary"
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
                    <div className="md:hidden border-t border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-secondary))] absolute w-full shadow-[var(--ios-shadow-lg)] animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col p-4 gap-1">
                            <Link
                                href="/"
                                className="px-4 py-3 text-sm font-medium text-[rgb(var(--ios-text-primary))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                หน้าหลัก
                            </Link>

                            <div className="mt-2 mb-1 px-4">
                                <div className="text-xs font-semibold text-[rgb(var(--ios-text-tertiary))] uppercase tracking-wide">เครื่องมือ</div>
                            </div>
                            <Link
                                href="/tools/document-checker"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-[rgb(var(--ios-text-primary))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Shield className="w-4 h-4 text-[rgb(var(--ios-accent))]" />
                                ตรวจสอบเอกสารโครงการ
                            </Link>

                            <div className="my-2 h-px bg-[rgb(var(--ios-separator))]" />

                            <Link
                                href="/organizations"
                                className="px-4 py-3 text-sm font-medium text-[rgb(var(--ios-text-primary))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                หน่วยงาน / คณะ
                            </Link>
                            <Link
                                href="/projects"
                                className="px-4 py-3 text-sm font-medium text-[rgb(var(--ios-text-primary))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                โครงการทั้งหมด
                            </Link>
                            <Link
                                href="/open-data"
                                className="px-4 py-3 text-sm font-medium text-[rgb(var(--ios-text-primary))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                ข้อมูลชุดเปิด (Open Data)
                            </Link>

                            <div className="my-2 h-px bg-[rgb(var(--ios-separator))]" />

                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[rgb(var(--ios-text-primary))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors">
                                    <LogIn className="w-4 h-4 text-[rgb(var(--ios-accent))]" />
                                    สำหรับเจ้าหน้าที่
                                </div>
                            </Link>

                            <Button
                                variant="secondary"
                                size="default"
                                className="mt-2 w-full justify-center gap-2"
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
