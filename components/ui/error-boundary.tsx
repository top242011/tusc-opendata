'use client';

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="alert">
                    <div className="p-3 rounded-full bg-[rgb(var(--ios-orange))]/10 mb-4">
                        <AlertTriangle className="w-8 h-8 text-[rgb(var(--ios-orange))]" />
                    </div>
                    <h2 className="text-lg font-semibold text-[rgb(var(--ios-text-primary))] mb-1">
                        เกิดข้อผิดพลาด
                    </h2>
                    <p className="text-sm text-[rgb(var(--ios-text-secondary))] mb-6 max-w-sm">
                        ไม่สามารถแสดงผลส่วนนี้ได้ กรุณาลองใหม่อีกครั้ง
                    </p>
                    <Button variant="outline" size="sm" onClick={this.handleRetry}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        ลองใหม่
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
