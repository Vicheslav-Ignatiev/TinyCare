import BlinkingBabyIcon from "./BlinkingBabyIcon";
import { useState } from "react";
import feedIcon from "../assets/feed.png";
import diaperIcon from "../assets/diper.png";
import statsIcon from "../assets/statistics.png";
import deleteIcon from "../assets/delete.png";


export default function TinyCard({ tiny, onDelete }) {
    const [open, setOpen] = useState(false);

    function ActionButton({ label, iconSrc, onClick, danger = false }) {
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

    return (
        <li
            style={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                padding: "clamp(12px, 3vw, 16px)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                borderRadius: 16,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)",
                color: "rgba(255, 255, 255, 0.95)",
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.3)",
                transition: "all 0.3s ease",
                overflow: "hidden",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.5)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0, 0, 0, 0.3)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            }}
            onClick={() => setOpen((v) => !v)}
        >
            {/* Top section with baby info */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "clamp(10px, 2.5vw, 14px)",
                    width: "100%",
                }}
            >
                <div style={{ flexShrink: 0 }}>
                    <BlinkingBabyIcon size={128} />
                </div>

                <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                    <div
                        style={{
                            fontWeight: 600,
                            marginBottom: 4,
                            fontSize: "clamp(15px, 3.8vw, 17px)",
                            wordBreak: "break-word",
                        }}
                    >
                        {tiny.name}
                    </div>

                    {tiny.birthDate ? (
                        <div style={{
                            fontSize: "clamp(12px, 3vw, 13px)",
                            color: "rgba(255, 255, 255, 0.6)"
                        }}>
                            Birth date: {String(tiny.birthDate).slice(0, 10)}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Action buttons - responsive grid */}
            {open && (
                <div
                    style={{
                        paddingTop: 12,
                        borderTop: "1px solid rgba(255,255,255,0.15)",
                        display: "grid",
                        gridTemplateColumns: window.innerWidth < 640
                            ? "1fr"
                            : "repeat(2, minmax(0, 1fr))",
                        gap: 10,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ActionButton label="Start feeding" iconSrc={feedIcon} onClick={() => console.log("Feed")} />
                    <ActionButton label="Diaper change" iconSrc={diaperIcon} onClick={() => console.log("Diaper")} />
                    <ActionButton label="Statistics" iconSrc={statsIcon} onClick={() => console.log("Stats")} />
                    <ActionButton
                        label="Delete"
                        iconSrc={deleteIcon}
                        danger
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete ${tiny.name}?`)) {
                                onDelete?.(tiny._id);
                            }
                        }}
                    />
                </div>
            )}
        </li>
    );
}