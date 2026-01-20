'use server';

import { GoogleGenAI } from '@google/genai';
import * as XLSX from 'xlsx';

export async function parseBudgetExcel(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file uploaded');

        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to CSV for AI analysis
        const csvContent = XLSX.utils.sheet_to_csv(sheet);

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        // Use a smarter model for complex structure analysis
        const model = 'gemini-2.5-flash-lite';

        console.log(`[Gemini] Processing Excel with model: ${model}`);

        const prompt = `
            You are an expert Data Analyst processing a Thai Government Budget Excel file.
            
            Your task is to extracting all project items from the CSV data provided below.
            
            Key Instructions:
            1. **Identify the exact column headers** from the original file (e.g. "ลำดับ", "ชื่อโครงการ", "งบที่ขอ", "หน่วยงาน").
            2. **Extract every single project row**:
               - Ignore summary rows (rows with "รวม", "Total", "Grand Total").
               - Ignore header rows or informational rows at the top.
               - Handle merged cells contextually if possible (though CSV flattens them, look for pattern).
            3. **Map data to standard fields** where possible, but keep specific raw values.
            
            Standard Fields to Map:
            - project_name: The name of the project/activity (NOT the organization).
            - organization: The student organization/club responsible.
            - budget_requested: The requested amount (number).
            - budget_approved: The approved amount (number).
            - notes: Any remarks.
            
            Return a JSON object with this structure:
            {
                "detected_columns": ["Column A Name", "Column B Name", ...],
                "items": [
                    {
                        "project_name": "Project Name",
                        "organization": "Org Name",
                        "budget_requested": 10000,
                        "budget_approved": 10000,
                        "notes": "...",
                        "raw_data": { 
                            "Column A Name": "Value",
                            "Column B Name": "Value" 
                        }
                    }
                ]
            }
            
            Return ONLY valid JSON.
        `;

        const result = await ai.models.generateContent({
            model,
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { text: `CSV Content (truncated first 100 lines):\n${csvContent.split('\n').slice(0, 100).join('\n')}` }
                    ]
                }
            ]
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(jsonStr);

            if (!data.items || !Array.isArray(data.items)) {
                throw new Error("Invalid AI response structure");
            }

            console.log(`[Gemini] Extracted ${data.items.length} items with columns:`, data.detected_columns);

            return {
                success: true,
                data: data.items,
                columns: data.detected_columns // Return the dynamic columns found
            };
        } catch (e) {
            console.error("JSON Parse Error (AI Excel):", text);
            return { success: false, error: "AI failed to extract structured data from Excel" };
        }

    } catch (error) {
        console.error("Excel Parse Error:", error);
        return { success: false, error: "Failed to process Excel file: " + (error as Error).message };
    }
}

export async function parseProjectPDF(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            throw new Error('No file uploaded');
        }

        const arrayBuffer = await file.arrayBuffer();
        // Convert to base64 for Gemini
        const base64Data = Buffer.from(arrayBuffer).toString('base64');

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        // Use requested model
        const model = 'gemini-2.5-flash-lite';
        console.log(`[Gemini] Processing file with model: ${model}`);

        // System instruction to act as Data Entry Clerk
        // We embed it in the prompt or config if supported, but typically prompt is fine.
        const prompt = `
      You are a precise Data Entry Clerk. Your task is to extract specific project information from the attached PDF document.
      
      Extract the following fields and return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.
      
      Fields to extract:
      1. project_name: The full name of the project. (String)
      2. fiscal_year: The Buddhist Era year mentioned (e.g., 2567, 2568). (Number)
      3. organization: The name of the organization/club/unit responsible. (String)
      4. budget_requested: The total budget amount requested. (Number)
      4. responsible_person: Name, faculty, phone of the student responsible. (String)
      5. advisor: Name and phone of the advisor. (String)
      6. activity_type: The type of activity checked/selected in the form. (String)
      7. rationale: Full text of "Principles and Rationale". (String)
      8. objectives: List of "Objectives" as an array of strings. (Array of Strings)
      9. targets: Text describing the targets/indicators. (String)
      10. sdg_goals: List of SDG goals mentioned (e.g., "SDG 4"). (Array of Strings)
      11. budget_breakdown: Table of expenses. Parse rows into objects: { "item": string, "amount": number (quantity), "unit": string, "cost_per_unit": number, "total": number }. (Array of Objects)

      If a field is not found, use null or empty string/array as appropriate.
    `;

        const contents = [
            {
                role: 'user',
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: file.type || 'application/pdf',
                            data: base64Data,
                        },
                    },
                ],
            },
        ];

        const config = {
            thinkingConfig: {
                thinkingBudget: 0,
            },
        };

        const result = await ai.models.generateContent({
            model,
            config,
            contents,
        });

        // Access text from candidates directly as fallback or primary method
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Clean up if markdown is present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(jsonStr);
            return { success: true, data };
        } catch (e) {
            console.error("JSON Parse Error:", text);
            return { success: false, error: "Failed to parse AI response" };
        }

    } catch (error) {
        console.error("AI Parse Error:", error);
        return { success: false, error: "Failed to process document" };
    }
}

export async function checkProjectDocument(formData: FormData, rules: any) {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file uploaded');

        const arrayBuffer = await file.arrayBuffer();
        let contentForAI = '';
        let mimeType = file.type;

        // Handle different file types
        if (file.name.endsWith('.xlsx')) {
            const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            contentForAI = XLSX.utils.sheet_to_csv(sheet);
            mimeType = 'text/csv'; // Treat as CSV for prompt simplicity or text
        } else if (file.type === 'application/pdf') {
            // For PDF we send base64
            const base64Data = Buffer.from(arrayBuffer).toString('base64');
            contentForAI = base64Data;
        } else {
            throw new Error('Unsupported file format');
        }

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

        if (file.type === 'application/pdf') {
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

        try {
            const data = JSON.parse(jsonStr);
            return { success: true, data };
        } catch (e) {
            console.error("JSON Parse Error (Check):", text);
            return { success: false, error: "AI failed to validate document structure" };
        }

    } catch (error) {
        console.error("Document Check Error:", error);
        return { success: false, error: (error as Error).message };
    }
}
