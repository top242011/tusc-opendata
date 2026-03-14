'use client';

import { useState } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { DOCS_SECTIONS } from '@/lib/admin-docs-content';

export default function AdminDocsPage() {
    const [activeSection, setActiveSection] = useState(DOCS_SECTIONS[0].id);

    const current = DOCS_SECTIONS.find(s => s.id === activeSection) || DOCS_SECTIONS[0];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">คู่มือการใช้งาน</h1>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                    เอกสารแนะนำการใช้งานระบบจัดการ TU Open Data สำหรับแอดมิน
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* TOC Sidebar */}
                <nav className="lg:w-64 flex-shrink-0">
                    <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden lg:sticky lg:top-6">
                        <div className="px-4 py-3 border-b border-[rgb(var(--ios-separator))]/30">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--ios-text-primary))]">
                                <BookOpen className="w-4 h-4" />
                                สารบัญ
                            </div>
                        </div>
                        <div className="p-2">
                            {DOCS_SECTIONS.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--ios-radius-sm)] transition-colors ${
                                        activeSection === section.id
                                            ? 'bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] font-medium'
                                            : 'text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]'
                                    }`}
                                >
                                    <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-transform ${
                                        activeSection === section.id ? 'rotate-90' : ''
                                    }`} />
                                    <span className="truncate">{section.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 p-6">
                        <h2 className="text-xl font-bold text-[rgb(var(--ios-text-primary))] mb-4">
                            {current.title}
                        </h2>
                        <div className="prose prose-sm max-w-none">
                            {current.content.split('\n').map((line, i) => {
                                if (line.startsWith('**Q:')) {
                                    return <p key={i} className="font-semibold text-[rgb(var(--ios-text-primary))] mt-4 mb-1">{renderBold(line)}</p>;
                                }
                                if (line.startsWith('A:')) {
                                    return <p key={i} className="text-sm text-[rgb(var(--ios-text-secondary))] mb-3 pl-4">{line.slice(3)}</p>;
                                }
                                if (line.startsWith('**') && line.endsWith('**')) {
                                    return <h3 key={i} className="text-base font-semibold text-[rgb(var(--ios-text-primary))] mt-5 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                                }
                                if (line.startsWith('- **')) {
                                    const match = line.match(/^- \*\*(.+?)\*\* — (.+)$/);
                                    if (match) {
                                        return (
                                            <div key={i} className="flex gap-2 text-sm pl-4 py-0.5">
                                                <span className="font-medium text-[rgb(var(--ios-text-primary))]">{match[1]}</span>
                                                <span className="text-[rgb(var(--ios-text-tertiary))]">—</span>
                                                <span className="text-[rgb(var(--ios-text-secondary))]">{match[2]}</span>
                                            </div>
                                        );
                                    }
                                }
                                if (line.startsWith('- ')) {
                                    return <div key={i} className="flex gap-2 text-sm text-[rgb(var(--ios-text-secondary))] pl-4 py-0.5">
                                        <span className="text-[rgb(var(--ios-text-tertiary))]">•</span>
                                        {renderBold(line.slice(2))}
                                    </div>;
                                }
                                if (/^\d+\. /.test(line)) {
                                    return <div key={i} className="flex gap-2 text-sm text-[rgb(var(--ios-text-secondary))] pl-4 py-0.5">
                                        <span className="text-[rgb(var(--ios-accent))] font-medium flex-shrink-0">{line.match(/^\d+/)?.[0]}.</span>
                                        {renderBold(line.replace(/^\d+\.\s*/, ''))}
                                    </div>;
                                }
                                if (line.trim() === '') return <div key={i} className="h-2" />;
                                return <p key={i} className="text-sm text-[rgb(var(--ios-text-secondary))] leading-relaxed">{renderBold(line)}</p>;
                            })}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-4">
                        {(() => {
                            const idx = DOCS_SECTIONS.findIndex(s => s.id === activeSection);
                            const prev = idx > 0 ? DOCS_SECTIONS[idx - 1] : null;
                            const next = idx < DOCS_SECTIONS.length - 1 ? DOCS_SECTIONS[idx + 1] : null;
                            return (
                                <>
                                    {prev ? (
                                        <button
                                            onClick={() => setActiveSection(prev.id)}
                                            className="text-sm text-[rgb(var(--ios-accent))] hover:underline"
                                        >
                                            ← {prev.title}
                                        </button>
                                    ) : <div />}
                                    {next ? (
                                        <button
                                            onClick={() => setActiveSection(next.id)}
                                            className="text-sm text-[rgb(var(--ios-accent))] hover:underline"
                                        >
                                            {next.title} →
                                        </button>
                                    ) : <div />}
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}

function renderBold(text: string) {
    const parts = text.split(/(\*\*.+?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-[rgb(var(--ios-text-primary))]">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
    });
}
