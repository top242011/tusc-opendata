import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { BudgetCategoriesManager } from './budget-categories-manager';

export default async function BudgetCategoriesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: categories } = await supabase
        .from('budget_categories')
        .select('*')
        .order('sort_order', { ascending: true });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">หมวดงบประมาณ</h1>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                    จัดการรายการหมวดงบประมาณ อัตราสูงสุด และหน่วยนับ
                </p>
            </div>

            <BudgetCategoriesManager initialCategories={categories || []} />
        </div>
    );
}
