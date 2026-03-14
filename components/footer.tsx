import Link from 'next/link';
import { Database, Shield, BarChart3, Code2, MessageCircle, ExternalLink } from 'lucide-react';

export function Footer() {
    const year = new Date().getFullYear();

    const links = {
        explore: [
            { href: '/', label: 'หน้าหลัก' },
            { href: '/projects', label: 'โครงการทั้งหมด' },
            { href: '/organizations', label: 'หน่วยงาน / คณะ' },
        ],
        tools: [
            { href: '/tools/document-checker', label: 'ตรวจสอบเอกสารโครงการ', icon: Shield },
            { href: '/api-docs', label: 'API สำหรับนักพัฒนา', icon: Code2 },
        ],
        about: [
            { href: '/about', label: 'เกี่ยวกับโครงการ' },
            { href: '/login', label: 'สำหรับเจ้าหน้าที่' },
        ],
    };

    return (
        <footer className="border-t border-[rgb(var(--ios-separator))]/40 bg-[rgb(var(--ios-bg-secondary))] mt-8">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-[rgb(var(--ios-accent))]/10 rounded-[var(--ios-radius-sm)]">
                                <Database className="w-4 h-4 text-[rgb(var(--ios-accent))]" />
                            </div>
                            <span className="font-semibold text-base text-[rgb(var(--ios-text-primary))]">
                                TU <span className="text-[rgb(var(--ios-accent))]">Open Data</span>
                            </span>
                        </div>
                        <p className="text-xs text-[rgb(var(--ios-text-secondary))] leading-relaxed mb-4">
                            แพลตฟอร์มเปิดเผยข้อมูลงบประมาณ<br />
                            โครงการกิจกรรมนักศึกษา<br />
                            มหาวิทยาลัยธรรมศาสตร์
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] font-semibold px-2.5 py-1 bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-tertiary))] rounded-full">
                                CC BY
                            </span>
                            <span className="text-[10px] font-semibold px-2.5 py-1 bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-tertiary))] rounded-full">
                                Open Data
                            </span>
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))] mb-3">
                            สำรวจข้อมูล
                        </h4>
                        <ul className="space-y-2">
                            {links.explore.map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-accent))] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tools */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))] mb-3">
                            เครื่องมือ
                        </h4>
                        <ul className="space-y-2">
                            {links.tools.map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-1.5 text-sm text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-accent))] transition-colors"
                                    >
                                        <link.icon className="w-3.5 h-3.5" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))] mb-3">
                            เกี่ยวกับ
                        </h4>
                        <ul className="space-y-2">
                            {links.about.map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-accent))] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 pt-4 border-t border-[rgb(var(--ios-separator))]/40">
                            <p className="text-xs text-[rgb(var(--ios-text-tertiary))] leading-relaxed">
                                ข้อมูลจัดทำโดย<br />
                                สภานักศึกษามหาวิทยาลัยธรรมศาสตร์
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-6 border-t border-[rgb(var(--ios-separator))]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                        © {year} TU Open Data Initiative · มหาวิทยาลัยธรรมศาสตร์
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[rgb(var(--ios-text-tertiary))]">
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>ข้อมูลเปิด เพื่อความโปร่งใส</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
