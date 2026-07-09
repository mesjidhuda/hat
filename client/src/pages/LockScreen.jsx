import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import PinEntry from "../components/PinEntry";

export default function LockScreen() {
    const navigate = useNavigate();
    const [setupRequired, setSetupRequired] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/app/status");
                setSetupRequired(data.setupRequired);
            } catch (err) {
                // ignore
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <div className="lock-container">
                <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
            </div>
        );
    }

    if (setupRequired) {
        return (
            <AppSetup
                onComplete={() => {
                    sessionStorage.setItem("appUnlocked", "true");
                    navigate("/");
                }}
            />
        );
    }

    return (
        <div className="lock-container">
            <PinEntry
                title="Huda Masjid"
                subtitle="Halqa Manager"
                showBack={false}
                onCancel={() => {}}
                onVerify={async pin => {
                    try {
                        await api.post("/app/verify", { pin });
                        sessionStorage.setItem("appUnlocked", "true");
                        navigate("/");
                        return { success: true };
                    } catch (err) {
                        return { success: false, message: "Invalid PIN" };
                    }
                }}
            />
        </div>
    );
}

// Premium first‑time app setup
function AppSetup({ onComplete }) {
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");

    const handleSetup = async e => {
        e.preventDefault();
        if (pin !== confirmPin) return setError("PINs do not match");
        if (!/^\d{4}$/.test(pin)) return setError("PIN must be 4 digits");
        try {
            await api.post("/app/setup", { pin });
            onComplete();
        } catch (err) {
            setError(err.response?.data?.message || "Setup failed");
        }
    };

    return (
        <div className="lock-container">
            <div className="pin-entry-container">
                {/* Lock Icon */}
                <svg viewBox="0 0 24 24" className="pin-entry-lock-icon" fill="none">
                    <rect x="4" y="11" width="16" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    <circle cx="12" cy="16" r="1" fill="var(--accent)" />
                </svg>

                <div className="pin-entry-header">
                    <h2 className="pin-entry-title">Huda Masjid</h2>
                    <p className="pin-entry-subtitle">Halqa Manager – Create App PIN</p>
                </div>

                {error && <p className="error-msg" style={{ marginBottom: 15 }}>{error}</p>}

                <form onSubmit={handleSetup} style={{ width: "100%", maxWidth: 280, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                    {/* PIN Field */}
                    <div style={{ width: "100%" }}>
                        <label style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: 6, display: "block", textAlign: "left" }}>
                            Create PIN
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength="4"
                            value={pin}
                            onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                            className="pin-input-visible"
                            placeholder="••••"
                            autoFocus
                            required
                        />
                    </div>

                    {/* Confirm PIN Field */}
                    <div style={{ width: "100%" }}>
                        <label style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: 6, display: "block", textAlign: "left" }}>
                            Confirm PIN
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength="4"
                            value={confirmPin}
                            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                            className="pin-input-visible"
                            placeholder="••••"
                            required
                        />
                    </div>

                    <button type="submit" className="add-btn" style={{ width: "100%", marginTop: 10 }}>
                        Set PIN
                    </button>
                </form>
            </div>
        </div>
    );
}