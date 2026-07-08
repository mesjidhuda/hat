import { useState, useEffect } from "react";
import api from "../utils/api";

export default function AdminFlagBanner() {
    const [flags, setFlags] = useState([]);

    const fetchFlags = async () => {
        try {
            const { data } = await api.get("/flags");
            setFlags(data);
        } catch (err) {
            // handle if needed
        }
    };

    useEffect(() => {
        fetchFlags();
    }, []);

    const handleUnflag = async flagId => {
        try {
            await api.put(`/flags/${flagId}/resolve`);
            fetchFlags();
        } catch (err) {
            alert("Unflag failed");
        }
    };

    const autoFlags = flags.filter(f => f.type === "Auto");
    const behaviorFlags = flags.filter(f => f.type === "Behavior");

    if (flags.length === 0) return null;

    return (
        <div className="flag-banner">
            {autoFlags.length > 0 && (
                <div className="flag-section">
                    <h4>Auto‑flagged (consecutive absences)</h4>
                    <ul>
                        {autoFlags.map(f => (
                            <li key={f._id}>
                                <strong>{f.student?.name}</strong> (
                                {f.student?.class?.name}) – {f.reason}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {behaviorFlags.length > 0 && (
                <div className="flag-section">
                    <h4>Behavior‑flagged</h4>
                    <ul>
                        {behaviorFlags.map(f => (
                            <li key={f._id}>
                                <strong>{f.student?.name}</strong> (
                                {f.student?.class?.name})<br />
                                Reason: {f.reason}
                                <br />
                                <small>
                                    Flagged:{" "}
                                    {new Date(
                                        f.dateFlagged
                                    ).toLocaleDateString()}
                                </small>
                                <button
                                    onClick={() => handleUnflag(f._id)}
                                    className="unflag-btn"
                                >
                                    Unflag
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
