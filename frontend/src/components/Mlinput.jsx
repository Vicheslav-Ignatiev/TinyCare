import { useState } from "react";

export default function MlInput({ onSubmit, onCancel }) {
    const [mlAmount, setMlAmount] = useState("");

    function handleSubmit() {
        const ml = parseInt(mlAmount, 10);
        if (isNaN(ml) || ml <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        onSubmit?.(ml);
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
                    fontSize: 16,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.9)",
                }}
            >
                How many ml did the baby eat?
            </div>

            <input
                type="number"
                value={mlAmount}
                onChange={(e) => setMlAmount(e.target.value)}
                placeholder="Enter ml"
                autoFocus
                style={{
                    width: "200px",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.95)",
                    fontSize: 16,
                    fontWeight: 600,
                    textAlign: "center",
                    outline: "none",
                }}
                onKeyPress={(e) => {
                    if (e.key === "Enter") {
                        handleSubmit();
                    }
                }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button
                    type="button"
                    onClick={handleSubmit}
                    style={{
                        padding: "10px 20px",
                        borderRadius: 12,
                        border: "1px solid rgba(76, 175, 80, 0.3)",
                        background: "rgba(76, 175, 80, 0.15)",
                        color: "#4CAF50",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 15,
                    }}
                >
                    Next
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            padding: "10px 20px",
                            borderRadius: 12,
                            border: "1px solid rgba(255,255,255,0.16)",
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.7)",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 15,
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}