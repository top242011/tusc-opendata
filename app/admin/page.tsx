import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CsvUploader } from "@/components/csv-uploader";
import { AdminProjectTable } from "@/components/admin-project-table";
import { Project } from "@/lib/types";

export default async function AdminPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching projects:", error);
    }

    const projects = (projectsData || []) as Project[];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <nav className="bg-white border-b px-4 py-4 flex justify-between items-center mb-8">
                <div className="font-bold text-lg text-blue-900">Admin Dashboard</div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">{user.email}</span>
                    <form action={async () => {
                        "use server";
                        const supabase = await createClient();
                        await supabase.auth.signOut();
                        redirect('/login');
                    }}>
                        <button className="text-sm text-red-600 hover:text-red-700 font-medium">Logout</button>
                    </form>
                </div>
            </nav>

            <div className="container mx-auto max-w-6xl px-4">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2">Import Data</h1>
                    <CsvUploader />
                </div>

                <div>
                    <h1 className="text-2xl font-bold mb-2">Manage Data</h1>
                    <AdminProjectTable projects={projects} />
                </div>
            </div>
        </div>
    );
}
