'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, Code } from 'lucide-react';
import { updateCmsPage } from '@/lib/cms-actions';

interface Props {
    slug: string;
    initialTitle: string;
    initialContent: string;
}

export function CmsPageEditor({ slug, initialTitle, initialContent }: Props) {
    const router = useRouter();
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [preview, setPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        setSaved(false);

        const result = await updateCmsPage(slug, { title, content });

        setLoading(false);
        if ('error' in result && result.error) {
            setError(result.error);
        } else {
            setSaved(true);
            router.refresh();
            setTimeout(() => setSaved(false), 3000);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-3 rounded-[var(--ios-radius)] bg-[rgb(var(--ios-red))]/5 border border-[rgb(var(--ios-red))]/20">
                    <p className="text-sm text-[rgb(var(--ios-red))]">{error}</p>
                </div>
            )}

            {saved && (
                <div className="p-3 rounded-[var(--ios-radius)] bg-[rgb(var(--ios-green))]/5 border border-[rgb(var(--ios-green))]/20">
                    <p className="text-sm text-[rgb(var(--ios-green))]">บันทึกสำเร็จ</p>
                </div>
            )}

            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-[rgb(var(--ios-text-secondary))] mb-1.5">ชื่อหน้า</label>
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ios-accent))]/30"
                />
            </div>

            {/* Editor Toggle */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setPreview(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--ios-radius-sm)] transition-colors ${
                        !preview
                            ? 'bg-[rgb(var(--ios-accent))] text-white'
                            : 'text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]'
                    }`}
                >
                    <Code className="w-3.5 h-3.5" />
                    แก้ไข
                </button>
                <button
                    onClick={() => setPreview(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--ios-radius-sm)] transition-colors ${
                        preview
                            ? 'bg-[rgb(var(--ios-accent))] text-white'
                            : 'text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]'
                    }`}
                >
                    <Eye className="w-3.5 h-3.5" />
                    ตัวอย่าง
                </button>
            </div>

            {/* Content Area */}
            {preview ? (
                <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 p-6 min-h-[400px] prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: simpleMarkdown(content) }} />
                </div>
            ) : (
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={20}
                    className="w-full px-4 py-3 text-sm font-mono rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))] resize-y focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ios-accent))]/30"
                    placeholder="เขียนเนื้อหาด้วย Markdown..."
                />
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-5 py-2.5 text-sm font-semibold rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white hover:opacity-90 disabled:opacity-40 ios-press"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'บันทึก'}
                </button>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]"
                >
                    ยกเลิก
                </button>
            </div>

            <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                รองรับ: # หัวข้อ, **ตัวหนา**, *ตัวเอียง*, - รายการ, [ลิงก์](url), `โค้ด`
            </p>
        </div>
    );
}

// Simple markdown to HTML for preview (server-side rendering uses a proper library)
function simpleMarkdown(md: string): string {
    return md
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}
