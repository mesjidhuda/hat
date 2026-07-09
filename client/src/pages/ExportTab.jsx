import { useState } from "react";
import api from "../utils/api";
import { toast } from "../components/Toast";
import * as XLSX from "xlsx";

// Convert JSON to an Excel (.xlsx) file and trigger download
function downloadExcel(filename, data) {
  // Create a workbook
  const wb = XLSX.utils.book_new();
  // Convert the array of objects into a worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  // Write the workbook to a binary array
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  // Create a Blob and download
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ExportTab() {
  const [loadingType, setLoadingType] = useState(null);

  const exportItems = [
    { label: "Export Students", type: "students", filename: "students.xlsx" },
    { label: "Export Classes", type: "classes", filename: "classes.xlsx" },
    { label: "Export Attendance Records", type: "attendance", filename: "attendance_records.xlsx" },
    { label: "Export Teacher Logs", type: "teacher-log", filename: "teacher_log.xlsx" }
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

      downloadExcel(filename, data);
      toast.success(`${exportItems.find(i => i.type === type)?.label} downloaded`);
    } catch (err) {
      toast.error("Export failed. Please try again.");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
      <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 8 }}>
        Export Data
      </div>
      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "left", lineHeight: 1.4, marginBottom: 20 }}>
        Download full data tables as Excel files. Works on both desktop and mobile.
      </div>

      {exportItems.map(item => (
        <div key={item.type} style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: 16, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, width: "100%" }}>
          <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>{item.label}</span>
          <button
            onClick={() => handleExport(item.type, item.filename)}
            disabled={loadingType === item.type}
            style={{
              background: "transparent", border: "1px solid var(--glass-border)", borderRadius: 8,
              padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
              color: loadingType === item.type ? "var(--text-muted)" : "var(--text-secondary)",
              cursor: loadingType === item.type ? "not-allowed" : "pointer",
              fontSize: "0.8rem", fontFamily: "inherit",
              opacity: loadingType === item.type ? 0.6 : 1, transition: "opacity 0.2s"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {loadingType === item.type ? "Downloading..." : "Download"}
          </button>
        </div>
      ))}
    </div>
  );
}