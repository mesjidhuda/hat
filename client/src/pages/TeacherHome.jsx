import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
    getTodayEthiopian,
    formatEthiopianDate
} from "../utils/ethiopianCalendar";
import PinEntry from "../components/PinEntry";
import { toast } from "../components/Toast";

// Avatar SVG icon
const AvatarIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 13C13.933 13 15.5 11.433 15.5 9.5C15.5 7.567 13.933 6 12 6C10.067 6 8.5 7.567 8.5 9.5C8.5 11.433 10.067 13 12 13Z" />
        <path d="M5.5 19V19C5.5 17.067 7.067 15.5 9 15.5H15C16.933 15.5 18.5 17.067 18.5 19V19" />
    </svg>
);

// Arrow icon
const ArrowIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
    >
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

export default function TeacherHome() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedClass, setSelectedClass] = useState(null);
    const [genderTab, setGenderTab] = useState("All"); // 'All', 'Male', 'Female'

    const todayEth = getTodayEthiopian();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const { data } = await api.get("/classes");
                setClasses(data);
            } catch (err) {
                setError("Could not load classes");
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const handleClassClick = cls => {
        setSelectedClass(cls);
    };

    const handleBack = () => {
        if (selectedClass) {
            setSelectedClass(null);
        } else {
            navigate("/");
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("teacherToken");
        sessionStorage.removeItem("teacherClass");
        sessionStorage.removeItem("appUnlocked");
        navigate("/lock");
    };

    if (loading) {
        return (
            <div
                className="portal-container"
                style={{ justifyContent: "center", alignItems: "center" }}
            >
                <p style={{ color: "var(--text-secondary)" }}>
                    Loading classes…
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="portal-container"
                style={{ justifyContent: "center", alignItems: "center" }}
            >
                <p style={{ color: "#f44336" }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="add-btn"
                    style={{ marginTop: 10 }}
                >
                    Retry
                </button>
            </div>
        );
    }

    // Filter classes based on selected tab
    const filteredClasses = classes.filter(cls => {
        if (genderTab === "Male") return cls.gender === "Male";
        if (genderTab === "Female") return cls.gender === "Female";
        return true; // "All"
    });

    return (
        <div className="portal-container">
            {/* Full‑page PIN entry */}
            {selectedClass && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1000,
                        backgroundColor: "var(--bg-dark)",
                        backgroundImage:
                            "radial-gradient(circle at top right, #2c5f2d 0%, transparent 40%)",
                        backgroundAttachment: "fixed",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "var(--space-xl)"
                    }}
                >
                    <PinEntry
                        title={selectedClass.name}
                        subtitle={`Teacher: ${selectedClass.teacherName}`}
                        showBack={false}
                        onCancel={() => {}}
                        onVerify={async pin => {
                            try {
                                const { data } = await api.post(
                                    "/teacher/verify",
                                    {
                                        classId: selectedClass._id,
                                        pin
                                    }
                                );
                                localStorage.removeItem("adminToken");
                                sessionStorage.setItem(
                                    "teacherToken",
                                    data.token
                                );
                                sessionStorage.setItem(
                                    "teacherClass",
                                    JSON.stringify(data.class)
                                );
                                toast.success(`Welcome to ${data.class.name}`);
                                navigate(`/teacher/class/${data.class.id}`);
                                return { success: true };
                            } catch (err) {
                                return {
                                    success: false,
                                    message: "Invalid PIN"
                                };
                            }
                        }}
                    />
                    <button
                        onClick={() => setSelectedClass(null)}
                        style={{
                            marginTop: "var(--space-2xl)",
                            color: "var(--text-secondary)",
                            fontSize: "var(--fs-base)",
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                            fontFamily: "inherit",
                            textDecoration: "none",
                            opacity: 0.7
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="portal-nav">
                <div className="portal-back-btn" onClick={handleBack}>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        marginLeft: "auto",
                        background: "transparent",
                        border: "1px solid var(--glass-border)",
                        color: "var(--text-secondary)",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "var(--font-family)"
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background =
                            "rgba(255,255,255,0.08)";
                        e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                >
                    Logout
                </button>
            </nav>

            {/* Header */}
            <header className="header-section">
                <div className="divider-container">
                    <span className="line"></span>
                    <svg viewBox="0 0 24 24" className="star-icon">
                        <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
                    </svg>
                    <span className="line"></span>
                </div>
                <h1 className="page-title">Teacher Portal</h1>
                <p className="page-subtitle">Select your class</p>
                <p className="page-date">{formatEthiopianDate(todayEth)}</p>
                <div className="divider-container bottom-divider">
                    <span className="line"></span>
                    <svg viewBox="0 0 24 24" className="star-icon">
                        <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
                    </svg>
                    <span className="line"></span>
                </div>
            </header>

            {/* Gender Carousel Tabs */}
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    overflowX: "auto",
                    paddingBottom: 10
                }}
            >
                {["All", "Male", "Female"].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setGenderTab(tab)}
                        style={{
                            background:
                                genderTab === tab
                                    ? "var(--accent)"
                                    : "var(--glass)",
                            color:
                                genderTab === tab
                                    ? "#000"
                                    : "var(--text-secondary)",
                            border: "1px solid var(--glass-border)",
                            borderRadius: 20,
                            padding: "8px 16px",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            boxShadow:
                                genderTab === tab
                                    ? "0 4px 12px rgba(212,175,55,0.3)"
                                    : "none"
                        }}
                    >
                        {tab === "Male"
                            ? "Male"
                            : tab === "Female"
                              ? "Female"
                              : "All"}
                    </button>
                ))}
            </div>

            {/* Class List */}
            <div className="class-list">
                {filteredClasses.length === 0 ? (
                    <p
                        style={{
                            color: "var(--text-muted)",
                            textAlign: "center",
                            padding: "20px 0"
                        }}
                    >
                        No {genderTab !== "All" ? genderTab.toLowerCase() : ""}{" "}
                        teachers available.
                    </p>
                ) : (
                    filteredClasses.map(cls => (
                        <div
                            key={cls._id}
                            className="class-card"
                            onClick={() => handleClassClick(cls)}
                        >
                            <div className="card-left">
                                <div className="card-icon-box">
                                    <AvatarIcon />
                                </div>
                                <div className="card-info">
                                    <span className="card-title">
                                        {cls.name}
                                    </span>
                                    <span className="card-subtitle">
                                        {cls.teacherName}
                                    </span>
                                    {cls.gender && (
                                        <span
                                            style={{
                                                fontSize: "0.7rem",
                                                color: "var(--text-muted)",
                                                marginTop: 2
                                            }}
                                        >
                                            {cls.gender}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="card-arrow">
                                <ArrowIcon />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
