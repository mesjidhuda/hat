import { useNavigate } from "react-router-dom";
import {
    getTodayEthiopian,
    formatEthiopianDate
} from "../utils/ethiopianCalendar";

export default function HomePage() {
    const navigate = useNavigate();
    const todayEth = getTodayEthiopian();

    return (
        <div className="container">
            {/* Top Star Divider */}
            <div className="top-divider">
                <span className="line"></span>
                <svg viewBox="0 0 24 24" className="star-icon">
                    <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
                </svg>
                <span className="line"></span>
            </div>
<p className="footer-text">بسم الله الرحمن الرحيم</p>
            <h1 className="app-title">Huda Masjid</h1>
            <h3 className="app-subtitle">Halqa Manager</h3>
            <p className="app-desc">Islamic Studies Attendance Tracker</p>
            <p className="app-date">{formatEthiopianDate(todayEth)}</p>

            <div className="top-divider bottom-divider">
                <span className="line"></span>
                <svg viewBox="0 0 24 24" className="star-icon">
                    <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
                </svg>
                <span className="line"></span>
            </div>

            <div className="buttons-area">
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/teacher")}
                >
                    <span className="btn-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M4 6h16v12H4z" />
                            <path
                                d="M4 6h8v12H4z"
                                stroke="currentColor"
                                fill="none"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                    Teacher Portal
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/admin")}
                >
                    <span className="btn-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" />
                        </svg>
                    </span>
                    Admin Dashboard
                </button>
            </div>

   
        </div>
    );
}
