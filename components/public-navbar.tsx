import Link from 'next/link';
import { Shield, ExternalLink, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PublicNavbar() {
    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50" aria-label="Main Navigation">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group" aria-label="หน้าหลัก TU Open Data">
                    <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-slate-900 text-lg tracking-tight">
                        TU <span className="text-blue-600">Open Data</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                        หน้าหลัก
                    </Link>
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
                    <Link href="https://github.com/tu-student-council" target="_blank">
                        <Button variant="outline" size="sm" className="gap-2">
                            <ExternalLink className="w-4 h-4" />
                            <span className="hidden sm:inline">Feedback</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
