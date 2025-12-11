export function formatTHB(amount: number): string {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function calculateStats(projects: any[]): any {
    // logic placeholder, doing it in component or here
    return {};
}

export function getStatusLabel(status: string): string {
    switch (status) {
        case 'ตัดงบ': return 'ตัดงบบางส่วน';
        case 'อนุมัติ': return 'อนุมัติเต็มจำนวน';
        default: return status;
    }
}
