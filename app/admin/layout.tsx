import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminNavbar } from "@/components/admin-navbar";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/admin-sidebar";
import { ContextualHelpButton } from "@/components/admin/contextual-help-panel";
import { OnboardingTour } from "@/components/admin/onboarding-tour";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-[rgb(var(--ios-bg-grouped))]">
            {/* Top navbar */}
            <AdminNavbar userEmail={user?.email} />

            {/* Sidebar + content */}
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 min-h-[calc(100vh-3.5rem)] pb-20 lg:pb-8">
                    <div className="container mx-auto max-w-6xl px-4 py-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile bottom nav */}
            <AdminMobileNav />

            {/* Help & Onboarding */}
            <ContextualHelpButton />
            <OnboardingTour />
        </div>
    );
}
