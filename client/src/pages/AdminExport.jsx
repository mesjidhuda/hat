import { useState } from "react";
import api from "../utils/api";

// Helper: convert array of objects to CSV string
function toCSV(data) {
    if (data.length === 0) return "";
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

function downloadCSV(filename, csvString) {
    const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
    const link = document.createElement("a");
    link.setAttribute("href", uri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export default function AdminExport() {
    const [loading, setLoading] = useState(false);

    const handleExport = async type => {
        setLoading(true);
        try {
            let data = [];
            let filename = "";
            if (type === "students") {
                const res = await api.get("/export/students");
                data = res.data;
                filename = "students.csv";
            } else if (type === "classes") {
                const res = await api.get("/export/classes");
                data = res.data;
                filename = "classes.csv";
            } else if (type === "attendance") {
                const res = await api.get("/export/attendance");
                data = res.data;
                filename = "attendance_records.csv";
            } else if (type === "teacher-log") {
                const res = await api.get("/export/teacher-log");
                data = res.data;
                filename = "teacher_log.csv";
            }
            if (data.length === 0) {
                alert("No data to export");
            } else {
                const csv = toCSV(data);
                downloadCSV(filename, csv);
            }
        } catch (err) {
            alert("Export failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="export-tab">
            <h3>Export Data</h3>
            <p>Downloads CSV files using data URIs (works on mobile).</p>
            <div className="export-buttons">
                <button
                    onClick={() => handleExport("students")}
                    disabled={loading}
                >
                    Export Students
                </button>
                <button
                    onClick={() => handleExport("classes")}
                    disabled={loading}
                >
                    Export Classes
                </button>
                <button
                    onClick={() => handleExport("attendance")}
                    disabled={loading}
                >
                    Export Attendance Records
                </button>
                <button
                    onClick={() => handleExport("teacher-log")}
                    disabled={loading}
                >
                    Export Teacher Log
                </button>
            </div>
        </div>
    );
}
