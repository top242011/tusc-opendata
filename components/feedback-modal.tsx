"use client";

import { useState } from 'react';
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { Loader2, CheckCircle, MessageCircle } from "lucide-react";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('feedback')
                .insert({
                    message: feedback,
                    email: email || null,
                    created_at: new Date().toISOString()
                });

            if (error) throw error;

            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setFeedback('');
                setEmail('');
            }, 2000);
        } catch (err) {
            console.error('Feedback submission error:', err);
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="แจ้งปัญหา / ข้อเสนอแนะ">
            {isSuccess ? (
                <div className="py-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800">ขอบคุณสำหรับข้อเสนอแนะ!</h3>
                    <p className="text-slate-500 mt-2">เราจะนำไปปรับปรุงระบบต่อไป</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="feedback">รายละเอียดปัญหาหรือข้อเสนอแนะ</Label>
                        <Textarea
                            id="feedback"
                            placeholder="เช่น พบข้อผิดพลาดในหน้า..., อยากให้เพิ่มฟีเจอร์..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">อีเมล (ไม่บังคับ)</Label>
                        <input
                            id="email"
                            type="email"
                            placeholder="หากต้องการให้เราติดต่อกลับ"
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !feedback.trim()}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    กำลังส่ง...
                                </>
                            ) : (
                                <>
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    ส่งข้อเสนอแนะ
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
