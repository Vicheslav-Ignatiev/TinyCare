import BlinkingBabyIcon from "./BlinkingBabyIcon";

export default function TinyCard({ tiny, onDelete }) {
    return (
        <li
            style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "clamp(10px, 2.6vw, 14px) clamp(12px, 4vw, 18px)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                borderRadius: 16,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)",
                color: "rgba(255, 255, 255, 0.95)",
                cursor: "default",
                fontSize: "clamp(14px, 3.5vw, 16px)",
                fontWeight: 600,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(0, 0, 0, 0.5)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.4)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
        >
            <div
                style={{
                    minWidth: 0,
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "clamp(8px, 2vw, 12px)",
                }}
            >
                <BlinkingBabyIcon size={128} />

                <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                        style={{
                            fontWeight: 600,
                            marginBottom: 4,
                            fontSize: "clamp(14px, 3.5vw, 16px)",
                            wordBreak: "break-word",
                        }}
                    >
                        {tiny.name}
                    </div>

                    {tiny.birthDate ? (
                        <div style={{ fontSize: "clamp(12px, 3vw, 13px)", opacity: 0.7 }}>
                            Birth date: {String(tiny.birthDate).slice(0, 10)}
                        </div>
                    ) : null}
                </div>
            </div>

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(tiny._id);
                }}
                style={{
                    border: "none",
                    background: "transparent",
                    color: "rgba(255, 255, 255, 0.95)",
                    cursor: "pointer",
                    padding: "8px 10px",
                    borderRadius: 10,
                    opacity: 0.8,
                    fontSize: "clamp(12px, 3vw, 13px)",
                    flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
            >
                Delete
            </button>
        </li>
    );
}
