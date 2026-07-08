import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import PinEntry from "../components/PinEntry";

function AdminSetup({ onComplete }) {
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");

    const handleSetup = async e => {
        e.preventDefault();
        if (pin !== confirmPin) return setError("PINs do not match");
        if (!/^\d{4}$/.test(pin)) return setError("PIN must be 4 digits");
        try {
            const { data } = await api.post("/admin/setup", { pin });
            localStorage.setItem("adminToken", data.token);
            onComplete();
        } catch (err) {
            setError(err.response?.data?.message || "Setup failed");
        }
    };

    return (
        <div className="auth-card" style={{ margin: "0 auto" }}>
            <h2>Huda Masjid</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                First time setup: create a 4‑digit PIN
            </p>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleSetup}>
                <label htmlFor="setup-pin">PIN</label>
                <input
                    id="setup-pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="4"
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                />
                <label htmlFor="confirm-pin">Confirm PIN</label>
                <input
                    id="confirm-pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="4"
                    value={confirmPin}
                    onChange={e =>
                        setConfirmPin(e.target.value.replace(/\D/g, ""))
                    }
                    required
                />
                <button type="submit" className="btn-primary">
                    Set PIN
                </button>
            </form>
        </div>
    );
}

export default function AdminAuth() {
    const navigate = useNavigate();
    const [setupRequired, setSetupRequired] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/admin/status");
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
            <div className="lock-container">
                <AdminSetup onComplete={() => navigate("/admin/dashboard")} />
            </div>
        );
    }

    return (
        <div className="lock-container">
            <PinEntry
                title="Admin Dashboard"
                subtitle="Huda Masjid Halqa Manager"
                showBack={false}
                onCancel={() => navigate("/")}
                onVerify={async pin => {
                    try {
                        const { data } = await api.post("/admin/login", {
                            pin
                        });
                        // ★ Clear teacher tokens so the interceptor uses the admin token
                        sessionStorage.removeItem("teacherToken");
                        sessionStorage.removeItem("teacherClass");
                        localStorage.setItem("adminToken", data.token);
                        navigate("/admin/dashboard");
                        return { success: true };
                    } catch (err) {
                        return { success: false, message: "Invalid PIN" };
                    }
                }}
            />
        </div>
    );
}
