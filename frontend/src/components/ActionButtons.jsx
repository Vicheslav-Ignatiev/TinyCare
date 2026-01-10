export default function ActionButton({ label, iconSrc, onClick, danger = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background: danger
                    ? "rgba(255, 80, 80, 0.16)"
                    : "rgba(255,255,255,0.10)",
                color: danger ? "#ffb4b4" : "#fff",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                minHeight: 96,
                boxSizing: "border-box",
                transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
                e.target.style.background = danger
                    ? "rgba(255, 80, 80, 0.24)"
                    : "rgba(255,255,255,0.15)";
                e.target.style.borderColor = "rgba(255,255,255,0.25)";
            }}
            onMouseLeave={(e) => {
                e.target.style.background = danger
                    ? "rgba(255, 80, 80, 0.16)"
                    : "rgba(255,255,255,0.10)";
                e.target.style.borderColor = "rgba(255,255,255,0.14)";
            }}
        >
            <img
                src={iconSrc}
                alt=""
                aria-hidden="true"
                style={{
                    width: 76,
                    height: 76,
                    objectFit: "contain",
                    flexShrink: 0,
                    opacity: danger ? 0.95 : 0.9,
                }}
            />

            <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.1 }}>
          {label}
        </span>
        </button>
    );
}