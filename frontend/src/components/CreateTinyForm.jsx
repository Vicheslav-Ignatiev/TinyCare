import { useState } from "react";

export default function CreateTinyForm({ onCreated, onCancel, setError }) {
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    async function createTiny() {
        const trimmed = name.trim();
        if (!trimmed) {
            setError?.("Name is required");
            return;
        }

        setError?.("");
        setSaving(true);

        try {
            const res = await fetch("/api/children", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: trimmed }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                const msg =
                    data?.error?.message || data?.message || `Request failed (${res.status})`;
                throw new Error(msg);
            }

            setName("");
            onCreated?.(data?.data);
        } catch (e) {
            setError?.(e.message || "Failed to create Tiny");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 420,
                background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
                borderRadius: 20,
                padding: "clamp(20px, 5vw, 24px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                display: "grid",
                gap: "clamp(12px, 3vw, 16px)",
            }}
        >
            <h3
                style={{
                    margin: 0,
                    color: "rgba(255, 255, 255, 0.95)",
                    fontSize: "clamp(16px, 4vw, 18px)",
                    fontWeight: 600,
                    textAlign: "center",
                }}
            >
                Add New Tiny
            </h3>

            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter tiny's name"
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === "Enter") createTiny();
                    if (e.key === "Escape") onCancel?.();
                }}
                style={{
                    padding: "clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 16px)",
                    borderRadius: 12,
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    background: "rgba(255, 255, 255, 0.95)",
                    color: "#1a1a1a",
                    fontSize: "clamp(14px, 3.5vw, 16px)",
                    outline: "none",
                    transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(255, 255, 255, 0.3)";
                    e.target.style.background = "white";
                }}
                onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255, 255, 255, 0.15)";
                    e.target.style.background = "rgba(255, 255, 255, 0.95)";
                }}
                disabled={saving}
            />

            <div
                style={{
                    display: "flex",
                    gap: "clamp(8px, 2vw, 12px)",
                    justifyContent: "stretch",
                    flexWrap: "wrap",
                }}
            >
                <button
                    type="button"
                    onClick={() => {
                        setName("");
                        setError?.("");
                        onCancel?.();
                    }}
                    style={{
                        flex: "1 1 auto",
                        minWidth: "clamp(100px, 25vw, 120px)",
                        padding: "clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)",
                        borderRadius: 12,
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        background: "rgba(0, 0, 0, 0.2)",
                        color: "rgba(255, 255, 255, 0.9)",
                        cursor: "pointer",
                        fontSize: "clamp(14px, 3.5vw, 15px)",
                        fontWeight: 500,
                        transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "rgba(0, 0, 0, 0.4)";
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "rgba(0, 0, 0, 0.2)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                    }}
                    disabled={saving}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={createTiny}
                    style={{
                        flex: "1 1 auto",
                        minWidth: "clamp(100px, 25vw, 120px)",
                        padding: "clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)",
                        borderRadius: 12,
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        background: "rgba(255, 255, 255, 0.95)",
                        color: "#1a1a1a",
                        cursor: saving ? "not-allowed" : "pointer",
                        fontSize: "clamp(14px, 3.5vw, 15px)",
                        fontWeight: 600,
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                        opacity: saving ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                        if (!saving) {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.4)";
                            e.target.style.background = "white";
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
                        e.target.style.background = "rgba(255, 255, 255, 0.95)";
                    }}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Create"}
                </button>
            </div>
        </div>
    );
}