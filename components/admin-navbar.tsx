"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";

interface AdminNavbarProps {
    userEmail?: string;
}

export function AdminNavbar({ userEmail }: AdminNavbarProps) {
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <nav className="bg-white border-b px-4 py-4 flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sm:gap-0 sticky top-0 z-30">
            <div className="flex items-center gap-6">
                <Link href="/admin" className="font-bold text-lg text-blue-900 hover:text-blue-800">
                    ระบบจัดการข้อมูล
                </Link>
                <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                    <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors">
                        กลับหน้าหลัก
                    </Link>
                    <Link href="/admin/complaints" className="text-slate-500 hover:text-blue-600 transition-colors">
                        จัดการข้อร้องเรียน
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                {/* Mobile Links */}
                <div className="md:hidden flex gap-3 text-xs font-medium">
                    <Link href="/" className="text-slate-500">หน้าหลัก</Link>
                    <Link href="/admin/complaints" className="text-slate-500">ข้อร้องเรียน</Link>
                </div>

                <div className="flex items-center gap-4">
                    {userEmail && <span className="text-sm text-slate-500 hidden sm:inline-block">{userEmail}</span>}
                    <button
                        onClick={handleSignOut}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                        ออกจากระบบ
                    </button>
                </div>
            </div>
        </nav>
    );
}
