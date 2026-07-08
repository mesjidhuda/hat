import {
    getTodayEthiopian,
    formatEthiopianDate
} from "../utils/ethiopianCalendar";

export default function AdminHeader() {
    const todayEth = getTodayEthiopian();

    return (
        <header className="header-section">
            <div className="divider-container">
                <span className="line"></span>
                <svg viewBox="0 0 24 24" className="star-icon">
                    <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
                </svg>
                <span className="line"></span>
            </div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Huda Masjid Halqa Manager</p>
            <p className="page-date">{formatEthiopianDate(todayEth)}</p>
            <div className="divider-container bottom-divider">
                <span className="line"></span>
                <svg viewBox="0 0 24 24" className="star-icon">
                    <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
                </svg>
                <span className="line"></span>
            </div>
        </header>
    );
}
