import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Modal from "../components/Modal";

export default function FlaggedStudentsModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        const fetchFlags = async () => {
            try {
                const { data } = await api.get("/flags");
                setFlags(data);
            } catch (err) {
                console.error("Failed to load flags", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFlags();
    }, [isOpen]);

    const handleStudentClick = studentId => {
        onClose();
        navigate(`/student/${studentId}`);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Flagged Students">
            {loading ? (
                <p
                    style={{
                        color: "var(--text-secondary)",
                        textAlign: "center"
                    }}
                >
                    Loading…
                </p>
            ) : flags.length === 0 ? (
                <p
                    style={{
                        color: "var(--text-muted)",
                        textAlign: "center",
                        padding: "20px 0"
                    }}
                >
                    No flagged students.
                </p>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12
                    }}
                >
                    {flags.map(flag => {
                        const studentName = flag.student?.name || "Unknown";
                        const className =
                            flag.student?.class?.name || "Unknown class";
                        return (
                            <div
                                key={flag._id}
                                style={{
                                    background:
                                        flag.type === "Auto"
                                            ? "rgba(244,67,54,0.1)"
                                            : "rgba(212,175,55,0.1)",
                                    border: `1px solid ${flag.type === "Auto" ? "rgba(244,67,54,0.3)" : "rgba(212,175,55,0.3)"}`,
                                    borderRadius: 12,
                                    padding: "12px 16px",
                                    cursor: "pointer"
                                }}
                                onClick={() =>
                                    handleStudentClick(flag.student?._id)
                                }
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "Cairo, sans-serif",
                                            fontWeight: 600,
                                            fontSize: "0.95rem",
                                            color:
                                                flag.type === "Auto"
                                                    ? "#f44336"
                                                    : "var(--accent)"
                                        }}
                                    >
                                        {studentName}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "0.75rem",
                                            color: flag.resolved
                                                ? "#4caf50"
                                                : "var(--text-muted)"
                                        }}
                                    >
                                        {flag.resolved ? "Resolved" : "Active"}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "var(--text-secondary)",
                                        marginTop: 4
                                    }}
                                >
                                    {className}
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "var(--text-muted)",
                                        marginTop: 4
                                    }}
                                >
                                    {flag.reason}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Modal>
    );
}
