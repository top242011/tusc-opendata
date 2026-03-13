"use client";

import { useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/admin');
            router.refresh();
        }
    };

    return (
        <main id="main-content" className="min-h-screen flex items-center justify-center bg-[rgb(var(--ios-bg-primary))] p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-[rgb(var(--ios-fill-tertiary))] p-3 rounded-full w-fit mb-4">
                        <Shield className="w-8 h-8 text-[rgb(var(--ios-accent))]" />
                    </div>
                    <CardTitle className="text-xl">เข้าสู่ระบบผู้ดูแล</CardTitle>
                    <CardDescription>กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบจัดการ</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-[rgb(var(--ios-red))]/10 text-[rgb(var(--ios-red))] text-sm p-3 rounded-[var(--ios-radius-sm)] flex items-center gap-2" role="alert">
                                <span className="font-medium">ผิดพลาด:</span> {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--ios-text-primary))]">อีเมล</label>
                            <Input
                                type="email"
                                required
                                className="w-full h-11 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-[rgb(var(--ios-text-primary))]">รหัสผ่าน</label>
                                <button
                                    type="button"
                                    className="text-xs text-[rgb(var(--ios-accent))] hover:underline"
                                    onClick={() => {/* TODO: forgot password flow */}}
                                >
                                    ลืมรหัสผ่าน?
                                </button>
                            </div>
                            <Input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full h-11 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                suffixIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="p-0.5 hover:text-[rgb(var(--ios-text-primary))] transition-colors"
                                        aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                }
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm hover:shadow"
                        >
                            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
