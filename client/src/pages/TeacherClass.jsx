import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import {
    getTodayEthiopian,
    formatEthiopianDate,
    ethiopianToGregorian
} from "../utils/ethiopianCalendar";
import { toast } from "../components/Toast";

function toGregorianDateString(ethDate) {
    const greg = ethiopianToGregorian(ethDate.year, ethDate.month, ethDate.day);
    return greg.toISOString().split("T")[0];
}

export default function TeacherClass() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Always read token and classData fresh
    const getToken = () => sessionStorage.getItem("teacherToken");
    const getClassData = () => {
        try {
            return JSON.parse(sessionStorage.getItem("teacherClass") || "{}");
        } catch {
            return {};
        }
    };

    const [students, setStudents] = useState([]);
    const [attendanceState, setAttendanceState] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // UI control states
    const [hasExistingAttendance, setHasExistingAttendance] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showNoteMap, setShowNoteMap] = useState({}); // track visible notes

    // Flag modal state
    const [flagModalOpen, setFlagModalOpen] = useState(false);
    const [flagStudentId, setFlagStudentId] = useState(null);
    const [flagReasonInput, setFlagReasonInput] = useState("");

    const todayEth = getTodayEthiopian();
    const gregorianDate = useMemo(
        () => toGregorianDateString(todayEth),
        [todayEth]
    );

    const fetchAttendance = useCallback(async () => {
        const token = getToken();
        const classData = getClassData();
        if (!token || classData.id !== id) {
            navigate("/teacher");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(
                `/attendance/${id}?date=${gregorianDate}`
            );
            const studentList = data?.students || [];
            setStudents(studentList);

            const state = {};
            let existingFound = false;
            studentList.forEach(s => {
                const hasAtt = !!s.attendance?.status;
                if (hasAtt) existingFound = true;
                state[s._id] = {
                    status: s.attendance?.status || "",
                    note: s.attendance?.note || "",
                    flagReason: "",
                    existingFlags: s.flags || []
                };
            });
            setAttendanceState(state);
            setHasExistingAttendance(existingFound);
            // If existing attendance, start in locked mode; otherwise editable
            setEditMode(false);
        } catch (err) {
            console.error("Attendance fetch error:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                toast.error("Session expired. Please re‑enter your class PIN.");
                sessionStorage.removeItem("teacherToken");
                sessionStorage.removeItem("teacherClass");
                navigate("/teacher");
                return;
            }
            setError("Could not load attendance data.");
        } finally {
            setLoading(false);
        }
    }, [id, gregorianDate, navigate]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    // Determine if controls should be editable
    const canEdit = !hasExistingAttendance || editMode;

    const toggleStatus = (studentId, newStatus) => {
        if (!canEdit) return;
        setAttendanceState(prev => {
            const current = prev[studentId] || {};
            const nextStatus = current.status === newStatus ? "" : newStatus;
            return { ...prev, [studentId]: { ...current, status: nextStatus } };
        });
    };

    const updateNote = (studentId, value) => {
        if (!canEdit) return;
        setAttendanceState(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], note: value }
        }));
    };

    // Double‑click toggles note visibility
    const toggleNoteVisibility = studentId => {
        setShowNoteMap(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    };

    const openFlagModal = studentId => {
        if (!canEdit) return;
        setFlagStudentId(studentId);
        setFlagReasonInput("");
        setFlagModalOpen(true);
    };

    const confirmFlag = () => {
        if (!flagStudentId) return;
        setAttendanceState(prev => ({
            ...prev,
            [flagStudentId]: {
                ...prev[flagStudentId],
                flagReason: flagReasonInput.trim()
            }
        }));
        setFlagModalOpen(false);
        setFlagStudentId(null);
    };

    const handleSubmit = async () => {
        const unmarked = students.find(s => {
            const st = attendanceState[s._id];
            return !st || !st.status;
        });
        if (unmarked) {
            toast.error(`Please select a status for ${unmarked.name}`);
            return;
        }
        setSaving(true);
        setError("");
        const records = students.map(s => ({
            studentId: s._id,
            status: attendanceState[s._id].status,
            note: attendanceState[s._id].note || "",
            flagReason: attendanceState[s._id].flagReason || undefined
        }));
        try {
            await api.post(`/attendance/${id}`, {
                date: gregorianDate,
                records
            });
            toast.success(
                editMode ? "Attendance updated!" : "Attendance saved!"
            );
            // Re‑fetch to get updated state (flags, edit timestamps)
            await fetchAttendance();
        } catch (err) {
            toast.error(err.response?.data?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        sessionStorage.removeItem("teacherToken");
        sessionStorage.removeItem("teacherClass");
        navigate("/teacher");
    };

    // Stats counts
    let countP = 0,
        countL = 0,
        countA = 0,
        countE = 0;
    students.forEach(s => {
        const st = attendanceState[s._id];
        if (!st || !st.status) return;
        switch (st.status) {
            case "Present":
                countP++;
                break;
            case "Late":
                countL++;
                break;
            case "Absent":
                countA++;
                break;
            case "Excused":
                countE++;
                break;
        }
    });
    const markedCount = countP + countL + countA + countE;
    const totalStudents = students.length;

    if (loading) {
        return (
            <div
                className="attendance-container"
                style={{ justifyContent: "center", alignItems: "center" }}
            >
                <p style={{ color: "var(--text-secondary)" }}>
                    Loading students…
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="attendance-container">
                {/* Navigation */}
                <nav className="dash-nav">
                    <div className="nav-left">
                        <button className="back-btn" onClick={handleBack}>
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    </div>
                    <div className="nav-center">
                        <span className="nav-title">{getClassData().name}</span>
                        <span className="nav-date">
                            {formatEthiopianDate(todayEth)}
                        </span>
                    </div>
                    <div className="nav-right">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>{totalStudents}</span>
                    </div>
                </nav>

                {/* Stats Row */}
                <div className="stats-row">
                    <div className="stat-item">
                        <div className="stat-circle green"></div>
                        <div className="stat-count">{countP}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-circle orange"></div>
                        <div className="stat-count">{countL}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-circle red"></div>
                        <div className="stat-count">{countA}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-circle blue"></div>
                        <div className="stat-count">{countE}</div>
                    </div>
                </div>

                {/* Error with Retry */}
                {error && (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <p className="error-msg">{error}</p>
                        <button
                            onClick={fetchAttendance}
                            className="add-btn"
                            style={{ marginTop: 10 }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Student list or empty state */}
                {!error && students.length === 0 && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "40px 20px",
                            color: "var(--text-muted)"
                        }}
                    >
                        <p style={{ fontSize: "1.1rem", marginBottom: 8 }}>
                            No students in this class
                        </p>
                        <p style={{ fontSize: "0.85rem" }}>
                            Please add students via the Admin Dashboard first.
                        </p>
                    </div>
                )}

                {!error && students.length > 0 && (
                    <div className="student-list">
                        {students.map(student => {
                            const state = attendanceState[student._id] || {};
                            const hasFlag =
                                state.flagReason ||
                                state.existingFlags.length > 0;
                            const showNote = showNoteMap[student._id] || false;

                            return (
                                <div
                                    key={student._id}
                                    className="student-card"
                                    onDoubleClick={() =>
                                        toggleNoteVisibility(student._id)
                                    }
                                >
                                    <div className="student-top-row">
                                        <div className="student-left">
                                            <div
                                                className="flag-icon-wrapper"
                                                onClick={() =>
                                                    openFlagModal(student._id)
                                                }
                                                style={{
                                                    cursor: canEdit
                                                        ? "pointer"
                                                        : "default"
                                                }}
                                            >
                                                <svg
                                                    className={`flag-icon-svg ${hasFlag ? "filled" : "outline"}`}
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                                    <line
                                                        x1="4"
                                                        y1="22"
                                                        x2="4"
                                                        y2="15"
                                                    />
                                                </svg>
                                            </div>
                                            <span className="student-name">
                                                {student.name}
                                            </span>
                                        </div>
                                        <div className="status-pills">
                                            {[
                                                {
                                                    code: "P",
                                                    status: "Present",
                                                    activeClass: "active-p"
                                                },
                                                {
                                                    code: "L",
                                                    status: "Late",
                                                    activeClass: "active-l"
                                                },
                                                {
                                                    code: "A",
                                                    status: "Absent",
                                                    activeClass: "active-a"
                                                },
                                                {
                                                    code: "E",
                                                    status: "Excused",
                                                    activeClass: "active-e"
                                                }
                                            ].map(pill => (
                                                <button
                                                    key={pill.code}
                                                    className={`status-pill ${state.status === pill.status ? pill.activeClass : ""}`}
                                                    onClick={() =>
                                                        toggleStatus(
                                                            student._id,
                                                            pill.status
                                                        )
                                                    }
                                                    disabled={!canEdit}
                                                    style={{
                                                        opacity: canEdit
                                                            ? 1
                                                            : 0.7,
                                                        pointerEvents: canEdit
                                                            ? "auto"
                                                            : "none"
                                                    }}
                                                >
                                                    {pill.code}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Note area – visible only after double‑click */}
                                    {showNote && (
                                        <div className="note-area show">
                                            <input
                                                type="text"
                                                className="note-input"
                                                placeholder="Add a note (optional)..."
                                                value={state.note}
                                                onChange={e =>
                                                    updateNote(
                                                        student._id,
                                                        e.target.value
                                                    )
                                                }
                                                disabled={!canEdit}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Fixed Submit / Edit Bar */}
            {!error && students.length > 0 && (
                <div className="submit-bar">
                    {hasExistingAttendance && !editMode ? (
                        <button
                            className="submit-btn"
                            onClick={() => setEditMode(true)}
                        >
                            Edit Attendance
                        </button>
                    ) : (
                        <button
                            className="submit-btn"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#000"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                            {saving
                                ? "Saving…"
                                : editMode
                                  ? `Save Changes (${markedCount}/${totalStudents})`
                                  : `Submit Attendance (${markedCount}/${totalStudents})`}
                        </button>
                    )}
                </div>
            )}

            {/* Flag Modal */}
            <div
                className={`flag-modal-overlay ${flagModalOpen ? "show" : ""}`}
                onClick={e =>
                    e.target === e.currentTarget && setFlagModalOpen(false)
                }
            >
                <div className="flag-modal">
                    <div className="modal-header">
                        <div className="modal-title">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                <line x1="4" y1="22" x2="4" y2="15" />
                            </svg>
                            Flag{" "}
                            {students.find(s => s._id === flagStudentId)
                                ?.name || "Student"}
                        </div>
                        <button
                            className="modal-close"
                            onClick={() => setFlagModalOpen(false)}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                    <p className="modal-desc">
                        Write a short reason for flagging this student's
                        behavior. Only an admin can remove the flag once set.
                    </p>
                    <textarea
                        className="modal-textarea"
                        placeholder="e.g., disruptive in class, not following instructions..."
                        value={flagReasonInput}
                        onChange={e => setFlagReasonInput(e.target.value)}
                        disabled={!canEdit}
                    />
                    <div className="modal-btn-group">
                        <button
                            className="modal-btn modal-btn-cancel"
                            onClick={() => setFlagModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="modal-btn modal-btn-flag"
                            onClick={confirmFlag}
                            disabled={!canEdit}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                <line x1="4" y1="22" x2="4" y2="15" />
                            </svg>
                            Flag
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
