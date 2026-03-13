/**
 * Maps common Supabase/PostgreSQL error codes to Thai user-friendly messages.
 */
const errorMap: Record<string, string> = {
    // Auth errors
    'invalid_credentials': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    'email_not_confirmed': 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ',
    'user_already_exists': 'อีเมลนี้ถูกใช้งานแล้ว',
    'invalid_grant': 'Session หมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง',
    'user_not_found': 'ไม่พบบัญชีผู้ใช้นี้',

    // PostgreSQL constraint errors
    '23505': 'ข้อมูลนี้มีอยู่แล้วในระบบ (ซ้ำ)',
    '23503': 'ไม่สามารถลบได้ เนื่องจากมีข้อมูลอื่นอ้างอิงอยู่',
    '23502': 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
    '23514': 'ข้อมูลไม่ตรงตามเงื่อนไขที่กำหนด',
    '42501': 'คุณไม่มีสิทธิ์ดำเนินการนี้',

    // Storage errors
    'storage/object-not-found': 'ไม่พบไฟล์ที่ต้องการ',
    'storage/payload-too-large': 'ไฟล์มีขนาดใหญ่เกินไป',
    'storage/invalid-mime-type': 'ประเภทไฟล์ไม่รองรับ',

    // Network errors
    'PGRST301': 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้',
    'FetchError': 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต',
};

const DEFAULT_MESSAGE = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

/**
 * Returns a Thai-language error message from a Supabase error object or code string.
 */
export function getErrorMessage(error: unknown): string {
    if (!error) return DEFAULT_MESSAGE;

    if (typeof error === 'string') {
        return errorMap[error] || error;
    }

    const err = error as { code?: string; message?: string; status?: number };

    // Try error code first
    if (err.code && errorMap[err.code]) {
        return errorMap[err.code];
    }

    // Try matching message keywords
    if (err.message) {
        if (err.message.includes('JWT expired') || err.message.includes('token is expired')) {
            return 'Session หมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง';
        }
        if (err.message.includes('duplicate key')) {
            return errorMap['23505'];
        }
        if (err.message.includes('violates foreign key')) {
            return errorMap['23503'];
        }
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            return errorMap['FetchError'];
        }
    }

    // HTTP status fallback
    if (err.status === 401 || err.status === 403) {
        return 'คุณไม่มีสิทธิ์ดำเนินการนี้ กรุณาเข้าสู่ระบบอีกครั้ง';
    }
    if (err.status === 404) {
        return 'ไม่พบข้อมูลที่ต้องการ';
    }
    if (err.status === 413) {
        return 'ข้อมูลมีขนาดใหญ่เกินไป';
    }
    if (err.status && err.status >= 500) {
        return 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง';
    }

    return DEFAULT_MESSAGE;
}
