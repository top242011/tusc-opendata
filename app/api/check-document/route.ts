import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import * as XLSX from 'xlsx';
import budgetRulesCentral from '@/lib/data/budget-rules.json';
import budgetRulesLampang from '@/lib/data/budget-rules-lampang.json';

export async function POST(request: NextRequest) {
    try {
        // Create Supabase client with service role key for storage operations
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json(
                { success: false, error: 'Server configuration error: Missing Supabase credentials' },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const body = await request.json();
        const { storagePath, fileName, campus } = body;

        if (!storagePath || !fileName) {
            return NextResponse.json(
                { success: false, error: 'Missing storagePath or fileName' },
                { status: 400 }
            );
        }

        // Select appropriate budget rules based on campus
        const rules = campus === 'lampang' ? budgetRulesLampang : budgetRulesCentral;

        // Download file from Supabase Storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('temp-documents')
            .download(storagePath);

        if (downloadError || !fileData) {
            console.error('Download error:', downloadError);
            return NextResponse.json(
                { success: false, error: 'Failed to download file from storage' },
                { status: 500 }
            );
        }

        // Convert Blob to ArrayBuffer
        const arrayBuffer = await fileData.arrayBuffer();
        let contentForAI = '';
        const isPDF = fileName.endsWith('.pdf');
        const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

        // Handle different file types
        if (isExcel) {
            const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            contentForAI = XLSX.utils.sheet_to_csv(sheet);
        } else if (isPDF) {
            // For PDF we send base64
            const base64Data = Buffer.from(arrayBuffer).toString('base64');
            contentForAI = base64Data;
        } else {
            // Cleanup and return error
            await supabase.storage.from('temp-documents').remove([storagePath]);
            return NextResponse.json(
                { success: false, error: 'Unsupported file format' },
                { status: 400 }
            );
        }

        // Initialize Gemini AI
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const model = 'gemini-2.5-flash-lite';

        const prompt = `
            You are an expert Auditor for Student Activity Budget at Thammasat University.
            
            Your task is to audit the provided project document (PDF or Excel/CSV) against the official Budget Regulations provided below.
            
            OFFICIAL BUDGET RULES (JSON):
            ${JSON.stringify(rules, null, 2)}
            
            INSTRUCTIONS:
            1. Analyze the expenses and details in the document.
            2. Compare EACH item against the relevant rule.
            3. Check for:
               - Rate limits (e.g., Accommodation max 450 THB)
               - Conditions (e.g., must have 2 quotes if > 50k)
               - Prohibited items
            
            Return a JSON object with this structure:
            {
                "overall_status": "PASS" | "WARN" | "FAIL",
                "summary": "Brief summary of the check result (Thai)",
                "items": [
                    {
                        "category": "Rule Category Name (e.g., ค่าที่พัก)",
                        "status": "PASS" | "WARN" | "FAIL",
                        "description": "Details of the item found",
                        "issue": "Explanation of why it failed or warned (or null if pass)",
                        "suggestion": "How to fix it (Thai)"
                    }
                ]
            }
            
            Return ONLY valid JSON.
        `;

        const parts: any[] = [{ text: prompt }];

        if (isPDF) {
            parts.push({
                inlineData: {
                    mimeType: 'application/pdf',
                    data: contentForAI
                }
            });
        } else {
            // CSV/Text
            parts.push({ text: `DOCUMENT CONTENT:\n${contentForAI}` });
        }

        const result = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts }]
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Cleanup: Delete temp file from storage
        await supabase.storage.from('temp-documents').remove([storagePath]);

        try {
            const data = JSON.parse(jsonStr);
            return NextResponse.json({ success: true, data });
        } catch (e) {
            console.error("JSON Parse Error (Check):", text);
            return NextResponse.json(
                { success: false, error: "AI failed to validate document structure" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Document Check Error:", error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
