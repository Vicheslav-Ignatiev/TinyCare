export default function PoopConfirmation({ tiny, onSave, onCancel }) {
    async function handleYes() {
        await saveDiaperChange(true);
    }

    async function handleNo() {
        await saveDiaperChange(false);
    }

    async function saveDiaperChange(isPoop) {
        try {
            const babyIdString = typeof tiny._id === 'object' && tiny._id._id
                ? tiny._id._id
                : String(tiny._id);

            const payload = {
                babyId: babyIdString,
                changedAt: new Date().toISOString(),
                isPoop: isPoop,
            };

            const response = await fetch("/api/diapers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.ok) {
                alert(`Failed to save: ${result.error?.message || 'Unknown error'}`);
                return;
            }

            alert(isPoop ? "Poop diaper saved!" : "Pee diaper saved!");
            onSave?.();
        } catch (error) {
            console.error("Error saving diaper change:", error);
            alert(`Error: ${error.message}`);
        }
    }

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
                Diaper Change
            </div>

            <div
                style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.9)",
                }}
            >
                Is it a poop?
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button
                    type="button"
                    onClick={handleYes}
                    style={{
                        padding: "10px 20px",
                        borderRadius: 12,
                        border: "1px solid rgba(139, 69, 19, 0.4)",
                        background: "rgba(139, 69, 19, 0.15)",
                        color: "#d4a574",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 15,
                    }}
                >
                    💩 Yes, Poop!
                </button>
                <button
                    type="button"
                    onClick={handleNo}
                    style={{
                        padding: "10px 20px",
                        borderRadius: 12,
                        border: "1px solid rgba(100, 149, 237, 0.3)",
                        background: "rgba(100, 149, 237, 0.15)",
                        color: "#87ceeb",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 15,
                    }}
                >
                    No, Just Pee
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