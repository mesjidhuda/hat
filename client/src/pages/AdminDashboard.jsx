import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminTabBar from "../components/AdminTabBar";
import DashboardTab from "./DashboardTab";
import ClassesTab from "./ClassesTab";
import StudentsTab from "./StudentsTab";
import ReportsTab from "./ReportsTab";
import LogsTab from "./LogsTab";
import ExportTab from "./ExportTab";
import SearchTab from "./SearchTab";
import SettingsTab from "./SettingsTab";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);

    // Read the saved tab from sessionStorage (for navigation from Settings)
    useEffect(() => {
        const savedTab = sessionStorage.getItem("adminActiveTab");
        if (savedTab) {
            setActiveTab(parseInt(savedTab));
            sessionStorage.removeItem("adminActiveTab");
        }
    }, []);

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin");
        }
    }, [navigate]);

    const handleHome = () => {
        navigate("/");
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        sessionStorage.removeItem("appUnlocked");
        navigate("/lock");
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <DashboardTab />;
            case 1:
                return <ClassesTab />;
            case 2:
                return <StudentsTab />;
            case 3:
                return <ReportsTab />;
            case 4:
                return <LogsTab />;
            case 5:
                return <ExportTab />;
            case 6:
                return <SearchTab />;
            case 7:
                return <SettingsTab />;
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-container">
            {/* Navigation */}
            <nav className="dash-nav">
                <button className="back-btn" onClick={handleHome}>
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
                <span
                    className="nav-title"
                    onClick={handleHome}
                    style={{ cursor: "pointer" }}
                ></span>
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
            <AdminHeader />

            {/* Tab Bar */}
            <AdminTabBar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <div className="content-area">{renderTabContent()}</div>
        </div>
    );
}
