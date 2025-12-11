'use server';

import { GoogleGenAI } from '@google/genai';
import * as XLSX from 'xlsx';

export async function parseBudgetExcel(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file uploaded');

        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });

        // Assume the first sheet is the relevant one or try to guess?
        // For simplicity V1, take first sheet.
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to CSV to verify structure with Gemini
        // We limit rows to avoid massive token usage? 
        // Or just pass the whole thing if it's "Summary"? 
        // Let's pass the CSV string.
        const csvContent = XLSX.utils.sheet_to_csv(sheet);

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        // Use requested model
        const model = 'gemini-2.5-flash-lite';

        const prompt = `
            You are a Data Analyst. Your task is to extract project budget information from the provided CSV data (converted from an Excel file).
            
            Analyze the columns to identify:
            - Organization / Department Name
            - Project Name
            - Requested Budget
            - Approved Budget
            - Average Budget (if available)
            - Notes (if available)

            Ignore summary rows (Total/Grand Total) or empty rows.
            
            Return ONLY a valid JSON array of objects.
            Format:
            [
                {
                    "organization": string,
                    "project_name": string,
                    "budget_requested": number,
                    "budget_approved": number,
                    "budget_average": number | null,
                    "notes": string | null
                }
            ]
        `;

        const result = await ai.models.generateContent({
            model,
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { text: `CSV Data:\n${csvContent}` }
                    ]
                }
            ]
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(jsonStr);
            return { success: true, data };
        } catch (e) {
            console.error("JSON Parse Error (Excel):", text);
            return { success: false, error: "Failed to parse AI response for Excel" };
        }

    } catch (error) {
        console.error("Excel Parse Error:", error);
        return { success: false, error: "Failed to process Excel file" };
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
      2. organization: The name of the organization/club/unit responsible. (String)
      3. budget_requested: The total budget amount requested. (Number)
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
