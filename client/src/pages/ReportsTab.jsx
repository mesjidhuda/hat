import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { toast } from "../components/Toast";
import {
    getTodayEthiopian,
    formatEthiopianDate,
    gregorianToEthiopian,
    ethiopianToGregorian,
    MONTHS_AMHARIC
} from "../utils/ethiopianCalendar";

// Helper: convert Ethiopian date to Gregorian ISO string (YYYY-MM-DD)
const toGregorianISO = ethDate => {
    const greg = ethiopianToGregorian(ethDate.year, ethDate.month, ethDate.day);
    return greg.toISOString().split("T")[0];
};

export default function ReportsTab() {
    const [view, setView] = useState("daily");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Daily state
    const [dailyGregDate, setDailyGregDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    // Weekly state
    const [weeklyStartGreg, setWeeklyStartGreg] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - d.getDay());
        return d.toISOString().split("T")[0];
    });
    const [weeklyEndGreg, setWeeklyEndGreg] = useState(() => {
        const start = new Date();
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return end.toISOString().split("T")[0];
    });

    // Monthly state
    const todayEth = getTodayEthiopian();
    const [monthlyYear, setMonthlyYear] = useState(todayEth.year);
    const [monthlyMonth, setMonthlyMonth] = useState(todayEth.month);

    // Fetch helpers
    const fetchDaily = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(
                `/reports/daily?date=${dailyGregDate}`
            );
            setReportData({ type: "daily", ...data });
        } catch (err) {
            setError("Could not load daily report");
        } finally {
            setLoading(false);
        }
    }, [dailyGregDate]);

    const fetchWeekly = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(
                `/reports/weekly?start=${weeklyStartGreg}&end=${weeklyEndGreg}`
            );
            setReportData({ type: "weekly", ...data });
        } catch (err) {
            setError("Could not load weekly report");
        } finally {
            setLoading(false);
        }
    }, [weeklyStartGreg, weeklyEndGreg]);

    const fetchMonthly = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(
                `/reports/monthly?ethiopianYear=${monthlyYear}&ethiopianMonth=${monthlyMonth}`
            );
            setReportData({ type: "monthly", ...data });
        } catch (err) {
            setError("Could not load monthly report");
        } finally {
            setLoading(false);
        }
    }, [monthlyYear, monthlyMonth]);

    useEffect(() => {
        if (view === "daily") fetchDaily();
        else if (view === "weekly") fetchWeekly();
        else if (view === "monthly") fetchMonthly();
    }, [view, fetchDaily, fetchWeekly, fetchMonthly]);

    // Date navigation
    const navigateDaily = direction => {
        const d = new Date(dailyGregDate);
        d.setDate(d.getDate() + direction);
        setDailyGregDate(d.toISOString().split("T")[0]);
    };

    const navigateWeekly = direction => {
        const start = new Date(weeklyStartGreg);
        start.setDate(start.getDate() + 7 * direction);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        setWeeklyStartGreg(start.toISOString().split("T")[0]);
        setWeeklyEndGreg(end.toISOString().split("T")[0]);
    };

    const navigateMonthly = direction => {
        let newMonth = monthlyMonth + direction;
        let newYear = monthlyYear;
        if (newMonth < 1) {
            newMonth = 13;
            newYear -= 1;
        } else if (newMonth > 13) {
            newMonth = 1;
            newYear += 1;
        }
        setMonthlyMonth(newMonth);
        setMonthlyYear(newYear);
    };

    // Copy absence list
    const copyAbsenceList = () => {
        if (
            !reportData ||
            reportData.type !== "weekly" ||
            !reportData.absentStudents?.length
        ) {
            toast.error("No absence data to copy");
            return;
        }
        const list = reportData.absentStudents
            .map(s => `${s.studentName} - ${s.parentPhone || "No phone"}`)
            .join("\n");
        navigator.clipboard.writeText(list).then(() => {
            toast.success("Absence list copied to clipboard");
        });
    };

    // ===== FIXED: Ethiopian date labels =====
    const dailyEth = gregorianToEthiopian(new Date(dailyGregDate));
    const dailyEthLabel = `${dailyEth.monthName || MONTHS_AMHARIC[dailyEth.month - 1]} ${dailyEth.day}, ${dailyEth.year}`;

    const weeklyStartEth = gregorianToEthiopian(new Date(weeklyStartGreg));
    const weeklyEndEth = gregorianToEthiopian(new Date(weeklyEndGreg));
    const weeklyEthLabel = `${weeklyStartEth.monthName || MONTHS_AMHARIC[weeklyStartEth.month - 1]} ${weeklyStartEth.day} – ${weeklyEndEth.monthName || MONTHS_AMHARIC[weeklyEndEth.month - 1]} ${weeklyEndEth.day}, ${weeklyEndEth.year}`;

    const monthlyEthLabel = `${MONTHS_AMHARIC[monthlyMonth - 1]} ${monthlyYear}`;

    return (
        <div>
            {/* Title */}
            <div
                style={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "var(--text-primary)",
                    marginBottom: 15
                }}
            >
                Reports
            </div>

            {/* 3-Toggle Pill */}
            <div
                style={{
                    background: "var(--glass)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 16,
                    padding: 4,
                    display: "flex",
                    width: "100%",
                    marginBottom: 15
                }}
            >
                {["daily", "weekly", "monthly"].map(v => (
                    <button
                        key={v}
                        onClick={() => setView(v)}
                        style={{
                            flex: 1,
                            background:
                                view === v ? "var(--accent)" : "transparent",
                            color:
                                view === v ? "#000" : "var(--text-secondary)",
                            border: "none",
                            borderRadius: 12,
                            padding: "8px 0",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            transition: "0.2s"
                        }}
                    >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                ))}
            </div>

            {/* Date Navigator */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    gap: 20,
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    marginBottom: 15
                }}
            >
                <svg
                    onClick={() => {
                        if (view === "daily") navigateDaily(-1);
                        else if (view === "weekly") navigateWeekly(-1);
                        else navigateMonthly(-1);
                    }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ cursor: "pointer" }}
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--text-primary)"
                    }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2"
                    >
                        <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span style={{ fontWeight: 600 }}>
                        {view === "daily"
                            ? dailyEthLabel
                            : view === "weekly"
                              ? weeklyEthLabel
                              : monthlyEthLabel}
                    </span>
                </div>
                <svg
                    onClick={() => {
                        if (view === "daily") navigateDaily(1);
                        else if (view === "weekly") navigateWeekly(1);
                        else navigateMonthly(1);
                    }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ cursor: "pointer" }}
                >
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </div>

            {/* Copy Absence List (weekly only) */}
            {view === "weekly" && reportData && (
                <div
                    onClick={copyAbsenceList}
                    style={{
                        border: "1px solid var(--accent)",
                        borderRadius: 12,
                        padding: 12,
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 15,
                        cursor: "pointer"
                    }}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2"
                    >
                        <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                        />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span
                        style={{
                            color: "var(--text-primary)",
                            fontWeight: 600,
                            fontSize: "0.9rem"
                        }}
                    >
                        Copy Absence List (for WhatsApp/SMS)
                    </span>
                </div>
            )}

            {/* Loading / Error */}
            {loading && (
                <p
                    style={{
                        textAlign: "center",
                        color: "var(--text-secondary)",
                        padding: 20
                    }}
                >
                    Loading…
                </p>
            )}
            {error && (
                <p
                    style={{
                        textAlign: "center",
                        color: "#f44336",
                        padding: 20
                    }}
                >
                    {error}
                </p>
            )}

            {/* Report Content */}
            {reportData && !loading && !error && (
                <>
                    {/* Overall Rate (weekly & monthly) */}
                    {view !== "daily" && (
                        <div
                            style={{
                                background: "var(--glass)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: 20,
                                padding: 20,
                                width: "100%",
                                marginBottom: 20
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: 500,
                                    color: "var(--text-secondary)",
                                    fontSize: "0.9rem",
                                    marginBottom: 8
                                }}
                            >
                                {view === "weekly"
                                    ? "Weekly Attendance Rate"
                                    : "Overall Attendance"}
                            </div>
                            <div
                                style={{
                                    height: 5,
                                    width: "100%",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: 10,
                                    position: "relative",
                                    marginBottom: 12
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${
                                            view === "weekly"
                                                ? reportData.overallRate || 0
                                                : reportData.overallCurrentRate ||
                                                  0
                                        }%`,
                                        background: "var(--accent)",
                                        borderRadius: 10
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    color: "var(--text-secondary)",
                                    fontSize: "0.9rem"
                                }}
                            >
                                {view === "weekly"
                                    ? `${reportData.overallRate || 0}% overall attendance`
                                    : `${reportData.overallCurrentRate || 0}% (prev. month: ${reportData.overallPrevRate || 0}%)`}
                            </div>
                        </div>
                    )}

                    {/* By Class List */}
                    <div
                        style={{
                            fontWeight: 600,
                            fontSize: "1.1rem",
                            marginBottom: 10
                        }}
                    >
                        By Class
                    </div>

                    {/* Daily report */}
                    {view === "daily" &&
                        reportData.classes?.map(cls => (
                            <div
                                key={cls.className}
                                style={{
                                    background: "var(--glass)",
                                    border: "1px solid var(--glass-border)",
                                    borderRadius: 16,
                                    padding: 16,
                                    width: "100%",
                                    marginBottom: 10
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
                                        {cls.className}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "0.8rem",
                                            color: "var(--text-secondary)",
                                            marginTop: 4
                                        }}
                                    >
                                        Present: {cls.present} | Late:{" "}
                                        {cls.late} | Absent: {cls.absent} |
                                        Excused: {cls.excused}
                                    </span>
                                    {cls.students?.length > 0 && (
                                        <ul
                                            style={{
                                                marginTop: 8,
                                                paddingLeft: 16,
                                                fontSize: "0.8rem",
                                                color: "var(--text-muted)"
                                            }}
                                        >
                                            {cls.students.map((s, i) => (
                                                <li key={i}>
                                                    {s.studentName}: {s.status}{" "}
                                                    {s.note && `(${s.note})`}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {(!cls.students ||
                                        cls.students.length === 0) && (
                                        <span
                                            style={{
                                                fontSize: "0.8rem",
                                                color: "var(--text-secondary)",
                                                marginTop: 4
                                            }}
                                        >
                                            No records for this day.
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                    {/* Weekly report */}
                    {view === "weekly" &&
                        reportData.perClassRate?.map(cls => (
                            <div
                                key={cls.className}
                                style={{
                                    background: "var(--glass)",
                                    border: "1px solid var(--glass-border)",
                                    borderRadius: 16,
                                    padding: 16,
                                    width: "100%",
                                    marginBottom: 10
                                }}
                            >
                                <div
                                    style={{
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
                                            {cls.className}
                                        </span>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 12,
                                                marginTop: 4,
                                                fontSize: "0.8rem"
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "#4caf50",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 4
                                                }}
                                            >
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                >
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                {cls.present || 0} attended
                                            </span>
                                            <span
                                                style={{
                                                    color: "#f44336",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 4
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
                                                    <line
                                                        x1="18"
                                                        y1="6"
                                                        x2="6"
                                                        y2="18"
                                                    />
                                                    <line
                                                        x1="6"
                                                        y1="6"
                                                        x2="18"
                                                        y2="18"
                                                    />
                                                </svg>
                                                {cls.absent || 0} absent
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        style={{
                                            color: "var(--text-secondary)",
                                            fontWeight: 500
                                        }}
                                    >
                                        {cls.attendanceRate || 0}%
                                    </span>
                                </div>
                            </div>
                        ))}

                    {/* Monthly report */}
                    {view === "monthly" &&
                        reportData.perClassRate?.map(cls => (
                            <div
                                key={cls.className}
                                style={{
                                    background: "var(--glass)",
                                    border: "1px solid var(--glass-border)",
                                    borderRadius: 16,
                                    padding: 16,
                                    width: "100%",
                                    marginBottom: 10
                                }}
                            >
                                <div
                                    style={{
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
                                            {cls.className}
                                        </span>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 12,
                                                marginTop: 4,
                                                fontSize: "0.8rem"
                                            }}
                                        >
                                            <span style={{ color: "#4caf50" }}>
                                                {cls.present || 0} attended
                                            </span>
                                            <span style={{ color: "#f44336" }}>
                                                {cls.absent || 0} absent
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        style={{
                                            color: "var(--text-secondary)",
                                            fontWeight: 500
                                        }}
                                    >
                                        {cls.attendanceRate || 0}%
                                    </span>
                                </div>
                            </div>
                        ))}

                    {/* Ranked Absences (monthly) */}
                    {view === "monthly" &&
                        reportData.rankedAbsences?.length > 0 && (
                            <div style={{ marginTop: 20 }}>
                                <div
                                    style={{
                                        fontWeight: 600,
                                        fontSize: "1.1rem",
                                        marginBottom: 10
                                    }}
                                >
                                    Most Absences
                                </div>
                                <ol
                                    style={{
                                        paddingLeft: 20,
                                        color: "var(--text-secondary)",
                                        fontSize: "0.9rem"
                                    }}
                                >
                                    {reportData.rankedAbsences
                                        .slice(0, 10)
                                        .map((s, i) => (
                                            <li
                                                key={i}
                                                style={{ marginBottom: 4 }}
                                            >
                                                <span
                                                    style={{
                                                        fontFamily:
                                                            "Cairo, sans-serif",
                                                        fontWeight: 600,
                                                        color: "var(--text-primary)"
                                                    }}
                                                >
                                                    {s.name}
                                                </span>{" "}
                                                ({s.class}) – {s.absent}{" "}
                                                absences
                                            </li>
                                        ))}
                                </ol>
                            </div>
                        )}

                    {/* Empty states */}
                    {view === "daily" &&
                        (!reportData.classes ||
                            reportData.classes.length === 0) && (
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    textAlign: "center",
                                    padding: 20
                                }}
                            >
                                No records for this day.
                            </p>
                        )}
                    {view === "weekly" &&
                        (!reportData.perClassRate ||
                            reportData.perClassRate.length === 0) && (
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    textAlign: "center",
                                    padding: 20
                                }}
                            >
                                No data for this week.
                            </p>
                        )}
                    {view === "monthly" &&
                        (!reportData.perClassRate ||
                            reportData.perClassRate.length === 0) && (
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    textAlign: "center",
                                    padding: 20
                                }}
                            >
                                No data for this month.
                            </p>
                        )}
                </>
            )}
        </div>
    );
}
