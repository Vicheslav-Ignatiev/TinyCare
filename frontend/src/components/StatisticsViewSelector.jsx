export default function StatisticsViewSelector({ tiny, onSelectDaily, onSelectWeekly, onCancel }) {
    return (
        <div
            style={{
                borderTop: "1px solid rgba(255,255,255,0.15)",
                paddingTop: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 14,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.95)",
                    textAlign: "center",
                }}
            >
                📊 Statistics for {tiny.name}
            </div>

            <div
                style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.8)",
                    textAlign: "center",
                }}
            >
                Choose view type:
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
                <button
                    type="button"
                    onClick={onSelectDaily}
                    style={{
                        flex: "1 1 140px",
                        minWidth: 140,
                        padding: "16px 20px",
                        borderRadius: 12,
                        border: "1px solid rgba(100, 149, 237, 0.3)",
                        background: "rgba(100, 149, 237, 0.15)",
                        color: "#87ceeb",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 15,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "rgba(100, 149, 237, 0.25)";
                        e.target.style.borderColor = "rgba(100, 149, 237, 0.5)";
                        e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "rgba(100, 149, 237, 0.15)";
                        e.target.style.borderColor = "rgba(100, 149, 237, 0.3)";
                        e.target.style.transform = "translateY(0)";
                    }}
                >
                    <span style={{ fontSize: 24 }}>📅</span>
                    <span>Daily View</span>
                    <span style={{ fontSize: 12, opacity: 0.8, fontWeight: 400 }}>Last 24 hours</span>
                </button>

                <button
                    type="button"
                    onClick={onSelectWeekly}
                    style={{
                        flex: "1 1 140px",
                        minWidth: 140,
                        padding: "16px 20px",
                        borderRadius: 12,
                        border: "1px solid rgba(76, 175, 80, 0.3)",
                        background: "rgba(76, 175, 80, 0.15)",
                        color: "#4CAF50",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 15,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "rgba(76, 175, 80, 0.25)";
                        e.target.style.borderColor = "rgba(76, 175, 80, 0.5)";
                        e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "rgba(76, 175, 80, 0.15)";
                        e.target.style.borderColor = "rgba(76, 175, 80, 0.3)";
                        e.target.style.transform = "translateY(0)";
                    }}
                >
                    <span style={{ fontSize: 24 }}>📊</span>
                    <span>Weekly View</span>
                    <span style={{ fontSize: 12, opacity: 0.8, fontWeight: 400 }}>Last 7 days</span>
                </button>
            </div>

            <button
                type="button"
                onClick={onCancel}
                style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.7)",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: 14,
                    marginTop: 4,
                }}
            >
                Cancel
            </button>
        </div>
    );
}