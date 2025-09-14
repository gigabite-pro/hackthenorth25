import { ChartPanel } from "../Charts";

export default function Dashboard({ 
    modules, 
    theme, 
    onTileClick, 
    seriesMap
}) {
    const budgetingModule = modules.find((m) => m.key === 'budgeting') ?? modules[0];
    const creditModule = modules.find((m) => m.key === 'credit') ?? modules[1] ?? modules[0];
    const stocksModule = modules.find((m) => m.key === 'stocks') ?? modules[2] ?? modules[0];

    return (
        <main className="content">
            {/* Tiles grid */}
            <section className="tile-grid" aria-label="Learning modules">
                {modules.map((m) => (
                    <div
                        key={m.id}
                        className="tile"
                        style={{ backgroundColor: theme === "dark" ? m.bgDark : m.bgLight }}
                    >
                        <div className="tile-head">
                            <span className="tile-emoji" aria-hidden>📚</span>
                            <span className="tile-title">{m.title}</span>
                        </div>
                        <div className="tile-sub">{m.subtitle}</div>
                        {/* Removed .tile-cta and onClick */}
                    </div>
                ))}
            </section>

            {/* Three charts for each module */}
            <section className="charts-grid" aria-label="Learning modules charts">
                <ChartPanel 
                    id="budgeting" 
                    title={`The Art of Budgeting • 1,247 Players`} 
                    series={seriesMap['budgeting'] ?? []} 
                    chipLabel={`💰 +50 Points`} 
                    up 
                    onClick={() => onTileClick(budgetingModule)}
                />
                <ChartPanel 
                    id="credit" 
                    title={`The Credit Score Game • 892 Players`} 
                    series={seriesMap['credit'] ?? []} 
                    chipLabel={`📊 Down -25 Points`} 
                    up={false}
                    onClick={() => onTileClick(creditModule)}
                />
                <ChartPanel 
                    id="stocks" 
                    title={`The Stock Market • 2,156 Players`} 
                    series={seriesMap['stocks'] ?? []} 
                    chipLabel={`📈 +75 Points`} 
                    up
                    onClick={() => onTileClick(stocksModule)}
                />
            </section>
        </main>
    );
}
