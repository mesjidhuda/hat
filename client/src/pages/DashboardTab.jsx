import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import {
    getTodayEthiopian,
    formatEthiopianDate
} from "../utils/ethiopianCalendar";
import FlaggedStudentsModal from "../components/FlaggedStudentsModal";

// Small SVG icon component (only the icons used in stats)
const Icon = ({ name, color = "var(--accent)" }) => {
    const icons = {
        users: (
            <>
                <circle cx="8" cy="8" r="3" />
                <path d="M2 18v-2a6 6 0 0 1 12 0v2" />
                <circle cx="16" cy="10" r="2" />
                <path d="M12 18v-2a4 4 0 0 1 8 0v2" />
            </>
        ),
        bookOpen: (
            <>
                <path d="M4 4h16v16H4z" />
                <path d="M4 4h8v16H4z" />
            </>
        ),
        alertTriangle: (
            <>
                <path d="M12 9v4M12 17h.01" />
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </>
        ),
        checkCircle: (
            <>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </>
        )
    };
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {icons[name]}
        </svg>
    );
};

export default function DashboardTab() {
    const todayEth = getTodayEthiopian();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalClasses: 0,
        flaggedStudents: 0,
        sessionsToday: 0
    });
    const [classes, setClasses] = useState([]);
    const [submittedClassIds, setSubmittedClassIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Flagged students modal state
    const [flaggedModalOpen, setFlaggedModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const today = new Date().toISOString().split("T")[0];
            const [studentsRes, classesRes, flagsRes, logsRes] =
                await Promise.all([
                    api.get("/students"),
                    api.get("/classes"),
                    api.get("/flags"),
                    api.get("/teacher-log")
                ]);
            const students = studentsRes.data;
            const allClasses = classesRes.data;
            const flags = flagsRes.data;
            const logs = logsRes.data;

            const todayLogs = logs.filter(
                log => log.sessionDate && log.sessionDate.startsWith(today)
            );
            const uniqueClassIds = [
                ...new Set(todayLogs.map(log => log.class?._id || log.class))
            ];

            setStats({
                totalStudents: students.length,
                totalClasses: allClasses.length,
                flaggedStudents: flags.length,
                sessionsToday: uniqueClassIds.length
            });
            setClasses(allClasses);
            setSubmittedClassIds(uniqueClassIds);
            setLoading(false);
        } catch (err) {
            setError("Failed to load dashboard data");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div
                style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "var(--text-secondary)"
                }}
            >
                Loading…
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#f44336"
                }}
            >
                {error}
            </div>
        );
    }

    const classList = classes
        .map(c => ({
            ...c,
            submitted: submittedClassIds.includes(c._id)
        }))
        .sort((a, b) => (b.submitted ? 1 : 0) - (a.submitted ? 1 : 0));

    return (
        <>
            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box">
                            <Icon name="users" color="var(--accent)" />
                        </div>
                    </div>
                    <div className="stat-number">{stats.totalStudents}</div>
                    <div className="stat-label">Total Students</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box">
                            <Icon name="bookOpen" color="var(--accent)" />
                        </div>
                    </div>
                    <div className="stat-number">{stats.totalClasses}</div>
                    <div className="stat-label">Total Classes</div>
                </div>
                {/* Clickable Flagged Students card */}
                <div
                    className="stat-card"
                    onClick={() => setFlaggedModalOpen(true)}
                    style={{ cursor: "pointer" }}
                >
                    <div className="stat-header">
                        <div className="stat-icon-box">
                            <Icon name="alertTriangle" color="#f44336" />
                        </div>
                    </div>
                    <div className="stat-number">{stats.flaggedStudents}</div>
                    <div className="stat-label">Flagged Students</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box">
                            <Icon name="checkCircle" color="#4caf50" />
                        </div>
                    </div>
                    <div className="stat-number">{stats.sessionsToday}</div>
                    <div className="stat-label">Sessions Today</div>
                </div>
            </div>

            {/* Summary Card */}
            <div className="summary-card">
                <div className="summary-title">Today's Summary</div>
                <div className="summary-date">
                    {formatEthiopianDate(todayEth)}
                </div>
                <div className="summary-content">
                    {stats.sessionsToday > 0
                        ? `${stats.sessionsToday} class${stats.sessionsToday !== 1 ? "es" : ""} submitted attendance today.`
                        : "No attendance recorded yet today."}
                </div>
            </div>

            {/* Class Submissions Today */}
            <div style={{ marginTop: 20 }}>
                <div
                    style={{
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        marginBottom: 10
                    }}
                >
                    Class Submissions Today
                </div>
                {classList.length === 0 ? (
                    <p
                        style={{
                            color: "var(--text-muted)",
                            textAlign: "center",
                            padding: "20px 0"
                        }}
                    >
                        No classes defined yet.
                    </p>
                ) : (
                    classList.map(c => (
                        <div
                            key={c._id}
                            style={{
                                borderBottom: "1px solid var(--glass-border)",
                                padding: "12px 0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    textAlign: "left"
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "Cairo, sans-serif",
                                        fontWeight: 600,
                                        fontSize: "0.95rem",
                                        color: "var(--text-primary)"
                                    }}
                                >
                                    {c.name}
                                </span>
                                <span
                                    style={{
                                        fontFamily: "Cairo, sans-serif",
                                        fontSize: "0.75rem",
                                        color: "var(--text-secondary)"
                                    }}
                                >
                                    {c.teacherName}
                                </span>
                            </div>
                            <div
                                style={{
                                    color: c.submitted
                                        ? "#4caf50"
                                        : "var(--text-secondary)",
                                    fontSize: "0.8rem",
                                    fontWeight: 500
                                }}
                            >
                                {c.submitted ? "Submitted" : "Pending"}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Flagged Students Modal */}
            <FlaggedStudentsModal
                isOpen={flaggedModalOpen}
                onClose={() => setFlaggedModalOpen(false)}
            />
        </>
    );
}
