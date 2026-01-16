import { useState, useEffect } from "react";

export default function DailyStatistics({ tiny, onBack }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        feedings: {
            count: 0,
            totalMl: 0,
            averageMl: 0,
            totalFeedDuration: 0,
            totalBurpDuration: 0,
        },
        diapers: {
            total: 0,
            poopCount: 0,
            peeCount: 0,
        },
    });

    useEffect(() => {
        fetchDailyStats();
    }, [tiny._id]);

    async function fetchDailyStats() {
        try {
            setLoading(true);
            setError(null);

            const babyId = typeof tiny._id === 'object' && tiny._id._id
                ? tiny._id._id
                : String(tiny._id);

            // Calculate timestamp for 24 hours ago
            const oneDayAgo = new Date();
            oneDayAgo.setHours(oneDayAgo.getHours() - 24);

            // Fetch feedings and diapers in parallel
            const [feedingsRes, diapersRes] = await Promise.all([
                fetch(`/api/feedings/${babyId}`),
                fetch(`/api/diapers/stats/${babyId}?days=1`),
            ]);

            const feedingsData = await feedingsRes.json();
            const diapersData = await diapersRes.json();

            // Filter feedings from last 24 hours
            const recentFeedings = feedingsData.ok && feedingsData.data
                ? feedingsData.data.filter(f => new Date(f.feedStartedAt) >= oneDayAgo)
                : [];

            // Calculate feeding stats
            const totalMl = recentFeedings.reduce((sum, f) => sum + (f.ml || 0), 0);
            const totalFeedDuration = recentFeedings.reduce((sum, f) => sum + (f.feedDurationSec || 0), 0);
            const totalBurpDuration = recentFeedings.reduce((sum, f) => sum + (f.burpDurationSec || 0), 0);
            const averageMl = recentFeedings.length > 0 ? Math.round(totalMl / recentFeedings.length) : 0;

            setStats({
                feedings: {
                    count: recentFeedings.length,
                    totalMl,
                    averageMl,
                    totalFeedDuration,
                    totalBurpDuration,
                },
                diapers: diapersData.ok && diapersData.data
                    ? {
                        total: diapersData.data.total || 0,
                        poopCount: diapersData.data.poopCount || 0,
                        peeCount: diapersData.data.peeCount || 0,
                    }
                    : { total: 0, poopCount: 0, peeCount: 0 },
            });
        } catch (err) {
            console.error("Error fetching daily stats:", err);
            setError("Failed to load statistics");
        } finally {
            setLoading(false);
        }
    }

    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins === 0) return `${secs}s`;
        return `${mins}m ${secs}s`;
    }

    if (loading) {
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
                    padding: 20,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 15 }}>
                    Loading statistics...
                </div>
            </div>
        );
    }

    if (error) {
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
                    padding: 20,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ color: "#ff6b6b", fontSize: 15 }}>
                    {error}
                </div>
                <button
                    type="button"
                    onClick={onBack}
                    style={{
                        padding: "8px 16px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.16)",
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.7)",
                        cursor: "pointer",
                        fontWeight: 500,
                        fontSize: 14,
                    }}
                >
                    Back
                </button>
            </div>
        );
    }

    return (
        <div
            style={{
                borderTop: "1px solid rgba(255,255,255,0.15)",
                paddingTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div
                style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.95)",
                    textAlign: "center",
                }}
            >
                📅 Daily Statistics
            </div>

            <div
                style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                    textAlign: "center",
                    marginTop: -8,
                }}
            >
                Last 24 hours
            </div>

            {/* Stats Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 10,
                }}
            >
                {/* Feedings Card */}
                <div
                    style={{
                        background: "rgba(100, 149, 237, 0.15)",
                        border: "1px solid rgba(100, 149, 237, 0.3)",
                        borderRadius: 12,
                        padding: "14px 12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <div style={{ fontSize: 28 }}>🍼</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#87ceeb" }}>
                        {stats.feedings.count}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                        Feedings
                    </div>
                </div>

                {/* Total ML Card */}
                <div
                    style={{
                        background: "rgba(76, 175, 80, 0.15)",
                        border: "1px solid rgba(76, 175, 80, 0.3)",
                        borderRadius: 12,
                        padding: "14px 12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <div style={{ fontSize: 28 }}>💧</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#4CAF50" }}>
                        {stats.feedings.totalMl}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                        Total ml
                    </div>
                </div>

                {/* Diapers Card */}
                <div
                    style={{
                        background: "rgba(255, 193, 7, 0.15)",
                        border: "1px solid rgba(255, 193, 7, 0.3)",
                        borderRadius: 12,
                        padding: "14px 12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <div style={{ fontSize: 28 }}>🧷</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#ffc107" }}>
                        {stats.diapers.total}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                        Diaper changes
                    </div>
                </div>

                {/* Average ML Card */}
                <div
                    style={{
                        background: "rgba(156, 39, 176, 0.15)",
                        border: "1px solid rgba(156, 39, 176, 0.3)",
                        borderRadius: 12,
                        padding: "14px 12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <div style={{ fontSize: 28 }}>📊</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#ce93d8" }}>
                        {stats.feedings.averageMl}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                        Avg ml/feeding
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div
                style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                }}
            >
                <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>
                    Details
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>💩 Poops:</span>
                    <span style={{ fontWeight: 600, color: "#d4a574" }}>{stats.diapers.poopCount}</span>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>💧 Pees:</span>
                    <span style={{ fontWeight: 600, color: "#87ceeb" }}>{stats.diapers.peeCount}</span>
                </div>

                {stats.feedings.count > 0 && (
                    <>
                        <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                            <span style={{ color: "rgba(255,255,255,0.6)" }}>⏱️ Total feed time:</span>
                            <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.95)" }}>
                                {formatDuration(stats.feedings.totalFeedDuration)}
                            </span>
                        </div>

                        <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                            <span style={{ color: "rgba(255,255,255,0.6)" }}>🫧 Total burp time:</span>
                            <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.95)" }}>
                                {formatDuration(stats.feedings.totalBurpDuration)}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Back Button */}
            <button
                type="button"
                onClick={onBack}
                style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.9)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 15,
                    marginTop: 4,
                }}
            >
                ← Back
            </button>
        </div>
    );
}