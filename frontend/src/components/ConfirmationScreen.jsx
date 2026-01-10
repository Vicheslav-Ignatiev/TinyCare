import EditableField from "./EditableField.jsx";

function formatDateTime(timestamp) {
    const d = new Date(timestamp);
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatMMSS(totalSeconds) {
    const s = Math.max(0, totalSeconds);
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function ConfirmationScreen({
                                               sessionDraft,
                                               mlAmount,
                                               onUpdateFeedDuration,
                                               onUpdateBurpDuration,
                                               onUpdateMlAmount,
                                               onConfirm,
                                               onBack
                                           }) {
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
            <div
                style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.95)",
                    textAlign: "center",
                    marginBottom: 8,
                }}
            >
                Confirm Feeding Session
            </div>

            <div
                style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Started at:</span>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>
                        {formatDateTime(sessionDraft.feedStartedAtMs)}
                    </span>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />

                <EditableField
                    label="Feeding duration"
                    value={sessionDraft.feedDurationSec}
                    unit="sec"
                    formatter={formatMMSS}
                    onSave={onUpdateFeedDuration}
                />

                <EditableField
                    label="Burping duration"
                    value={sessionDraft.burpDurationSec}
                    unit="sec"
                    formatter={formatMMSS}
                    onSave={onUpdateBurpDuration}
                />

                <EditableField
                    label="Amount eaten"
                    value={parseInt(mlAmount, 10)}
                    unit="ml"
                    onSave={onUpdateMlAmount}
                    highlight={true}
                />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                    type="button"
                    onClick={onConfirm}
                    style={{
                        flex: 1,
                        padding: "12px 20px",
                        borderRadius: 12,
                        border: "1px solid rgba(76, 175, 80, 0.3)",
                        background: "rgba(76, 175, 80, 0.15)",
                        color: "#4CAF50",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 15,
                    }}
                >
                    Confirm & Save
                </button>
                <button
                    type="button"
                    onClick={onBack}
                    style={{
                        padding: "12px 20px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.16)",
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.7)",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Back
                </button>
            </div>
        </div>
    );
}