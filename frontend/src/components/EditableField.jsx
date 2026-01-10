import { useState } from "react";

export default function EditableField({
                                          label,
                                          value,
                                          unit = "",
                                          formatter = (v) => v,
                                          onSave,
                                          highlight = false
                                      }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");

    function startEditing() {
        setIsEditing(true);
        setEditValue(String(value));
    }

    function cancelEditing() {
        setIsEditing(false);
        setEditValue("");
    }

    function saveEdit() {
        const val = parseInt(editValue, 10);
        if (isNaN(val) || val < 0) {
            alert("Please enter a valid value");
            return;
        }
        onSave(val);
        setIsEditing(false);
        setEditValue("");
    }

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                    {label}:
                </span>
                {isEditing ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                            style={{
                                width: "80px",
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: highlight
                                    ? "1px solid rgba(76, 175, 80, 0.3)"
                                    : "1px solid rgba(255,255,255,0.3)",
                                background: highlight
                                    ? "rgba(76, 175, 80, 0.1)"
                                    : "rgba(255,255,255,0.1)",
                                color: highlight ? "#4CAF50" : "rgba(255,255,255,0.95)",
                                fontSize: 14,
                                fontWeight: highlight ? 700 : 600,
                                textAlign: "center",
                                outline: "none",
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit();
                                if (e.key === "Escape") cancelEditing();
                            }}
                        />
                        {unit && (
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                                {unit}
                            </span>
                        )}
                        <button
                            onClick={saveEdit}
                            style={{
                                padding: "4px 8px",
                                borderRadius: 6,
                                border: "1px solid rgba(76, 175, 80, 0.3)",
                                background: "rgba(76, 175, 80, 0.15)",
                                color: "#4CAF50",
                                cursor: "pointer",
                                fontSize: 12,
                            }}
                        >
                            ✓
                        </button>
                        <button
                            onClick={cancelEditing}
                            style={{
                                padding: "4px 8px",
                                borderRadius: 6,
                                border: "1px solid rgba(255,255,255,0.2)",
                                background: "rgba(255,255,255,0.08)",
                                color: "rgba(255,255,255,0.7)",
                                cursor: "pointer",
                                fontSize: 12,
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{
                            fontWeight: highlight ? 700 : 600,
                            fontSize: highlight ? 16 : 15,
                            color: highlight ? "#4CAF50" : "rgba(255,255,255,0.95)"
                        }}>
                            {formatter(value)} {unit}
                        </span>
                        <button
                            onClick={startEditing}
                            style={{
                                padding: "4px 8px",
                                borderRadius: 6,
                                border: "1px solid rgba(255,255,255,0.2)",
                                background: "rgba(255,255,255,0.08)",
                                color: "rgba(255,255,255,0.7)",
                                cursor: "pointer",
                                fontSize: 12,
                            }}
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
        </>
    );
}