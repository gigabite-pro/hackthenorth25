import { useRef, useState, useEffect, useMemo } from "react";
import { buildPath } from "../../utils/chartHelpers";
import GuideLines from "./GuideLines";

export default function ChartPanel({ id, title, series, chipLabel, up = false }) {
    const lastDelta = useMemo(() => {
        if (series.length < 2) return 0;
        const a = series[series.length - 2].y;
        const b = series[series.length - 1].y;
        return b - a;
    }, [series]);

    const ref = useRef(null);
    const [size, setSize] = useState({ w: 900, h: 300 });
    
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const cr = entry.contentRect;
                const targetH = Math.max(220, Math.min(520, cr.width * 0.5));
                setSize({ w: cr.width, h: targetH });
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const { path, minY, maxY } = useMemo(() => buildPath(series, size.w, size.h), [series, size]);

    return (
        <div className="chart-wrap">
            <div className="chart-head">
                <div className="chart-title">{title}</div>
                <div className={`chip ${up ? "up" : "down"}`}>{chipLabel}</div>
            </div>
            <div className="chart-canvas" ref={ref}>
                <svg width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`areaFill-${id}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={up ? "#22c55e" : "#ef4444"} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={up ? "#22c55e" : "#ef4444"} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={`${path} L ${size.w} ${size.h} L 0 ${size.h} Z`} fill={`url(#areaFill-${id})`} />
                    <GuideLines minY={minY} maxY={maxY} w={size.w} h={size.h} />
                    <path d={path} fill="none" stroke={up ? "#16a34a" : "#dc2626"} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
                </svg>
            </div>
        </div>
    );
}
