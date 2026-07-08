import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "../components/Toast";

export default function StudentProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError("");
            try {
                const { data } = await api.get(`/students/${id}/profile`);
                setProfile(data);
            } catch (err) {
                console.error("Profile fetch error:", err);
                setError("Could not load student profile");
                toast.error("Could not load student profile");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div
                className="dashboard-container"
                style={{ textAlign: "center", padding: 40 }}
            >
                <p style={{ color: "var(--text-secondary)" }}>
                    Loading profile...
                </p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div
                className="dashboard-container"
                style={{ textAlign: "center", padding: 40 }}
            >
                <p style={{ color: "#f44336" }}>
                    {error || "Profile not found"}
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="add-btn"
                    style={{ marginTop: 20 }}
                >
                    Go Back
                </button>
            </div>
        );
    }

    const { student, attendance, flags } = profile;

    // Calculate stats
    const statusCounts = { Present: 0, Late: 0, Absent: 0, Excused: 0 };
    attendance.forEach(r => {
        if (statusCounts.hasOwnProperty(r.status)) {
            statusCounts[r.status]++;
        }
    });
    const totalRecords = attendance.length;
    const attendanceRate =
        totalRecords > 0
            ? (
                  ((statusCounts.Present + statusCounts.Late) / totalRecords) *
                  100
              ).toFixed(1)
            : "0.0";

    return (
        <div className="dashboard-container">
            {/* Navigation */}
            <nav className="dash-nav">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        width="24"
                        height="24"
                    >
                        <polyline
                            points="15 18 9 12 15 6"
                            stroke="var(--text-secondary)"
                        />
                    </svg>
                </button>
            </nav>

            {/* Student Header */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: "rgba(212,175,55,0.2)",
                        margin: "0 auto 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.8rem",
                        color: "var(--accent)",
                        fontWeight: 700,
                        fontFamily: "Cairo, sans-serif"
                    }}
                >
                    {(student.name || "?").charAt(0)}
                </div>
                <h2
                    style={{
                        fontFamily: "Merriweather, serif",
                        color: "var(--accent)",
                        marginBottom: 4,
                        fontSize: "1.3rem"
                    }}
                >
                    {student.name}
                </h2>
                <p
                    style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                        margin: 0
                    }}
                >
                    {student.class || "No class"} •{" "}
                    {student.parentPhone || "No phone"}
                </p>
                <p
                    style={{
                        color: "var(--text-muted)",
                        fontSize: "0.75rem",
                        margin: "4px 0 0"
                    }}
                >
                    Enrolled:{" "}
                    {student.enrollmentDate
                        ? new Date(student.enrollmentDate).toLocaleDateString(
                              "en-US",
                              {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                              }
                          )
                        : "N/A"}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{totalRecords}</div>
                    <div className="stat-label">Total Records</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: "#4caf50" }}>
                        {attendanceRate}%
                    </div>
                    <div className="stat-label">Attendance Rate</div>
                </div>
                <div className="stat-card">
                    <div
                        className="stat-number"
                        style={{
                            color:
                                statusCounts.Absent > 0
                                    ? "#f44336"
                                    : "var(--text-primary)"
                        }}
                    >
                        {statusCounts.Absent}
                    </div>
                    <div className="stat-label">Absences</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{statusCounts.Late}</div>
                    <div className="stat-label">Late</div>
                </div>
            </div>

            {/* Status Breakdown */}
            <div className="summary-card">
                <div className="summary-title">Status Breakdown</div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {[
                        {
                            label: "Present",
                            count: statusCounts.Present,
                            color: "#4caf50"
                        },
                        {
                            label: "Late",
                            count: statusCounts.Late,
                            color: "#2196f3"
                        },
                        {
                            label: "Absent",
                            count: statusCounts.Absent,
                            color: "#f44336"
                        },
                        {
                            label: "Excused",
                            count: statusCounts.Excused,
                            color: "#ffc107"
                        }
                    ].map(s => (
                        <div
                            key={s.label}
                            style={{
                                flex: 1,
                                textAlign: "center",
                                background: "var(--glass)",
                                borderRadius: 10,
                                padding: "8px 4px",
                                border: "1px solid var(--glass-border)"
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: s.color
                                }}
                            >
                                {s.count}
                            </div>
                            <div
                                style={{
                                    fontSize: "0.6rem",
                                    color: "var(--text-secondary)"
                                }}
                            >
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Flags */}
            {flags && flags.length > 0 && (
                <div className="summary-card">
                    <div className="summary-title">Flags ({flags.length})</div>
                    {flags.map(flag => (
                        <div
                            key={flag._id}
                            style={{
                                background:
                                    flag.type === "Auto"
                                        ? "rgba(244,67,54,0.1)"
                                        : "rgba(212,175,55,0.1)",
                                border: `1px solid ${flag.type === "Auto" ? "rgba(244,67,54,0.3)" : "rgba(212,175,55,0.3)"}`,
                                borderRadius: 10,
                                padding: "10px 14px",
                                marginTop: 8
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: 600,
                                        color:
                                            flag.type === "Auto"
                                                ? "#f44336"
                                                : "var(--accent)",
                                        fontSize: "0.85rem"
                                    }}
                                >
                                    {flag.type === "Auto"
                                        ? "Auto-Flag"
                                        : "Behavior Flag"}
                                </span>
                                <span
                                    style={{
                                        fontSize: "0.7rem",
                                        color: flag.resolved
                                            ? "#4caf50"
                                            : "var(--text-muted)"
                                    }}
                                >
                                    {flag.resolved ? "Resolved" : "Active"}
                                </span>
                            </div>
                            <p
                                style={{
                                    color: "var(--text-secondary)",
                                    fontSize: "0.8rem",
                                    margin: "4px 0 0"
                                }}
                            >
                                {flag.reason}
                            </p>
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    fontSize: "0.7rem",
                                    margin: "4px 0 0"
                                }}
                            >
                                Flagged:{" "}
                                {new Date(
                                    flag.dateFlagged
                                ).toLocaleDateString()}
                                {flag.resolvedDate &&
                                    ` | Resolved: ${new Date(flag.resolvedDate).toLocaleDateString()}`}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Recent Attendance */}
            <div className="summary-card">
                <div className="summary-title">
                    Recent Attendance ({totalRecords} total)
                </div>
                {attendance.length === 0 ? (
                    <p
                        style={{
                            color: "var(--text-muted)",
                            textAlign: "center",
                            padding: 10
                        }}
                    >
                        No attendance records
                    </p>
                ) : (
                    attendance.slice(0, 20).map(rec => (
                        <div
                            key={rec._id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 0",
                                borderBottom:
                                    "1px solid rgba(255,255,255,0.05)",
                                fontSize: "0.85rem"
                            }}
                        >
                            <span style={{ color: "var(--text-secondary)" }}>
                                {rec.date
                                    ? new Date(rec.date).toLocaleDateString()
                                    : "N/A"}
                            </span>
                            <span
                                style={{
                                    fontWeight: 600,
                                    color:
                                        rec.status === "Present"
                                            ? "#4caf50"
                                            : rec.status === "Late"
                                              ? "#2196f3"
                                              : rec.status === "Absent"
                                                ? "#f44336"
                                                : "#ffc107"
                                }}
                            >
                                {rec.status}
                            </span>
                            <span
                                style={{
                                    color: "var(--text-muted)",
                                    fontSize: "0.75rem",
                                    maxWidth: 120,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {rec.note || ""}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
