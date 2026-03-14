import { NextRequest, NextResponse } from 'next/server';
import { executeBatchImport } from '@/lib/import-batch-actions';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { rows, fiscalYear, campus, fileName } = body;

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ success: false, error: 'ไม่มีข้อมูลที่จะนำเข้า' }, { status: 400 });
        }

        const result = await executeBatchImport({
            rows,
            fiscalYear,
            campus,
            fileName,
        });

        return NextResponse.json(result, { status: result.success ? 200 : 500 });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
