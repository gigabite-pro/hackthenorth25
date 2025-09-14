export function buildPath(points, width, height) {
    if (!points || points.length === 0) return { path: "", minY: 0, maxY: 0 };
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const pad = 12; // padding for top/bottom
    const yScale = (v) => {
        if (maxY === minY) return height / 2;
        const t = (v - minY) / (maxY - minY);
        return height - (pad + t * (height - pad * 2));
    };
    const xScale = (i) => {
        const n = points.length - 1;
        return n === 0 ? 0 : (i / n) * width;
    };
    let d = "";
    points.forEach((p, i) => {
        const x = xScale(i);
        const y = yScale(p.y);
        d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return { path: d, minY, maxY };
}

export function makeInitialSeries(n, seed = 100) {
    let val = seed;
    return Array.from({ length: n }, (_, i) => {
        val = nextVal(val);
        return { x: i, y: val };
    });
}

export function nextVal(prev) {
    // random walk with soft boundaries for nicer demo ranges
    const drift = Math.random() * 2 - 1; // -1..1
    const step = drift * 2.2; // scale
    const noise = (Math.random() - 0.5) * 1.3;
    const y = Math.max(40, Math.min(200, prev + step + noise));
    return Math.round(y * 100) / 100;
}

export function pickWinners(map) {
    let winnerKey = null,
        loserKey = null;
    let max = -Infinity,
        min = Infinity;
    for (const [key, series] of Object.entries(map)) {
        if (!series || series.length < 2) continue;
        const first = series[0].y;
        const last = series[series.length - 1].y;
        const pct = first === 0 ? 0 : ((last - first) / first) * 100;
        if (pct > max) {
            max = pct;
            winnerKey = key;
        }
        if (pct < min) {
            min = pct;
            loserKey = key;
        }
    }
    if (!winnerKey) winnerKey = Object.keys(map)[0];
    if (!loserKey) loserKey = Object.keys(map)[1] || winnerKey;
    return { winnerKey, loserKey, winnerPct: max, loserPct: min };
}
