"use client";

import { useState } from 'react';
import Papa from 'papaparse';
import { createClient } from "@/utils/supabase/client";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CsvUploader() {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const supabase = createClient();

    // Helper to parse currency string "฿1,000,000.00" -> 1000000.00
    const parseCurrency = (val: string) => {
        if (!val) return 0;
        // Remove ฿, commas, and whitespace
        const cleaned = val.toString().replace(/[฿,]/g, '').trim();
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage(null);

        Papa.parse(file, {
            header: false,
            skipEmptyLines: true, // This handles completely empty lines
            complete: async (results) => {
                try {
                    const rows = results.data as string[][];
                    const projectsToInsert: any[] = [];
                    let currentOrg = '';

                    // Iterate through rows
                    // We assume Row 1 (index 1) is header based on analysis "ที่,ชื่อองค์กร..."
                    // But purely robust: skip until we find a numeric index in col 0 OR explicit project data

                    let isHeaderFound = false;

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];

                        // Safety check for row length
                        if (row.length < 5) continue;

                        const col0 = row[0]?.trim(); // Organization
                        const col1 = row[1]?.trim(); // Project Name
                        const col2 = row[2]?.trim(); // Budget Requested
                        const col3 = row[3]?.trim(); // Budget Approved
                        const col4 = row[4]?.trim(); // Budget Average
                        const col8 = row[8]?.trim(); // Notes

                        // Identify Header Row if not found
                        if (!isHeaderFound) {
                            if (col0 === 'ชื่อองค์กร' || col1 === 'ชื่อโครงการ') {
                                isHeaderFound = true;
                                continue;
                            }
                        }

                        if (!isHeaderFound) continue;

                        // Stop condition or Summary row
                        if (col1?.includes('ยอดรวม') || col0?.includes('ยอดรวม')) {
                            continue;
                        }

                        // Update Organization Context
                        if (col0 && col0 !== '') {
                            currentOrg = col0;
                        }

                        // Identify Valid Project Row
                        if (!col1 || col1 === '') continue;

                        // If budgets are empty, skip
                        if ((!col2 || col2 === '') && (!col3 || col3 === '')) continue;

                        // Parse budgets
                        const budget_requested = parseCurrency(col2);
                        const budget_approved = parseCurrency(col3);
                        const budget_average = parseCurrency(col4);

                        projectsToInsert.push({
                            organization: currentOrg || 'Unknown Organization',
                            project_name: col1,
                            fiscal_year: 2568,
                            budget_requested,
                            budget_approved,
                            budget_average: isNaN(budget_average) ? null : budget_average,
                            notes: col8 || null,
                            is_published: true
                        });
                    }

                    if (projectsToInsert.length === 0) {
                        throw new Error("No valid data found in CSV. Please check the file format.");
                    }

                    const { error } = await supabase.from('projects').insert(projectsToInsert);

                    if (error) throw error;

                    setMessage({ type: 'success', text: `Successfully imported ${projectsToInsert.length} projects.` });
                    setTimeout(() => window.location.reload(), 1500);

                } catch (err: any) {
                    console.error(err);
                    setMessage({ type: 'error', text: err.message || "Upload failed" });
                } finally {
                    setUploading(false);
                    e.target.value = '';
                }
            },
            error: (err: any) => {
                setUploading(false);
                setMessage({ type: 'error', text: "Failed to parse CSV file." });
            }
        });
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Import Project Data (CSV)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-10 bg-slate-50 hover:bg-slate-100 transition-colors relative">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />

                    {uploading ? (
                        <div className="text-slate-500 flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                            <span>Processing CSV...</span>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                            <p className="text-xs text-slate-500 mt-1">CSV format: Organization (Col 1), Project (Col 4), Requested (Col 5), Approved (Col 6)</p>
                        </div>
                    )}
                </div>

                {message && (
                    <div className={`mt-4 p-3 rounded-md flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {message.text}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
