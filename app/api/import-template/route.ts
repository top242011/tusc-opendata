import { generateImportTemplate } from '@/lib/generate-template';

export async function GET() {
    const buffer = await generateImportTemplate();

    return new Response(new Uint8Array(buffer), {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="TU-OpenData-Import-Template.xlsx"',
        },
    });
}
