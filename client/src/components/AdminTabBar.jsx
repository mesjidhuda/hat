// Inline SVG icons for each tab (matching the design)
const tabIcons = [
    {
        name: "grid",
        svg: (
            <path d="M4 4h4v4H4V4zM10 4h4v4h-4V4zM16 4h4v4h-4V4zM4 10h4v4H4v-4zM10 10h4v4h-4v-4zM16 10h4v4h-4v-4zM4 16h4v4H4v-4zM10 16h4v4h-4v-4zM16 16h4v4h-4v-4z" />
        )
    },
    {
        name: "bookOpen",
        svg: (
            <>
                <path d="M4 4h16v16H4z" />
                <path d="M4 4h8v16H4z" />
            </>
        )
    },
    {
        name: "users",
        svg: (
            <>
                <circle cx="8" cy="8" r="3" />
                <path d="M2 18v-2a6 6 0 0 1 12 0v2" />
                <circle cx="16" cy="10" r="2" />
                <path d="M12 18v-2a4 4 0 0 1 8 0v2" />
            </>
        )
    },
    {
        name: "chart",
        svg: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    },
    {
        name: "clipboard",
        svg: (
            <>
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M9 12l2 2 4-4" />
            </>
        )
    },
    {
        name: "download",
        svg: (
            <>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </>
        )
    },
    {
        name: "search",
        svg: (
            <>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </>
        )
    },
    {
        name: "settings",
        svg: (
            <>
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </>
        )
    }
];

export default function AdminTabBar({ activeTab, onTabChange }) {
    return (
        <div className="tab-bar-wrapper">
            {tabIcons.map((icon, idx) => (
                <div
                    key={idx}
                    className={`tab-btn ${activeTab === idx ? "active" : ""}`}
                    onClick={() => onTabChange(idx)}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={
                            activeTab === idx ? "#000" : "var(--text-secondary)"
                        }
                        strokeWidth="1.5"
                        width="20"
                        height="20"
                    >
                        {icon.svg}
                    </svg>
                </div>
            ))}
        </div>
    );
}
