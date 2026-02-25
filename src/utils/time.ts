export function extractTime(str: string | null | undefined): string {
    if (!str) return '';
    const match = String(str).match(/(\d{1,2}):(\d{2}):\d{2}/);
    if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2];
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm}`;
    }
    return str;
}
