import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
    formatEthiopianDate,
    getTodayEthiopian
} from "../utils/ethiopianCalendar";

// Category configuration – icons, colours, labels
const categoryConfig = {
    present: {
        label: "Present",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
        color: "#d4af37"
    },
    late: {
        label: "Late",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
        color: "#d4af37"
    },
    absent: {
        label: "Absent",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        ),
        color: "#d4af37"
    },
    excused: {
        label: "Excused",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20 6L9 17l-5-5" />
            </svg>
        ),
        color: "#d4af37"
    },
    flagged: {
        label: "Flagged",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
        ),
        color: "#e74c3c"
    },
    notes: {
        label: "With Notes",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
        ),
        color: "#d4af37"
    }
};

export default function CategoryDetail() {
    const { category } = useParams(); // e.g., 'late', 'absent', 'present', 'excused', 'flagged', 'notes'
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeClass, setActiveClass] = useState(null);

    const today = getTodayEthiopian();
    const config = categoryConfig[category] || categoryConfig.present;

    useEffect(() => {
        (async () => {
            try {
                const { data: todayData } = await api.get("/reports/today");
                setData(todayData);
                const group = todayData.groups[capitalize(category)] || [];
                const classList = [...new Set(group.map(s => s.class))];
                if (classList.length > 0) setActiveClass(classList[0]);
            } catch (err) {
                console.error("Category fetch error:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [category]);

    const capitalize = str => {
        if (str === "flagged") return "Flagged";
        if (str === "notes") return "Note";
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    if (loading) {
        return (
            <div
                style={{
                    maxWidth: 450,
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

    if (!data) {
        return (
            <div
                style={{
                    maxWidth: 450,
                    margin: "0 auto",
                    padding: 30,
                    textAlign: "center",
                    color: "#f44336"
                }}
            >
                Could not load data.
            </div>
        );
    }

    const group = data.groups[capitalize(category)] || [];
    const classList = [...new Set(group.map(s => s.class))];
    const filtered = activeClass
        ? group.filter(s => s.class === activeClass)
        : [];

    // ── Analysis ──
    const totalInCategory = group.length;
    const classAnalysis = classList
        .map(cls => ({
            className: cls,
            count: group.filter(s => s.class === cls).length
        }))
        .sort((a, b) => b.count - a.count);

    // Percentage of total for each class
    const maxCount = classAnalysis.length ? classAnalysis[0].count : 1;

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

            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 10
                }}
            >
                <div
                    style={{
                        color: config.color,
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    {config.icon}
                </div>
                <div>
                    <h2
                        style={{
                            fontFamily: "Merriweather, serif",
                            fontWeight: 700,
                            fontSize: "1.3rem",
                            color: "var(--accent)",
                            margin: 0
                        }}
                    >
                        {config.label} Students
                    </h2>
                    <p
                        style={{
                            fontSize: "0.75rem",
                            color: "var(--accent)",
                            opacity: 0.8,
                            margin: 0
                        }}
                    >
                        {formatEthiopianDate(today)}
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="stats-grid">
                <div
                    className="stat-card"
                    style={{ borderColor: `${config.color}30` }}
                >
                    <div
                        className="stat-number"
                        style={{ color: config.color }}
                    >
                        {totalInCategory}
                    </div>
                    <div className="stat-label">Total {config.label}</div>
                </div>
                <div
                    className="stat-card"
                    style={{ borderColor: `${config.color}30` }}
                >
                    <div className="stat-number">{classList.length}</div>
                    <div className="stat-label">Classes Affected</div>
                </div>
            </div>

            {/* Analysis: Per‑Class Breakdown */}
            {classAnalysis.length > 0 && (
                <div className="summary-card">
                    <div className="summary-title">Distribution by Class</div>
                    {classAnalysis.map(cls => (
                        <div key={cls.className} style={{ marginTop: 10 }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 4
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "0.85rem",
                                        color: "var(--text-secondary)",
                                        fontFamily: "Cairo, sans-serif"
                                    }}
                                >
                                    {cls.className}
                                </span>
                                <span
                                    style={{
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        color: config.color
                                    }}
                                >
                                    {cls.count} student
                                    {cls.count !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <div
                                style={{
                                    height: 6,
                                    width: "100%",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: 10
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${(cls.count / maxCount) * 100}%`,
                                        background: config.color,
                                        borderRadius: 10,
                                        transition: "width 0.3s ease"
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Class Tabs (pill carousel) */}
            {classList.length > 0 && (
                <div style={{ marginTop: 15 }}>
                    <div
                        style={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            marginBottom: 10,
                            color: "var(--text-primary)"
                        }}
                    >
                        Classes
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            overflowX: "auto",
                            paddingBottom: 10
                        }}
                    >
                        {classList.map(cls => (
                            <button
                                key={cls}
                                onClick={() => setActiveClass(cls)}
                                style={{
                                    background:
                                        activeClass === cls
                                            ? config.color
                                            : "var(--glass)",
                                    color:
                                        activeClass === cls
                                            ? "#fff"
                                            : "var(--text-secondary)",
                                    border:
                                        activeClass === cls
                                            ? "none"
                                            : "1px solid var(--glass-border)",
                                    borderRadius: 20,
                                    padding: "8px 16px",
                                    fontWeight: 600,
                                    fontSize: "0.8rem",
                                    whiteSpace: "nowrap",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    boxShadow:
                                        activeClass === cls
                                            ? `0 4px 12px ${config.color}40`
                                            : "none"
                                }}
                            >
                                {cls} (
                                {classAnalysis.find(c => c.className === cls)
                                    ?.count || 0}
                                )
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Student List for Active Class */}
            {activeClass && filtered.length > 0 && (
                <div className="summary-card" style={{ marginTop: 10 }}>
                    <div
                        className="summary-title"
                        style={{ color: config.color }}
                    >
                        {activeClass}
                    </div>
                    {filtered.map(student => (
                        <div
                            key={student._id}
                            onClick={() => navigate(`/student/${student._id}`)}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px 0",
                                borderBottom: "1px solid var(--glass-border)",
                                cursor: "pointer",
                                transition: "background 0.15s"
                            }}
                            onMouseEnter={e =>
                                (e.currentTarget.style.background =
                                    "rgba(255,255,255,0.03)")
                            }
                            onMouseLeave={e =>
                                (e.currentTarget.style.background =
                                    "transparent")
                            }
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
                                    {student.name}
                                </span>
                                {(student.reason || student.note) && (
                                    <span
                                        style={{
                                            fontSize: "0.7rem",
                                            color: "var(--text-muted)",
                                            marginTop: 2
                                        }}
                                    >
                                        {student.reason || student.note}
                                    </span>
                                )}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "var(--text-secondary)"
                                    }}
                                >
                                    {student.status || student.type}
                                </span>
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--text-muted)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {activeClass && filtered.length === 0 && (
                <p
                    style={{
                        color: "var(--text-muted)",
                        textAlign: "center",
                        padding: 20
                    }}
                >
                    No students in this class for {config.label.toLowerCase()}.
                </p>
            )}
        </div>
    );
}
