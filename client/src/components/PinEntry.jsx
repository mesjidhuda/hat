import { useState, useEffect, useRef } from "react";

export default function PinEntry({
    title,
    subtitle,
    onVerify, // async (pin) => { success: boolean, message?: string }
    onCancel, // function to go back
    showBack = true
}) {
    const [pin, setPin] = useState("");
    const [status, setStatus] = useState({ type: "", text: "" });
    const [shake, setShake] = useState(false);
    const [processing, setProcessing] = useState(false);
    const inputRef = useRef(null);

    // Auto‑focus the input
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Auto‑verify on 4 digits
    useEffect(() => {
        if (pin.length === 4 && !processing) {
            handleVerify(pin);
        }
    }, [pin]);

    const handleVerify = async fullPin => {
        setProcessing(true);
        try {
            const result = await onVerify(fullPin);
            if (result.success) {
                setStatus({
                    type: "success",
                    text: result.message || "Access Granted"
                });
                // navigation handled by onVerify
            } else {
                setStatus({
                    type: "error",
                    text: result.message || "Incorrect PIN"
                });
                setShake(true);
                setTimeout(() => {
                    setPin("");
                    setStatus({ type: "", text: "" });
                    setShake(false);
                    setProcessing(false);
                    if (inputRef.current) inputRef.current.focus();
                }, 1200);
            }
        } catch (err) {
            setStatus({ type: "error", text: "Network error" });
            setShake(true);
            setTimeout(() => {
                setPin("");
                setStatus({ type: "", text: "" });
                setShake(false);
                setProcessing(false);
                if (inputRef.current) inputRef.current.focus();
            }, 1200);
        }
    };

    const handleChange = e => {
        if (processing) return;
        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
        setPin(value);
    };

    const dotClass = index => {
        if (status.type === "success") return "pin-dot success";
        if (status.type === "error") return "pin-dot error";
        return `pin-dot ${index < pin.length ? "filled" : ""}`;
    };

    return (
        <div className="pin-entry-container">
            {/* Back navigation (optional) */}
            {showBack && (
                <div style={{ width: "100%", marginBottom: 20 }}>
                    <button
                        onClick={onCancel}
                        style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="18"
                            height="18"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back
                    </button>
                </div>
            )}

            {/* Lock Icon */}
            <svg
                viewBox="0 0 24 24"
                className="pin-entry-lock-icon"
                fill="none"
            >
                <rect x="4" y="11" width="16" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <circle cx="12" cy="16" r="1" fill="var(--accent)" />
            </svg>

            {/* Title */}
            <div className="pin-entry-header">
                <h2 className="pin-entry-title">{title}</h2>
                {subtitle && <p className="pin-entry-subtitle">{subtitle}</p>}
            </div>

            {/* Pin Dots */}
            <div className={`pin-dots-row ${shake ? "shake" : ""}`}>
                {[0, 1, 2, 3].map(i => (
                    <span key={i} className={dotClass(i)} />
                ))}
            </div>

            {/* Hidden input for keyboard */}
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={handleChange}
                className="pin-input-visible"
                placeholder="••••"
                autoComplete="off"
                disabled={processing}
            />

            {/* Status message */}
            {status.text && (
                <div className={`pin-status-msg visible ${status.type}`}>
                    {status.text}
                </div>
            )}

            {/* Cancel button – shown when showBack is true */}
            {showBack && (
                <button
                    onClick={onCancel}
                    style={{
                        marginTop: "var(--space-2xl)",
                        background: "transparent",
                        border: "1px solid var(--glass-border)",
                        color: "var(--text-secondary)",
                        padding: "6px 18px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "var(--font-family)"
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background =
                            "rgba(255,255,255,0.08)";
                        e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                >
                    Cancel
                </button>
            )}
        </div>
    );
}
