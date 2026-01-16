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
import PoopConfirmation from "./PoopConfirmation.jsx";
import MlInput from "./Mlinput.jsx";
import StatisticsViewSelector from "./StatisticsViewSelector.jsx";
import DailyStatistics from "./DailyStatistics.jsx";
import WeeklyStatistics from "./WeeklyStatistics.jsx";


const FEED_DURATION_MINUTES_DEFAULT = 20;
const BURP_DURATION_MINUTES_DEFAULT = 10;
const MAX_SESSION_AGE_MS = 3 * 60 * 60 * 1000; // 3 hours

function pad2(n) {
    return String(n).padStart(2, "0");
}

function formatMMSS(totalSeconds) {
    const s = Math.max(0, totalSeconds);
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${pad2(mm)}:${pad2(ss)}`;
}

// Helper functions for localStorage persistence
function getStorageKey(babyId) {
    return `tinycare_session_${babyId}`;
}

function saveSessionToStorage(babyId, sessionState) {
    try {
        const key = getStorageKey(babyId);
        const data = {
            ...sessionState,
            savedAt: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Failed to save session to storage:", error);
    }
}

function loadSessionFromStorage(babyId) {
    try {
        const key = getStorageKey(babyId);
        const stored = localStorage.getItem(key);
        if (!stored) return null;

        const data = JSON.parse(stored);
        const age = Date.now() - data.savedAt;

        // Discard sessions older than MAX_SESSION_AGE_MS
        if (age > MAX_SESSION_AGE_MS) {
            localStorage.removeItem(key);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Failed to load session from storage:", error);
        return null;
    }
}

function clearSessionFromStorage(babyId) {
    try {
        const key = getStorageKey(babyId);
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Failed to clear session from storage:", error);
    }
}

export default function TinyCard({ tiny, onDelete }) {
    const [open, setOpen] = useState(false);
    const [feeding, setFeeding] = useState(null);
    const [burping, setBurping] = useState(null);
    const [showMlInput, setShowMlInput] = useState(false);
    const [mlAmount, setMlAmount] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [lastFeeding, setLastFeeding] = useState(null);
    const [sessionDraft, setSessionDraft] = useState(null);
    const [isRestored, setIsRestored] = useState(false);
    const [showDiaperConfirm, setShowDiaperConfirm] = useState(false);
    const [showStatsSelector, setShowStatsSelector] = useState(false);
    const [showDailyStats, setShowDailyStats] = useState(false);
    const [showWeeklyStats, setShowWeeklyStats] = useState(false);

    const feedDurationMinutes = FEED_DURATION_MINUTES_DEFAULT;
    const burpDurationMinutes = BURP_DURATION_MINUTES_DEFAULT;

    const totalFeedSec = useMemo(
        () => Math.max(1, Math.floor(feedDurationMinutes * 60)),
        [feedDurationMinutes]
    );
    const totalBurpSec = useMemo(
        () => Math.max(1, Math.floor(burpDurationMinutes * 60)),
        [burpDurationMinutes]
    );

    // Restore session from localStorage on mount
    useEffect(() => {
        const restored = loadSessionFromStorage(tiny._id);
        if (!restored) {
            setIsRestored(true);
            return;
        }

        const now = Date.now();

        // Restore feeding state
        if (restored.feeding) {
            const elapsedSec = Math.floor((now - restored.feeding.startedAtMs) / 1000);
            const remainingSec = Math.max(0, restored.feeding.totalSec - elapsedSec);

            if (remainingSec > 0) {
                // Still feeding
                setFeeding({
                    totalSec: restored.feeding.totalSec,
                    remainingSec: remainingSec,
                    startedAtMs: restored.feeding.startedAtMs
                });
                setSessionDraft(restored.sessionDraft);
                setOpen(false);
            } else {
                // Feeding timer expired while away - auto-advance to burping
                const feedDur = Math.floor((now - restored.feeding.startedAtMs) / 1000);
                setSessionDraft({
                    ...restored.sessionDraft,
                    feedDurationSec: feedDur
                });
                setBurping({
                    totalSec: totalBurpSec,
                    remainingSec: totalBurpSec,
                    startedAtMs: now
                });
            }
        }
        // Restore burping state
        else if (restored.burping) {
            const elapsedSec = Math.floor((now - restored.burping.startedAtMs) / 1000);
            const remainingSec = Math.max(0, restored.burping.totalSec - elapsedSec);

            if (remainingSec > 0) {
                // Still burping
                setBurping({
                    totalSec: restored.burping.totalSec,
                    remainingSec: remainingSec,
                    startedAtMs: restored.burping.startedAtMs
                });
                setSessionDraft(restored.sessionDraft);
                setOpen(false);
            } else {
                // Burping timer expired - show ML input
                const burpDur = Math.floor((now - restored.burping.startedAtMs) / 1000);
                setSessionDraft({
                    ...restored.sessionDraft,
                    burpDurationSec: burpDur
                });
                setShowMlInput(true);
            }
        }
        // Restore ML input state
        else if (restored.showMlInput) {
            setSessionDraft(restored.sessionDraft);
            setMlAmount(restored.mlAmount || "");
            setShowMlInput(true);
        }
        // Restore confirmation state
        else if (restored.showConfirmation) {
            setSessionDraft(restored.sessionDraft);
            setMlAmount(restored.mlAmount || "");
            setShowConfirmation(true);
        }

        setIsRestored(true);
    }, [tiny._id, totalBurpSec]);

    // Save session to localStorage whenever state changes
    useEffect(() => {
        if (!isRestored) return; // Don't save during initial restore

        if (feeding || burping || showMlInput || showConfirmation) {
            const sessionState = {
                feeding,
                burping,
                sessionDraft,
                showMlInput,
                mlAmount,
                showConfirmation
            };
            saveSessionToStorage(tiny._id, sessionState);
        } else {
            // Clear storage when no active session
            clearSessionFromStorage(tiny._id);
        }
    }, [feeding, burping, showMlInput, mlAmount, showConfirmation, sessionDraft, tiny._id, isRestored]);

    // Fetch last feeding
    useEffect(() => {
        async function fetchLastFeeding() {
            try {
                const response = await fetch(`/api/feedings/last/${tiny._id}`);
                const result = await response.json();
                if (result.ok && result.data) {
                    setLastFeeding(result.data);
                } else {
                    setLastFeeding(null);
                }
            } catch (error) {
                console.error("Error fetching last feeding:", error);
                setLastFeeding(null);
            }
        }
        fetchLastFeeding();
    }, [tiny._id]);

    // Feeding timer
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
        }, 250);

        return () => clearInterval(id);
    }, [feeding]);

    // Burping timer
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
        setShowMlInput(false);
        setShowConfirmation(true);
    }

    async function handleConfirmSave() {
        try {
            const ml = parseInt(mlAmount, 10);
            const d = sessionDraft;

            if (!d?.babyId || !d?.feedStartedAtMs || d.feedDurationSec == null || d.burpDurationSec == null) {
                alert("Session timing is incomplete");
                return;
            }

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

            const response = await fetch("/api/feedings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.ok) {
                alert(`Failed to save: ${result.error?.message || 'Unknown error'}`);
                return;
            }

            alert("Feeding session saved successfully!");

            // Clear all state and storage
            setShowConfirmation(false);
            setMlAmount("");
            setSessionDraft(null);
            clearSessionFromStorage(tiny._id);
        } catch (error) {
            console.error("Error saving feeding:", error);
            alert(`Error: ${error.message}`);
        }
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
                <div style={{ flexShrink: 0, width: "clamp(80px, 25vw, 128px)", maxWidth: "128px" }}>
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

                    {lastFeeding ? (
                        <div
                            style={{
                                fontWeight: 600,
                                marginBottom: 4,
                                fontSize: "clamp(15px, 3.8vw, 17px)",
                                wordBreak: "break-word",
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
                        value={burpingProgressPercent}
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
                <MlInput
                    onSubmit={(ml) => {
                        setMlAmount(String(ml));
                        setShowMlInput(false);
                        setShowConfirmation(true);
                    }}
                    onCancel={() => setShowMlInput(false)}
                />
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

            {showDiaperConfirm ? (
                <PoopConfirmation
                    tiny={tiny}
                    onSave={() => {
                        setShowDiaperConfirm(false);
                    }}
                    onCancel={() => {
                        setShowDiaperConfirm(false);
                    }}
                />
            ) : null}
            {showStatsSelector ? (
                <StatisticsViewSelector
                    tiny={tiny}
                    onSelectDaily={() => {
                        setShowStatsSelector(false);
                        setShowDailyStats(true);
                    }}
                    onSelectWeekly={() => {
                        setShowStatsSelector(false);
                        setShowWeeklyStats(true);
                    }}
                    onCancel={() => {
                        setShowStatsSelector(false);
                    }}
                />
            ) : null}

            {/* DAILY STATISTICS */}
            {showDailyStats ? (
                <DailyStatistics
                    tiny={tiny}
                    onBack={() => {
                        setShowDailyStats(false);
                        setShowStatsSelector(true); // Go back to selector
                    }}
                />
            ) : null}

            {/* WEEKLY STATISTICS */}
            {showWeeklyStats ? (
                <WeeklyStatistics
                    tiny={tiny}
                    onBack={() => {
                        setShowWeeklyStats(false);
                        setShowStatsSelector(true); // Go back to selector
                    }}
                />
            ) : null}



            {/* Action buttons */}
            {open &&
                !isFeedingActive &&
                !isBurpingActive &&
                !showMlInput &&
                !showConfirmation &&
                !showDiaperConfirm &&
                !showStatsSelector &&
                !showDailyStats &&
                !showWeeklyStats &&(
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
                            setOpen(false);
                            setShowDiaperConfirm(true);
                        }}
                    />
                    <ActionButton
                        label="Statistics"
                        iconSrc={statsIcon}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                            setShowStatsSelector(true);
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