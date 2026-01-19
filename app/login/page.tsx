"use client";

import { useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // If login fails, check if we should allow a "mock" access for demo purposes?
            // Requirement said "Authentication: Login ง่ายๆ (หรือ Mock Login)".
            // If Supabase auth fails (e.g. no user), we might want to fallback to a hardcoded demo user if requested.
            // But for "Production Ready" prompt, Supabase Auth is better.
            // I will stick to real auth error.
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/admin');
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-slate-100 p-3 rounded-full w-fit mb-4">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">เข้าสู่ระบบผู้ดูแล</CardTitle>
                    <CardDescription>กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบจัดการ</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md flex items-center gap-2">
                                <span className="font-medium">ผิดพลาด:</span> {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">อีเมล</label>
                            <input
                                type="email"
                                required
                                className="w-full h-10 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">รหัสผ่าน</label>
                            <input
                                type="password"
                                required
                                className="w-full h-10 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm hover:shadow"
                        >
                            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
