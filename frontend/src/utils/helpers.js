export function formatPct(p) {
    if (!isFinite(p)) return "0%";
    const sign = p < 0 ? -1 : 1;
    const v = Math.abs(p);
    const str = v >= 10 ? v.toFixed(0) : v.toFixed(1);
    return `${sign < 0 ? "-" : ""}${str}%`;
}
