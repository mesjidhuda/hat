import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import {
    gregorianToEthiopian,
    ethiopianToGregorian,
    formatEthiopianDate,
    getTodayEthiopian,
    MONTHS_AMHARIC
} from "../utils/ethiopianCalendar";

function toGregorianString(ethDate) {
    const greg = ethiopianToGregorian(ethDate.year, ethDate.month, ethDate.day);
    return greg.toISOString().split("T")[0];
}

export default function AdminReports() {
    const [subTab, setSubTab] = useState("daily");
    // Daily
    const [dailyDate, setDailyDate] = useState("");
    const [dailyData, setDailyData] = useState(null);
    // Weekly
    const [weekStart, setWeekStart] = useState("");
    const [weekEnd, setWeekEnd] = useState("");
    const [weeklyData, setWeeklyData] = useState(null);
    // Monthly
    const [selectedYear, setSelectedYear] = useState(2018);
    const [selectedMonth, setSelectedMonth] = useState(1);
    const [monthlyData, setMonthlyData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchDaily = useCallback(async () => {
        if (!dailyDate) return;
        setLoading(true);
        setError("");
        try {
            const greg = toGregorianString(
                gregorianToEthiopian(new Date(dailyDate))
            ); // Convert from Gregorian picker value
            const { data } = await api.get(`/reports/daily?date=${dailyDate}`); // API expects Gregorian string
            setDailyData(data);
        } catch (err) {
            setError("Could not load daily report");
        } finally {
            setLoading(false);
        }
    }, [dailyDate]);

    const fetchWeekly = useCallback(async () => {
        if (!weekStart || !weekEnd) return;
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(
                `/reports/weekly?start=${weekStart}&end=${weekEnd}`
            );
            setWeeklyData(data);
        } catch (err) {
            setError("Could not load weekly report");
        } finally {
            setLoading(false);
        }
    }, [weekStart, weekEnd]);

    const fetchMonthly = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(
                `/reports/monthly?ethiopianYear=${selectedYear}&ethiopianMonth=${selectedMonth}`
            );
            setMonthlyData(data);
        } catch (err) {
            setError("Could not load monthly report");
        } finally {
            setLoading(false);
        }
    }, [selectedYear, selectedMonth]);

    // Copy absence list for weekly
    const copyAbsenceList = () => {
        if (!weeklyData) return;
        const text = weeklyData.absentStudents
            .map(s => `${s.studentName} - ${s.parentPhone}`)
            .join("\n");
        navigator.clipboard
            .writeText(text)
            .then(() => alert("Absence list copied to clipboard"));
    };

    return (
        <div className="reports">
            <h3>Reports</h3>
            <div className="sub-tabs">
                {["daily", "weekly", "monthly"].map(tab => (
                    <button
                        key={tab}
                        className={subTab === tab ? "active" : ""}
                        onClick={() => setSubTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {error && <p className="error">{error}</p>}

            {/* Daily */}
            {subTab === "daily" && (
                <div>
                    <label>Select Gregorian date:</label>
                    <input
                        type="date"
                        value={dailyDate}
                        onChange={e => setDailyDate(e.target.value)}
                    />
                    <button onClick={fetchDaily} className="btn-primary">
                        View Daily Report
                    </button>

                    {loading && <p>Loading...</p>}
                    {dailyData && (
                        <div>
                            {dailyData.classes.map(cls => (
                                <div
                                    key={cls.className}
                                    className="report-class"
                                >
                                    <h4>{cls.className}</h4>
                                    <p>
                                        Present: {cls.present} | Late:{" "}
                                        {cls.late} | Absent: {cls.absent} |
                                        Excused: {cls.excused} (Total:{" "}
                                        {cls.total})
                                    </p>
                                    <ul>
                                        {cls.students.map(s => (
                                            <li key={s.studentName}>
                                                {s.studentName}: {s.status}{" "}
                                                {s.note && `(${s.note})`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Weekly */}
            {subTab === "weekly" && (
                <div>
                    <label>Start (Gregorian):</label>
                    <input
                        type="date"
                        value={weekStart}
                        onChange={e => setWeekStart(e.target.value)}
                    />
                    <label>End (Gregorian):</label>
                    <input
                        type="date"
                        value={weekEnd}
                        onChange={e => setWeekEnd(e.target.value)}
                    />
                    <button onClick={fetchWeekly} className="btn-primary">
                        View Weekly Report
                    </button>
                    {loading && <p>Loading...</p>}
                    {weeklyData && (
                        <div>
                            <p>
                                Overall Attendance Rate:{" "}
                                {weeklyData.overallRate}%
                            </p>
                            <div className="report-class">
                                <h4>Per Class Rate</h4>
                                {weeklyData.perClassRate.map(cls => (
                                    <p key={cls.className}>
                                        {cls.className}: {cls.attendanceRate}%
                                    </p>
                                ))}
                            </div>
                            <div className="report-class">
                                <h4>Absent Students</h4>
                                <ul>
                                    {weeklyData.absentStudents.map((s, i) => (
                                        <li key={i}>
                                            {s.studentName} ({s.class}){" "}
                                            {s.parentPhone}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={copyAbsenceList}
                                    className="btn-secondary"
                                >
                                    Copy Absence List
                                </button>
                            </div>
                            <div className="report-class">
                                <h4>Session Submissions</h4>
                                {weeklyData.classSubmissionStatus.map(cls => (
                                    <p key={cls.className}>
                                        {cls.className}:{" "}
                                        {cls.submittedAllSessions
                                            ? "✔ All sessions"
                                            : "❌ Missing some"}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Monthly */}
            {subTab === "monthly" && (
                <div>
                    <label>Ethiopian Year:</label>
                    <input
                        type="number"
                        value={selectedYear}
                        onChange={e =>
                            setSelectedYear(parseInt(e.target.value))
                        }
                    />
                    <label>Month:</label>
                    <select
                        value={selectedMonth}
                        onChange={e =>
                            setSelectedMonth(parseInt(e.target.value))
                        }
                    >
                        {MONTHS_AMHARIC.map((name, idx) => (
                            <option key={idx} value={idx + 1}>
                                {name}
                            </option>
                        ))}
                    </select>
                    <button onClick={fetchMonthly} className="btn-primary">
                        View Monthly Report
                    </button>
                    {loading && <p>Loading...</p>}
                    {monthlyData && (
                        <div>
                            <p>
                                Current Month Attendance Rate:{" "}
                                {monthlyData.overallCurrentRate}%
                            </p>
                            <p>
                                Previous Month Rate:{" "}
                                {monthlyData.overallPrevRate}%
                            </p>
                            <div className="report-class">
                                <h4>Per Class Rate</h4>
                                {monthlyData.perClassRate.map(cls => (
                                    <p key={cls.className}>
                                        {cls.className}: {cls.attendanceRate}%
                                    </p>
                                ))}
                            </div>
                            <div className="report-class">
                                <h4>Most Absences</h4>
                                <ol>
                                    {monthlyData.rankedAbsences
                                        .slice(0, 10)
                                        .map(s => (
                                            <li key={s.name}>
                                                {s.name} ({s.class}) -{" "}
                                                {s.absent} absences
                                            </li>
                                        ))}
                                </ol>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
