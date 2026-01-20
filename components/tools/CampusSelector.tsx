"use client";

import { cn } from '@/utils/cn';
import { Building2, MapPin } from 'lucide-react';

export type CampusType = 'central' | 'lampang';

interface CampusSelectorProps {
    selectedCampus: CampusType;
    onCampusChange: (campus: CampusType) => void;
    disabled?: boolean;
}

const campusOptions = [
    {
        id: 'central' as CampusType,
        name: 'ส่วนกลาง / รังสิต / ท่าพระจันทร์',
        description: 'หลักเกณฑ์งบประมาณกิจกรรมนักศึกษา องค์การนักศึกษา',
        icon: Building2,
    },
    {
        id: 'lampang' as CampusType,
        name: 'ศูนย์ลำปาง',
        description: 'หลักเกณฑ์ตามประกาศศูนย์ลำปาง พ.ศ. 2567',
        icon: MapPin,
    },
];

export default function CampusSelector({
    selectedCampus,
    onCampusChange,
    disabled = false,
}: CampusSelectorProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedCampus === option.id;

                return (
                    <button
                        key={option.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onCampusChange(option.id)}
                        className={cn(
                            "relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all",
                            "hover:border-blue-400 hover:bg-blue-50/50",
                            isSelected
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-slate-200 bg-white",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {/* Selection Indicator */}
                        <div
                            className={cn(
                                "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                isSelected
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-slate-300 bg-white"
                            )}
                        >
                            {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                        </div>

                        {/* Icon & Title */}
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "p-2 rounded-lg",
                                    isSelected ? "bg-blue-100" : "bg-slate-100"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "w-5 h-5",
                                        isSelected ? "text-blue-600" : "text-slate-500"
                                    )}
                                />
                            </div>
                            <span
                                className={cn(
                                    "font-semibold text-sm",
                                    isSelected ? "text-blue-700" : "text-slate-700"
                                )}
                            >
                                {option.name}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-500 pl-12 pr-6">
                            {option.description}
                        </p>
                    </button>
                );
            })}
        </div>
    );
}
