import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import {
    formatEthiopianDate,
    gregorianToEthiopian
} from "../utils/ethiopianCalendar";

export default function LogsTab() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchLogs = useCallback(async () => {
        try {
            const { data } = await api.get("/teacher-log");
            setLogs(data);
            setLoading(false);
        } catch (err) {
            setError("Failed to load teacher logs");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Format time
    const formatTime = timestamp => {
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Format Ethiopian date from Gregorian
    const formatEthDate = dateStr => {
        if (!dateStr) return "";
        try {
            const eth = gregorianToEthiopian(new Date(dateStr));
            return formatEthiopianDate(eth);
        } catch {
            return dateStr;
        }
    };

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

    // Group logs by date
    const groupedLogs = {};
    logs.forEach(log => {
        const dateKey = log.sessionDate
            ? log.sessionDate.split("T")[0]
            : "unknown";
        if (!groupedLogs[dateKey]) {
            groupedLogs[dateKey] = [];
        }
        groupedLogs[dateKey].push(log);
    });

    const sortedDates = Object.keys(groupedLogs).sort((a, b) =>
        b.localeCompare(a)
    );

    if (logs.length === 0) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "100%",
                    gap: 20
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 8
                        }}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            <rect
                                x="8"
                                y="2"
                                width="8"
                                height="4"
                                rx="1"
                                ry="1"
                            />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                        <span
                            style={{
                                fontWeight: 700,
                                fontSize: "1.25rem",
                                color: "var(--text-primary)"
                            }}
                        >
                            Teacher Session Logs
                        </span>
                    </div>
                    <div
                        style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                            textAlign: "left",
                            lineHeight: 1.4
                        }}
                    >
                        Every time a teacher submits attendance, a log entry is
                        recorded here.
                    </div>
                </div>
                <p
                    style={{
                        color: "var(--text-muted)",
                        textAlign: "center",
                        width: "100%",
                        padding: "40px 0"
                    }}
                >
                    No logs yet.
                </p>
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "100%",
                gap: 20
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "100%"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8
                    }}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                        <path d="M9 12l2 2 4-4" />
                    </svg>
                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: "1.25rem",
                            color: "var(--text-primary)"
                        }}
                    >
                        Teacher Session Logs
                    </span>
                </div>
                <div
                    style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        textAlign: "left",
                        lineHeight: 1.4
                    }}
                >
                    Every time a teacher submits attendance, a log entry is
                    recorded here.
                </div>
            </div>

            {/* Logs by date */}
            {sortedDates.map(dateKey => (
                <div
                    key={dateKey}
                    style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10
                    }}
                >
                    {/* Date header */}
                    <div
                        style={{
                            color: "var(--accent)",
                            fontWeight: 600,
                            fontSize: "1rem",
                            marginTop: 5
                        }}
                    >
                        {formatEthDate(dateKey)}
                    </div>

                    {/* Log cards */}
                    {groupedLogs[dateKey].map(log => (
                        <div
                            key={log._id}
                            style={{
                                background: "var(--glass)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: 16,
                                padding: "16px 20px",
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                gap: 10
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start"
                                }}
                            >
                                {/* Left Info */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        textAlign: "left",
                                        gap: 2,
                                        maxWidth: "70%"
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
                                        {log.class?.name || "Unknown class"}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "Cairo, sans-serif",
                                            fontSize: "0.75rem",
                                            color: "var(--text-secondary)"
                                        }}
                                    >
                                        {log.class?.teacherName ||
                                            log.class?.name ||
                                            "Unknown teacher"}
                                    </span>
                                </div>

                                {/* Right Meta */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                        gap: 4
                                    }}
                                >
                                    {/* Submit Time */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4,
                                            color: "var(--text-secondary)",
                                            fontSize: "0.8rem"
                                        }}
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        {formatTime(log.submitTimestamp)}
                                    </div>

                                    {/* Edited Badge */}
                                    {log.editTimestamp && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                                border: "1px solid var(--accent)",
                                                borderRadius: 12,
                                                padding: "2px 10px",
                                                color: "var(--accent)",
                                                fontSize: "0.7rem"
                                            }}
                                        >
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M12 20h9" />
                                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                            </svg>
                                            Edited{" "}
                                            {formatTime(log.editTimestamp)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    fontSize: "0.8rem",
                                    flexWrap: "wrap",
                                    paddingTop: 2
                                }}
                            >
                                <span
                                    style={{
                                        color: "var(--text-secondary)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5
                                    }}
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Session submitted
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
