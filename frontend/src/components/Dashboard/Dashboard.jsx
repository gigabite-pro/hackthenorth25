import { ChartPanel } from "../Charts";
import { formatPct } from "../../utils/helpers";

export default function Dashboard({ 
    modules, 
    theme, 
    onTileClick, 
    seriesMap, 
    winnerKey, 
    loserKey, 
    winnerPct, 
    loserPct 
}) {
    const winnerModule = modules.find((m) => m.key === winnerKey) ?? modules[0];
    const loserModule = modules.find((m) => m.key === loserKey) ?? modules[1] ?? modules[0];

    return (
        <main className="content">
            {/* Tiles grid */}
            <section className="tile-grid" aria-label="Learning modules">
                {modules.map((m) => (
                    <button 
                        key={m.id} 
                        className="tile" 
                        style={{ backgroundColor: theme === "dark" ? m.bgDark : m.bgLight }} 
                        onClick={() => onTileClick(m)}
                    >
                        <div className="tile-head">
                            <span className="tile-emoji" aria-hidden>
                                📚
                            </span>
                            <span className="tile-title">{m.title}</span>
                        </div>
                        <div className="tile-sub">{m.subtitle}</div>
                        <div className="tile-cta">Start →</div>
                    </button>
                ))}
            </section>

            {/* Dual charts: biggest winner & biggest loser */}
            <section className="charts-grid" aria-label="Top movers">
                <ChartPanel 
                    id="winner" 
                    title={`Biggest Winner • ${winnerModule.title}`} 
                    series={seriesMap[winnerKey] ?? []} 
                    chipLabel={`▲ Up ${formatPct(winnerPct)}`} 
                    up 
                />
                <ChartPanel 
                    id="loser" 
                    title={`Biggest Loser • ${loserModule.title}`} 
                    series={seriesMap[loserKey] ?? []} 
                    chipLabel={`▼ Down ${formatPct(Math.abs(loserPct))}`} 
                />
            </section>
        </main>
    );
}
