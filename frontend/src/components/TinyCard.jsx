import BlinkingBabyIcon from "./BlinkingBabyIcon";
import { useEffect, useMemo, useState } from "react";
import feedIcon from "../assets/feed.png";
import diaperIcon from "../assets/diper.png";
import statsIcon from "../assets/statistics.png";
import deleteIcon from "../assets/delete.png";
import ActionButton from "./ActionButtons.jsx";
import ProgressRing from "./ProgressRing.jsx";
import babyNormal from "../assets/eating1.png";
import babyEating from "../assets/eating2.png";
import babyBurp1 from "../assets/burp1.png";
import babyBurp2 from "../assets/burp2.png";
import ConfirmationScreen from "./ConfirmationScreen.jsx";


import AnimatedIcon from "./AnimatedIcon.jsx";


const FEED_DURATION_MINUTES_DEFAULT = 20;
const BURP_DURATION_MINUTES_DEFAULT = 10;

function pad2(n) {
    return String(n).padStart(2, "0");
}

function formatMMSS(totalSeconds) {
    const s = Math.max(0, totalSeconds);
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${pad2(mm)}:${pad2(ss)}`;
}


export default function TinyCard({ tiny, onDelete }) {
    const [open, setOpen] = useState(false);
    const [feeding, setFeeding] = useState(null);
    const [burping, setBurping] = useState(null);
    // feeding/burping = { totalSec, remainingSec, startedAtMs }
    const feedDurationMinutes = FEED_DURATION_MINUTES_DEFAULT;
    const burpDurationMinutes = BURP_DURATION_MINUTES_DEFAULT;
    const [showMlInput, setShowMlInput] = useState(false);
    const [mlAmount, setMlAmount] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [lastFeeding, setLastFeeding] = useState(null);

    const totalFeedSec = useMemo(
        () => Math.max(1, Math.floor(feedDurationMinutes * 60)),
        [feedDurationMinutes]
    );
    const totalBurpSec = useMemo(
        () => Math.max(1, Math.floor(burpDurationMinutes * 60)),
        [burpDurationMinutes]
    );

    const [sessionDraft, setSessionDraft] = useState(null);
    // { babyId, feedStartedAtMs, feedDurationSec, burpDurationSec }

    useEffect(() => {
        async function fetchLastFeeding() {
            try {
                // Step 1: Build the URL with the baby's ID
                const response = await fetch(`/api/feedings/last/${tiny._id}`);

                // Step 2: Parse the JSON response
                const result = await response.json();

                // Step 3: Check if the request was successful
                if (result.ok && result.data) {
                    // Step 4: Update state with the feeding data
                    setLastFeeding(result.data);
                } else {
                    // No feeding found or error - keep as null
                    setLastFeeding(null);
                }
            } catch (error) {
                console.error("Error fetching last feeding:", error);
                // On error, keep state as null
                setLastFeeding(null);
            }
        }

        fetchLastFeeding();
    }, []);


    useEffect(() => {
        if (!feeding) return;

        const id = setInterval(() => {
            setFeeding((prev) => {
                if (!prev) return prev;

                const now = Date.now();
                const elapsedSec = Math.floor((now - prev.startedAtMs) / 1000);
                const remaining = Math.max(0, prev.totalSec - elapsedSec);
                return { ...prev, remainingSec: remaining };
            });
            setFeedSessionDraft({
                babyId: tiny._id,
                feedStartedAtMs: now,
                feedEndedAtMs: null,
                burpStartedAtMs: null,
                burpEndedAtMs: null,
            });

        }, 250);


        return () => clearInterval(id);
    }, [feeding]);

    // Add this after the feeding useEffect:
    useEffect(() => {
        if (!burping) return;

        const id = setInterval(() => {
            setBurping((prev) => {
                if (!prev) return prev;

                const now = Date.now();
                const elapsedSec = Math.floor((now - prev.startedAtMs) / 1000);
                const remaining = Math.max(0, prev.totalSec - elapsedSec);

                return { ...prev, remainingSec: remaining };
            });
        }, 250);

        return () => clearInterval(id);
    }, [burping]);

    const feedingProgressPercent = useMemo(() => {
        if (!feeding) return 0;
        const done = feeding.totalSec - feeding.remainingSec;
        return (done / feeding.totalSec) * 100;
    }, [feeding]);

    const burpingProgressPercent = useMemo(() => {
        if (!burping) return 0;
        const done = burping.totalSec - burping.remainingSec;
        return (done / burping.totalSec) * 100;
    }, [burping]);



    function startFeeding(e) {
        e.stopPropagation();
        setOpen(false);

        const now = Date.now();

        setSessionDraft({
            babyId: tiny._id,
            feedStartedAtMs: now,
            feedDurationSec: null,
            burpDurationSec: null,
        });

        setFeeding({
            totalSec: totalFeedSec,
            remainingSec: totalFeedSec,
            startedAtMs: now,
        });
    }



    function handleMlSubmit() {
        const ml = parseInt(mlAmount, 10);
        if (isNaN(ml) || ml <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        // Move to confirmation screen
        setShowMlInput(false);
        setShowConfirmation(true);
    }


    async function handleConfirmSave() {
        try {
            const ml = parseInt(mlAmount, 10);
            const d = sessionDraft;

            console.log("Session draft:", d);

            if (!d?.babyId || !d?.feedStartedAtMs || d.feedDurationSec == null || d.burpDurationSec == null) {
                alert("Session timing is incomplete");
                return;
            }

            // Ensure babyId is a string (MongoDB ObjectId)
            const babyIdString = typeof d.babyId === 'object' && d.babyId._id
                ? d.babyId._id
                : String(d.babyId);

            const payload = {
                babyId: babyIdString,
                feedStartedAt: new Date(d.feedStartedAtMs).toISOString(),
                feedDurationSec: Number(d.feedDurationSec),
                burpDurationSec: Number(d.burpDurationSec),
                ml: Number(ml),
            };

            console.log("Sending payload:", payload);

            const response = await fetch("/api/feedings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log("Server response:", result);

            if (!response.ok || !result.ok) {
                alert(`Failed to save: ${result.error?.message || 'Unknown error'}`);
                return;
            }

            alert("Feeding session saved successfully!");

            // reset
            setShowConfirmation(false);
            setMlAmount("");
            setSessionDraft(null);
        } catch (error) {
            console.error("Error saving feeding:", error);
            alert(`Error: ${error.message}`);
        }
    }


    async function handleSaveMl() {
        const ml = parseInt(mlAmount, 10);
        if (isNaN(ml) || ml <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        const d = sessionDraft;
        if (!d?.babyId || !d?.feedStartedAtMs || d.feedDurationSec == null || d.burpDurationSec == null) {
            alert("Session timing is incomplete");
            return;
        }

        const payload = {
            babyId: d.babyId,
            feedStartedAt: new Date(d.feedStartedAtMs).toISOString(),
            feedDurationSec: d.feedDurationSec,
            burpDurationSec: d.burpDurationSec,
            ml,
        };

        await fetch("/api/feedings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        // reset
        setShowMlInput(false);
        setMlAmount("");
        setSessionDraft(null);
    }


    const isFeedingActive = Boolean(feeding);
    const isBurpingActive = Boolean(burping);

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
            onClick={() => {
                if (isFeedingActive) return;
                setOpen((v) => !v);
            }}
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

                {/* This div contains ALL the text - name, birth date, and last feeding */}
                <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                    {/* Baby name */}
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


                    {/* Last feeding - now inside the same column */}
                    {lastFeeding ? (
                        <div
                            style={{
                                fontSize: "clamp(11px, 2.8vw, 12px)",
                                color: "rgba(76, 175, 80, 0.9)",
                                marginTop: 4,
                                fontWeight: 500,
                            }}
                        >
                            🍼 Last fed: {new Date(lastFeeding.feedStartedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* FEED PROCESS UI */}
            {isFeedingActive ? (
                <div
                    style={{
                        borderTop: "1px solid rgba(255,255,255,0.15)",
                        paddingTop: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 10,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ProgressRing
                        value={feedingProgressPercent}
                        centerNode={
                            <AnimatedIcon
                                image1={babyNormal}
                                image2={babyEating}
                                alt="Baby eating"
                                size={150}
                                interval={1000}
                            />
                        }
                    />

                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            letterSpacing: 0.4,
                        }}
                    >
                        {formatMMSS(feeding.remainingSec)}
                    </div>

                    {/* Кнопки управления (минимум, чтобы не мешали). Удалишь/переделаешь потом */}
                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                        <button
                            type="button"
                            onClick={() => {
                                const now = Date.now();

                                const feedDur = feeding
                                    ? Math.max(0, Math.round((now - feeding.startedAtMs) / 1000))
                                    : 0;

                                setSessionDraft(prev => prev ? { ...prev, feedDurationSec: feedDur } : prev);

                                setFeeding(null);

                                // стартуем burp тем же now
                                setBurping({
                                    totalSec: totalBurpSec,
                                    remainingSec: totalBurpSec,
                                    startedAtMs: now,
                                });
                            }}


                            style={{
                                padding: "10px 14px",
                                borderRadius: 12,
                                border: "1px solid rgba(255,255,255,0.16)",
                                background: "rgba(255,255,255,0.08)",
                                color: "rgba(255,255,255,0.92)",
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            Start Burping
                        </button>
                    </div>
                </div>
            ) : null}

            {/* BURP PROCESS UI */}
            {isBurpingActive ? (
                <div
                    style={{
                        borderTop: "1px solid rgba(255,255,255,0.15)",
                        paddingTop: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 10,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ProgressRing
                        value={burpingProgressPercent}  // Changed from feedingProgressPercent
                        centerNode={
                            <AnimatedIcon
                                image1={babyBurp1}
                                image2={babyBurp2}
                                alt="Baby burping"
                                size={150}
                                interval={1000}
                            />
                        }
                    />

                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            letterSpacing: 0.4,
                        }}
                    >
                        {formatMMSS(burping.remainingSec)}
                    </div>

                    {/* Кнопки управления (минимум, чтобы не мешали). Удалишь/переделаешь потом */}
                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                        <button
                            type="button"
                            onClick={() => {
                                const now = Date.now();

                                const burpDur = burping
                                    ? Math.max(0, Math.round((now - burping.startedAtMs) / 1000))
                                    : 0;

                                setSessionDraft(prev => prev ? { ...prev, burpDurationSec: burpDur } : prev);

                                setBurping(null);
                                setShowMlInput(true);
                            }}

                            style={{
                                padding: "10px 14px",
                                borderRadius: 12,
                                border: "1px solid rgba(255,255,255,0.16)",
                                background: "rgba(255,255,255,0.08)",
                                color: "rgba(255,255,255,0.92)",
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            End
                        </button>
                    </div>
                </div>
            ) : null}

            {/* ML INPUT UI */}
            {showMlInput ? (
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
                                handleSaveMl();
                            }
                        }}
                    />

                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                        <button
                            type="button"
                            onClick={handleMlSubmit}
                            style={{
                                padding: "10px 20px",
                                borderRadius: 12,
                                border: "1px solid rgba(76, 175, 80, 0.3)",
                                background: "rgba(76, 175, 80, 0.15)",
                                color: "#4CAF50",
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : null}

            {showConfirmation && sessionDraft ? (
                <ConfirmationScreen
                    sessionDraft={sessionDraft}
                    mlAmount={mlAmount}
                    onUpdateFeedDuration={(val) =>
                        setSessionDraft(prev => prev ? { ...prev, feedDurationSec: val } : prev)
                    }
                    onUpdateBurpDuration={(val) =>
                        setSessionDraft(prev => prev ? { ...prev, burpDurationSec: val } : prev)
                    }
                    onUpdateMlAmount={(val) => setMlAmount(String(val))}
                    onConfirm={handleConfirmSave}
                    onBack={() => {
                        setShowConfirmation(false);
                        setShowMlInput(true);
                    }}
                />
            ) : null}

            {/* Action buttons - responsive grid */}
            {open && !isFeedingActive && !isBurpingActive && !showMlInput && !showConfirmation && (
                <div
                    style={{
                        paddingTop: 12,
                        borderTop: "1px solid rgba(255,255,255,0.15)",
                        display: "grid",
                        gridTemplateColumns:
                            window.innerWidth < 640 ? "1fr" : "repeat(2, minmax(0, 1fr))",
                        gap: 10,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ActionButton label="Start feeding" iconSrc={feedIcon} onClick={startFeeding} />
                    <ActionButton
                        label="Diaper change"
                        iconSrc={diaperIcon}
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log("Diaper");
                        }}
                    />
                    <ActionButton
                        label="Statistics"
                        iconSrc={statsIcon}
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log("Stats");
                        }}
                    />
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
