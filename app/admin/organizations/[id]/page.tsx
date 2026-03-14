import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { OrganizationForm } from '@/components/admin/organization-form';

export default async function EditOrganizationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { id } = await params;
    const { data: organization, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !organization) notFound();

    return (
        <div>
            <div className="mb-6">
                <Link
                    href="/admin/organizations"
                    className="inline-flex items-center gap-1 text-sm text-[rgb(var(--ios-accent))] hover:underline mb-3"
                >
                    <ArrowLeft className="w-4 h-4" />
                    กลับ
                </Link>
                <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">
                    แก้ไของค์กร: {organization.name}
                </h1>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                    แก้ไขข้อมูลองค์กร ชมรม หรือหน่วยงาน
                </p>
            </div>

            <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 p-5">
                <OrganizationForm mode="edit" organization={organization} />
            </div>
        </div>
    );
}
