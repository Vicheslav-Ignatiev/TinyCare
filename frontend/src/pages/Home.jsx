import logo from "../assets/Logo.png";
import { useEffect, useState } from "react";
import { listChildren } from "../api/childrenApi";
import CreateTinyForm from "../components/CreateTinyForm";
import TinyCard from "../components/TinyCard";


export default function Home() {
    const [tinys, setTinys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreate, setShowCreate] = useState(false);


    async function loadTinys() {
        setError("");
        setLoading(true);
        try {
            const items = await listChildren();
            setTinys(items);
        } catch (e) {
            setError(e.message || "Failed to load Tinys");
            setTinys([]);
        } finally {
            setLoading(false);
        }
    }

    async function deleteTiny(id) {
        try {
            setError("");

            const res = await fetch(`/api/children/${id}`, { method: "DELETE" });
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                const msg =
                    data?.error?.message || data?.message || `Request failed (${res.status})`;
                throw new Error(msg);
            }

            await loadTinys();
        } catch (e) {
            setError(e.message || "Failed to delete Tiny");
        }
    }


    useEffect(() => {
        loadTinys();
    }, []);

    return (
        <main style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "clamp(16px, 4vw, 48px)",
            width: "100%"
        }}>
            {/* Banner */}
            <section
                style={{
                    padding: "clamp(16px, 4vw, 32px) 0",
                    textAlign: "center",
                    margin: "0 auto",
                }}
            >
                <img
                    src={logo}
                    alt="TinyCare logo"
                    style={{
                        width: "100%",
                        maxWidth: "min(400px, 90vw)",
                        height: "auto",
                        objectFit: "contain",
                    }}
                />
            </section>

            {/* Tinys List */}
            <section style={{ marginTop: "clamp(20px, 5vw, 32px)" }}>
                <h2 style={{
                    margin: "0 0 clamp(12px, 3vw, 16px) 0",
                    fontSize: "clamp(18px, 4vw, 20px)",
                    fontWeight: 600
                }}>
                    Your Tinys
                </h2>

                {loading ? (
                    <p style={{
                        opacity: 0.75,
                        margin: 0,
                        fontSize: "clamp(14px, 3.5vw, 16px)"
                    }}>
                        Loading...
                    </p>
                ) : error ? (
                    <div style={{
                        border: "1px solid #f5c2c7",
                        borderRadius: 12,
                        padding: "clamp(12px, 3vw, 16px)",
                        backgroundColor: "#fff5f5"
                    }}>
                        <div style={{
                            marginBottom: 12,
                            color: "#d63031",
                            fontSize: "clamp(13px, 3.2vw, 15px)",
                            wordBreak: "break-word"
                        }}>
                            {error}
                        </div>
                        <button
                            onClick={loadTinys}
                            style={{
                                padding: "10px 20px",
                                fontSize: "clamp(13px, 3.2vw, 15px)"
                            }}
                        >
                            Retry
                        </button>
                    </div>
                ) : tinys.length === 0 ? (
                    <p style={{
                        opacity: 0.75,
                        margin: 0,
                        fontSize: "clamp(14px, 3.5vw, 16px)"
                    }}>
                        No Tinys yet.
                    </p>
                ) : (
                    <ul style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "grid",
                        gap: "clamp(10px, 2.5vw, 12px)"
                    }}>
                        {tinys.map((t) => (
                            <TinyCard key={t._id} tiny={t} onDelete={deleteTiny} />
                        ))}
                    </ul>
                )}
            </section>

            {/* Add Button / Create Form */}
            <div
                style={{
                    marginTop: "clamp(24px, 6vw, 32px)",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                {!showCreate ? (
                    <button
                        onClick={() => {
                            setError("");
                            setShowCreate(true);
                        }}
                        style={{
                            padding: "clamp(12px, 3vw, 14px) clamp(24px, 6vw, 32px)",
                            borderRadius: 16,
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            background: "linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)",
                            color: "rgba(255, 255, 255, 0.95)",
                            cursor: "pointer",
                            fontSize: "clamp(14px, 3.5vw, 16px)",
                            fontWeight: 600,
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                            transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 6px 24px rgba(0, 0, 0, 0.5)";
                            e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.4)";
                            e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                        }}
                    >
                        + Add New Tiny
                    </button>
                ) : (
                    <CreateTinyForm
                        setError={setError}
                        onCancel={() => setShowCreate(false)}
                        onCreated={async () => {
                            setShowCreate(false);
                            await loadTinys();
                        }}
                    />
                )}
            </div>
        </main>
    );
}