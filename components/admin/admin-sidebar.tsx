"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FolderOpen,
    Building2,
    Wallet,
    Upload,
    History,
    FileText,
    PenSquare,
    FileWarning,
    Clock,
    Settings,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Home,
    BarChart3,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
    {
        title: '',
        items: [
            { label: 'แดชบอร์ด', href: '/admin', icon: LayoutDashboard },
            { label: 'วิเคราะห์ข้อมูล', href: '/admin/analytics', icon: BarChart3 },
        ],
    },
    {
        title: 'เนื้อหา',
        items: [
            { label: 'โครงการ', href: '/admin/projects', icon: FolderOpen },
            { label: 'องค์กร', href: '/admin/organizations', icon: Building2 },
            { label: 'หมวดงบประมาณ', href: '/admin/budget-categories', icon: Wallet },
        ],
    },
    {
        title: 'นำเข้าข้อมูล',
        items: [
            { label: 'นำเข้าข้อมูล', href: '/admin/import', icon: Upload },
            { label: 'ประวัติการนำเข้า', href: '/admin/import/history', icon: History },
        ],
    },
    {
        title: 'ไฟล์และเอกสาร',
        items: [
            { label: 'จัดการไฟล์', href: '/admin/files', icon: FileText },
            { label: 'แก้ไขหน้าเว็บ', href: '/admin/pages', icon: PenSquare },
        ],
    },
    {
        title: 'ระบบ',
        items: [
            { label: 'เรื่องร้องเรียน', href: '/admin/complaints', icon: FileWarning },
            { label: 'ประวัติกิจกรรม', href: '/admin/activity-logs', icon: Clock },
            { label: 'ตั้งค่า', href: '/admin/settings', icon: Settings },
            { label: 'คู่มือการใช้งาน', href: '/admin/docs', icon: BookOpen },
        ],
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={`
                hidden lg:flex flex-col
                ${collapsed ? 'w-16' : 'w-60'}
                min-h-[calc(100vh-3.5rem)]
                bg-[rgb(var(--ios-bg-primary))]
                border-r border-[rgb(var(--ios-separator))]/50
                transition-all duration-200
            `}
        >
            {/* Collapse toggle */}
            <div className="flex justify-end p-2">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-[var(--ios-radius-sm)] hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors text-[rgb(var(--ios-text-tertiary))]"
                    aria-label={collapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-2 pb-4">
                {NAV_GROUPS.map((group, gi) => (
                    <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
                        {group.title && !collapsed && (
                            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))]">
                                {group.title}
                            </p>
                        )}
                        {group.title && collapsed && gi > 0 && (
                            <div className="mx-3 my-2 border-t border-[rgb(var(--ios-separator))]/30" />
                        )}
                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            title={collapsed ? item.label : undefined}
                                            className={`
                                                flex items-center gap-3
                                                ${collapsed ? 'justify-center px-2' : 'px-3'}
                                                py-2 rounded-[var(--ios-radius-sm)]
                                                text-sm font-medium
                                                transition-colors ios-press
                                                ${active
                                                    ? 'bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))]'
                                                    : 'text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))] hover:text-[rgb(var(--ios-text-primary))]'
                                                }
                                            `}
                                        >
                                            <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-[rgb(var(--ios-accent))]' : ''}`} />
                                            {!collapsed && <span>{item.label}</span>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Back to public site */}
            <div className="p-2 border-t border-[rgb(var(--ios-separator))]/30">
                <Link
                    href="/"
                    className={`
                        flex items-center gap-3
                        ${collapsed ? 'justify-center px-2' : 'px-3'}
                        py-2 rounded-[var(--ios-radius-sm)]
                        text-sm font-medium
                        text-[rgb(var(--ios-text-tertiary))]
                        hover:bg-[rgb(var(--ios-fill-tertiary))]
                        hover:text-[rgb(var(--ios-text-secondary))]
                        transition-colors ios-press
                    `}
                >
                    <Home className="w-[18px] h-[18px] flex-shrink-0" />
                    {!collapsed && <span>กลับหน้าหลัก</span>}
                </Link>
            </div>
        </aside>
    );
}

// Mobile bottom navigation
export function AdminMobileNav() {
    const pathname = usePathname();

    const mobileItems: NavItem[] = [
        { label: 'แดชบอร์ด', href: '/admin', icon: LayoutDashboard },
        { label: 'โครงการ', href: '/admin/projects', icon: FolderOpen },
        { label: 'นำเข้า', href: '/admin/import', icon: Upload },
        { label: 'ร้องเรียน', href: '/admin/complaints', icon: FileWarning },
        { label: 'เพิ่มเติม', href: '/admin/settings', icon: Settings },
    ];

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 ios-material-thick border-t border-[rgb(var(--ios-separator))]/50">
            <div className="flex items-center justify-around h-14">
                {mobileItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex flex-col items-center gap-0.5 py-1 px-3
                                text-[10px] font-medium transition-colors ios-press
                                ${active
                                    ? 'text-[rgb(var(--ios-accent))]'
                                    : 'text-[rgb(var(--ios-text-tertiary))]'
                                }
                            `}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
