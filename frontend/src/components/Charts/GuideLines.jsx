export default function GuideLines({ minY, maxY, w, h }) {
    const labels = [minY, (minY + maxY) / 2, maxY].map((n) => Math.round(n));
    return (
        <g>
            {labels.map((val, i) => {
                const y = h - ((val - minY) / Math.max(1, maxY - minY)) * (h - 0);
                return (
                    <g key={i}>
                        <line x1={0} x2={w} y1={y} y2={y} stroke="var(--grid)" strokeWidth={1} />
                        <text x={8} y={y - 6} fontSize={12} fill="var(--muted)">
                            {val}
                        </text>
                    </g>
                );
            })}
        </g>
    );
}
