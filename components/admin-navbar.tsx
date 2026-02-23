"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { useTheme } from '@/components/theme-provider';
import { Moon, Sun, LogOut, Home, FileWarning, Clock } from 'lucide-react';

interface AdminNavbarProps {
    userEmail?: string;
}

export function AdminNavbar({ userEmail }: AdminNavbarProps) {
    const router = useRouter();
    const supabase = createClient();
    const { resolvedTheme, setTheme } = useTheme();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

    return (
        <nav className="sticky top-0 z-30 ios-material-thick border-b border-[rgb(var(--ios-separator))]/50 transition-colors duration-200">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                {/* Left Side */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin"
                        className="font-bold text-lg text-[rgb(var(--ios-accent))] hover:opacity-80 transition-opacity ios-press"
                    >
                        ระบบจัดการข้อมูล
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1 ml-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors ios-press"
                        >
                            <Home className="w-4 h-4" />
                            กลับหน้าหลัก
                        </Link>
                        <Link
                            href="/admin/complaints"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors ios-press"
                        >
                            <FileWarning className="w-4 h-4" />
                            จัดการข้อร้องเรียน
                        </Link>
                        <Link
                            href="/admin/activity-logs"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors ios-press"
                        >
                            <Clock className="w-4 h-4" />
                            ประวัติการใช้งาน
                        </Link>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {/* Mobile Links */}
                    <div className="md:hidden flex gap-2 text-xs font-medium">
                        <Link
                            href="/"
                            className="flex items-center gap-1 px-2 py-1.5 text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors"
                        >
                            <Home className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                            href="/admin/complaints"
                            className="flex items-center gap-1 px-2 py-1.5 text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors"
                        >
                            <FileWarning className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                            href="/admin/activity-logs"
                            className="flex items-center gap-1 px-2 py-1.5 text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] transition-colors"
                        >
                            <Clock className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-[rgb(var(--ios-fill-tertiary))] hover:bg-[rgb(var(--ios-fill-secondary))] transition-colors ios-press"
                        aria-label={resolvedTheme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
                    >
                        {resolvedTheme === 'dark' ? (
                            <Sun className="w-4 h-4 text-[rgb(var(--ios-orange))]" />
                        ) : (
                            <Moon className="w-4 h-4 text-[rgb(var(--ios-indigo))]" />
                        )}
                    </button>

                    {/* User Email */}
                    {userEmail && (
                        <span className="text-sm text-[rgb(var(--ios-text-secondary))] hidden sm:inline-block max-w-[150px] truncate">
                            {userEmail}
                        </span>
                    )}

                    {/* Sign Out Button */}
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[rgb(var(--ios-red))] hover:bg-[rgb(var(--ios-red))]/10 rounded-[var(--ios-radius-sm)] transition-colors ios-press"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">ออกจากระบบ</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
