import { useState } from "react";
import api from "../utils/api";
import { toast } from "../components/Toast";

// Convert array of objects to CSV string
function toCSV(data) {
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];
    data.forEach(row => {
        const values = headers.map(h => {
            const val = (row[h] ?? "").toString().replace(/"/g, '""');
            return `"${val}"`;
        });
        csvRows.push(values.join(","));
    });
    return csvRows.join("\n");
}

// Download CSV using data URI (no blobs – works on mobile)
function downloadCSV(filename, csvString) {
    const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
    const link = document.createElement("a");
    link.setAttribute("href", uri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export default function ExportTab() {
    const [loadingType, setLoadingType] = useState(null);

    const exportItems = [
        {
            label: "Export Students",
            type: "students",
            filename: "students.csv"
        },
        { label: "Export Classes", type: "classes", filename: "classes.csv" },
        {
            label: "Export Attendance Records",
            type: "attendance",
            filename: "attendance_records.csv"
        },
        {
            label: "Export Teacher Logs",
            type: "teacher-log",
            filename: "teacher_log.csv"
        }
    ];

    const handleExport = async (type, filename) => {
        setLoadingType(type);
        try {
            const endpoint =
                type === "students"
                    ? "/export/students"
                    : type === "classes"
                      ? "/export/classes"
                      : type === "attendance"
                        ? "/export/attendance"
                        : "/export/teacher-log";

            const { data } = await api.get(endpoint);

            if (!data || data.length === 0) {
                toast.error("No data to export");
                setLoadingType(null);
                return;
            }

            const csv = toCSV(data);
            downloadCSV(filename, csv);
            toast.success(
                `${exportItems.find(i => i.type === type)?.label} downloaded`
            );
        } catch (err) {
            toast.error("Export failed. Please try again.");
        } finally {
            setLoadingType(null);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "100%"
            }}
        >
            {/* Header */}
            <div
                style={{
                    
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "var(--text-primary)",
                    marginBottom: 8
                }}
            >
                Export Data
            </div>
            <div
                style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    textAlign: "left",
                    lineHeight: 1.4,
                    marginBottom: 20
                }}
            >
                Download full data tables as CSV files. Dates are shown in
                Ethiopian calendar format. Works on both desktop and mobile.
            </div>

            {/* Export Cards */}
            {exportItems.map(item => (
                <div
                    key={item.type}
                    style={{
                        background: "var(--glass)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 16,
                        padding: "16px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                        width: "100%"
                    }}
                >
                    <span
                        style={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "var(--text-primary)"
                        }}
                    >
                        {item.label}
                    </span>
                    <button
                        onClick={() => handleExport(item.type, item.filename)}
                        disabled={loadingType === item.type}
                        style={{
                            background: "transparent",
                            border: "1px solid var(--glass-border)",
                            borderRadius: 8,
                            padding: "8px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            color:
                                loadingType === item.type
                                    ? "var(--text-muted)"
                                    : "var(--text-secondary)",
                            cursor:
                                loadingType === item.type
                                    ? "not-allowed"
                                    : "pointer",
                            fontSize: "0.8rem",
                            fontFamily: "inherit",
                            opacity: loadingType === item.type ? 0.6 : 1,
                            transition: "opacity 0.2s"
                        }}
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {loadingType === item.type
                            ? "Downloading..."
                            : "Download"}
                    </button>
                </div>
            ))}
        </div>
    );
}
