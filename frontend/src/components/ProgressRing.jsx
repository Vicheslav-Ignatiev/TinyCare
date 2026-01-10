export default function ProgressRing({
                          value, // 0..100
                          size = 168,
                          stroke = 12,
                          centerNode,
                      }) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, value));
    const offset = circumference - (clamped / 100) * circumference;

    return (
        <div
            style={{
                position: "relative",
                width: size,
                height: size,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.10)"
                    strokeWidth={stroke}
                    fill="transparent"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.85)"
                    strokeWidth={stroke}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 200ms linear" }}
                />
            </svg>

            {/* Центр: вместо процентов — иконка (заготовка) */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: "rotate(0deg)",
                }}
            >
                {centerNode}
            </div>
        </div>
    );
}