import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "../components/Toast";

export default function TeacherProfile() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get(`/teachers/${classId}/profile`);
                setProfile(data);
            } catch {
                toast.error("Could not load teacher profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [classId]);

    if (loading) {
        return (
            <div
                style={{
                    maxWidth: 500,
                    margin: "0 auto",
                    padding: 30,
                    textAlign: "center",
                    color: "var(--text-secondary)"
                }}
            >
                Loading…
            </div>
        );
    }

    if (!profile) {
        return (
            <div
                style={{
                    maxWidth: 500,
                    margin: "0 auto",
                    padding: 30,
                    textAlign: "center",
                    color: "#f44336"
                }}
            >
                Profile not found.
            </div>
        );
    }

    const { teacher, stats, monthlyTrends, students, recentSessions } = profile;

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

            {/* Teacher Header */}
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
                    {teacher.name?.charAt(0)}
                </div>
                <h2
                    style={{
                        fontFamily: "Merriweather, serif",
                        color: "var(--accent)",
                        marginBottom: 4
                    }}
                >
                    {teacher.name}
                </h2>
                <p
                    style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem"
                    }}
                >
                    Class: {teacher.className}
                </p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{stats.totalStudents}</div>
                    <div className="stat-label">Students</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.totalRecords}</div>
                    <div className="stat-label">Total Records</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: "#4caf50" }}>
                        {stats.attendanceRate}%
                    </div>
                    <div className="stat-label">Attendance Rate</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{recentSessions.length}</div>
                    <div className="stat-label">Sessions</div>
                </div>
            </div>

            {/* Monthly Trend */}
            {monthlyTrends.length > 0 && (
                <div className="summary-card">
                    <div className="summary-title">Monthly Class Trend</div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: 8,
                            height: 80,
                            marginTop: 10
                        }}
                    >
                        {monthlyTrends.map((t, i) => (
                            <div
                                key={i}
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 4
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "0.6rem",
                                        color: "var(--accent)",
                                        fontWeight: 600
                                    }}
                                >
                                    {t.rate}%
                                </div>
                                <div
                                    style={{
                                        width: "100%",
                                        height: `${t.rate}%`,
                                        background: "var(--accent)",
                                        borderRadius: "4px 4px 0 0",
                                        minHeight: 4,
                                        opacity: 0.8
                                    }}
                                />
                                <div
                                    style={{
                                        fontSize: "0.55rem",
                                        color: "var(--text-muted)"
                                    }}
                                >
                                    {t.month.slice(5)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Student Roster with Stats */}
            <div className="summary-card">
                <div className="summary-title">
                    Student Roster ({students.length})
                </div>
                {students.map(s => (
                    <div
                        key={s._id}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 0",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            cursor: "pointer"
                        }}
                        onClick={() => navigate(`/student/${s._id}`)}
                    >
                        <div>
                            <div
                                style={{
                                    fontFamily: "Cairo, sans-serif",
                                    fontWeight: 600,
                                    fontSize: "0.9rem"
                                }}
                            >
                                {s.name}
                            </div>
                            <div
                                style={{
                                    fontSize: "0.7rem",
                                    color: "var(--text-secondary)"
                                }}
                            >
                                {s.totalRecords} records
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div
                                style={{
                                    fontWeight: 600,
                                    color:
                                        parseFloat(s.attendanceRate) >= 80
                                            ? "#4caf50"
                                            : parseFloat(s.attendanceRate) >= 50
                                              ? "#ffc107"
                                              : "#f44336",
                                    fontSize: "0.9rem"
                                }}
                            >
                                {s.attendanceRate}%
                            </div>
                            <div
                                style={{
                                    fontSize: "0.7rem",
                                    color: "var(--text-muted)"
                                }}
                            >
                                A: {s.Absent} | P: {s.Present}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
