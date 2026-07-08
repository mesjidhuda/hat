import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "../components/Toast";
import Papa from "papaparse";

// Inline SVG icons
const Icon = ({ name, size = 18, color = "var(--text-secondary)" }) => {
    const icons = {
        settings: (
            <svg
                viewBox="0 0 24 24"
                width={size}
                height={size}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
        ),
        eye: (
            <svg
                viewBox="0 0 24 24"
                width={size}
                height={size}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        ),
        eyeOff: (
            <svg
                viewBox="0 0 24 24"
                width={size}
                height={size}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
        ),
        upload: (
            <svg
                viewBox="0 0 24 24"
                width={20}
                height={20}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
        ),
        alertTriangle: (
            <svg
                viewBox="0 0 24 24"
                width={20}
                height={20}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 9v4M12 17h.01" />
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        trash: (
            <svg
                viewBox="0 0 24 24"
                width={16}
                height={16}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
        ),
        checkCircle: (
            <svg
                viewBox="0 0 24 24"
                width={16}
                height={16}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="20 6 9 17 4 12" />
            </svg>
        ),
        chevronDown: (
            <svg
                viewBox="0 0 24 24"
                width={16}
                height={16}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="6 9 12 15 18 9" />
            </svg>
        ),
        export: (
            <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
            </svg>
        )
    };
    return icons[name] || null;
};

export default function SettingsTab() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Admin PIN state
    const [currentPin, setCurrentPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [showCurrentPin, setShowCurrentPin] = useState(false);
    const [showNewPin, setShowNewPin] = useState(false);

    // Bulk import state
    const [csvPreview, setCsvPreview] = useState([]);
    const [csvErrors, setCsvErrors] = useState([]);
    const [importModalOpen, setImportModalOpen] = useState(false);

    // Accordion state
    const [accordionOpen, setAccordionOpen] = useState(false);

    // Reset states
    const [resetAttendanceModalOpen, setResetAttendanceModalOpen] =
        useState(false);
    const [resetEverythingModalOpen, setResetEverythingModalOpen] =
        useState(false);
    const [resetConfirmText, setResetConfirmText] = useState("");

    const fetchClasses = useCallback(async () => {
        try {
            const { data } = await api.get("/classes");
            setClasses(data);
            setLoading(false);
        } catch {
            toast.error("Could not load classes");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    const handleSaveAdminPin = async () => {
        if (!currentPin) {
            toast.error("Current PIN is required");
            return;
        }
        if (!newPin || !/^\d{4}$/.test(newPin)) {
            toast.error("New PIN must be exactly 4 digits");
            return;
        }
        if (newPin !== confirmPin) {
            toast.error("PINs do not match");
            return;
        }

        try {
            await api.put("/admin/change-pin", {
                currentPin,
                newPin
            });
            toast.success("Admin PIN updated successfully");
            setCurrentPin("");
            setNewPin("");
            setConfirmPin("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update PIN");
        }
    };

    // ----- Bulk Import -----
    const handleFileUpload = e => {
        const file = e.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: results => {
                const rows = results.data;
                const preview = rows.map(row => ({
                    name: row.Name || row.name || "",
                    className: row.Class || row.class || "",
                    parentPhone: row["Parent Phone"] || row.parentPhone || ""
                }));
                const classMap = {};
                classes.forEach(c => {
                    classMap[c.name.toLowerCase()] = c._id;
                });
                const errors = [];
                preview.forEach((p, i) => {
                    if (!p.name) errors.push(`Row ${i + 1}: Missing name`);
                    else if (!p.className)
                        errors.push(`Row ${i + 1}: Missing class`);
                    else if (!classMap[p.className.toLowerCase()])
                        errors.push(
                            `Row ${i + 1}: Unknown class "${p.className}"`
                        );
                });
                setCsvPreview(preview);
                setCsvErrors(errors);
                setImportModalOpen(true);
            }
        });
    };

    const confirmImport = async () => {
        if (csvErrors.length > 0) return;
        const classMap = {};
        classes.forEach(c => {
            classMap[c.name.toLowerCase()] = c._id;
        });
        const payload = csvPreview.map(p => ({
            name: p.name,
            classId: classMap[p.className.toLowerCase()],
            parentPhone: p.parentPhone
        }));
        try {
            const { data } = await api.post("/students/bulk", {
                students: payload
            });
            toast.success(`Imported ${data.imported} students`);
            setCsvPreview([]);
            setCsvErrors([]);
            setImportModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Import failed");
        }
    };

    // ----- Navigate to Export Tab -----
    const goToExportTab = () => {
        // Navigate to admin dashboard with export tab selected (tab index 5)
        navigate("/admin/dashboard");
        // We need to communicate which tab to open.
        // Since AdminDashboard uses local state, we'll use sessionStorage.
        sessionStorage.setItem("adminActiveTab", "5");
        // Force reload so the dashboard picks up the tab
        window.location.href = "/admin/dashboard";
    };

    // ----- Reset Handlers -----
    const handleResetAttendance = async () => {
        if (resetConfirmText !== "RESET") return;
        try {
            await api.post("/reset/attendance", { confirmation: "RESET" });
            toast.success(
                "Attendance records, teacher logs, and flags cleared."
            );
            setResetAttendanceModalOpen(false);
            setResetConfirmText("");
        } catch {
            toast.error("Reset failed");
        }
    };

    const handleResetEverything = async () => {
        if (resetConfirmText !== "RESET") return;
        try {
            await api.post("/reset/everything", { confirmation: "RESET" });
            localStorage.removeItem("adminToken");
            toast.success("All data cleared. Redirecting to admin setup...");
            setResetEverythingModalOpen(false);
            setTimeout(() => navigate("/admin"), 1500);
        } catch {
            toast.error("Reset failed");
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    padding: 20,
                    textAlign: "center",
                    color: "var(--text-secondary)"
                }}
            >
                Loading…
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 25 }}>
            {/* Title */}
            <div
                style={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "var(--text-primary)"
                }}
            >
                Settings
            </div>

            {/* ----- Admin PIN Section ----- */}
            <div
                style={{
                    background: "var(--glass)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 20,
                    padding: 20
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 15
                    }}
                >
                    <Icon name="settings" size={22} color="var(--accent)" />
                    <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                        Admin PIN
                    </span>
                </div>

                <div style={{ marginBottom: 15 }}>
                    <div
                        style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginBottom: 5
                        }}
                    >
                        Current PIN
                    </div>
                    <div
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 12,
                            padding: "12px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            border: "1px solid var(--glass-border)"
                        }}
                    >
                        <input
                            type={showCurrentPin ? "text" : "password"}
                            value={currentPin}
                            onChange={e =>
                                setCurrentPin(
                                    e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 4)
                                )
                            }
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            placeholder="Enter current PIN"
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--text-primary)",
                                width: "100%",
                                outline: "none",
                                fontFamily: "inherit",
                                letterSpacing: 2
                            }}
                        />
                        <span
                            onClick={() => setShowCurrentPin(!showCurrentPin)}
                            style={{ cursor: "pointer" }}
                        >
                            <Icon name={showCurrentPin ? "eyeOff" : "eye"} />
                        </span>
                    </div>
                </div>

                <div style={{ marginBottom: 15 }}>
                    <div
                        style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginBottom: 5
                        }}
                    >
                        New PIN
                    </div>
                    <div
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 12,
                            padding: "12px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            border: "1px solid var(--glass-border)"
                        }}
                    >
                        <input
                            type={showNewPin ? "text" : "password"}
                            value={newPin}
                            onChange={e =>
                                setNewPin(
                                    e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 4)
                                )
                            }
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            placeholder="Enter new PIN"
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--text-primary)",
                                width: "100%",
                                outline: "none",
                                fontFamily: "inherit",
                                letterSpacing: 2
                            }}
                        />
                        <span
                            onClick={() => setShowNewPin(!showNewPin)}
                            style={{ cursor: "pointer" }}
                        >
                            <Icon name={showNewPin ? "eyeOff" : "eye"} />
                        </span>
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div
                        style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginBottom: 5
                        }}
                    >
                        Confirm PIN
                    </div>
                    <div
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 12,
                            padding: "12px 16px",
                            border: "1px solid var(--glass-border)"
                        }}
                    >
                        <input
                            type="password"
                            value={confirmPin}
                            onChange={e =>
                                setConfirmPin(
                                    e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 4)
                                )
                            }
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            placeholder="Confirm new PIN"
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--text-primary)",
                                width: "100%",
                                outline: "none",
                                fontFamily: "inherit",
                                letterSpacing: 2
                            }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSaveAdminPin}
                    className="add-btn"
                    style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 8
                    }}
                >
                    <Icon name="checkCircle" size={16} color="#000" /> Save PIN
                </button>
            </div>

            {/* ----- Bulk Import ----- */}
            <div>
                <div
                    style={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        marginBottom: 8
                    }}
                >
                    Bulk Import
                </div>
                <div
                    style={{
                        background: "var(--glass)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 20,
                        padding: 20
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 10
                        }}
                    >
                        <Icon name="upload" />
                        <span
                            style={{
                                fontWeight: 600,
                                color: "var(--text-primary)"
                            }}
                        >
                            Import Students (CSV)
                        </span>
                    </div>
                    <div
                        style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginBottom: 20,
                            lineHeight: 1.4
                        }}
                    >
                        Upload a CSV with columns: student name, assigned class,
                        phone number. Class name must match existing classes
                        exactly.
                    </div>
                    <label style={{ cursor: "pointer" }}>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                        />
                        <div
                            style={{
                                border: "2px dashed var(--glass-border)",
                                borderRadius: 16,
                                padding: "40px 20px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--text-secondary)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <div
                                style={{
                                    color: "var(--text-secondary)",
                                    fontSize: "0.9rem",
                                    marginTop: 10
                                }}
                            >
                                Click to select a CSV file
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* ----- Data Management Accordion ----- */}
            <div>
                <div
                    onClick={() => setAccordionOpen(!accordionOpen)}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        paddingBottom: 10,
                        borderBottom: "1px solid transparent",
                        userSelect: "none"
                    }}
                >
                    <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                        Data Management
                    </span>
                    <Icon
                        name="chevronDown"
                        color="var(--text-secondary)"
                        style={{
                            transform: accordionOpen
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            transition: "transform 0.3s ease"
                        }}
                    />
                </div>

                {accordionOpen && (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 20,
                            marginTop: 15
                        }}
                    >
                        {/* Export Reminder */}
                        <div
                            style={{
                                background: "rgba(212,175,55,0.05)",
                                border: "1px solid rgba(212,175,55,0.3)",
                                borderRadius: 16,
                                padding: 16,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: 10
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12
                                }}
                            >
                                <div
                                    style={{
                                        background: "var(--glass)",
                                        borderRadius: "50%",
                                        width: 32,
                                        height: 32,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    <Icon
                                        name="alertTriangle"
                                        size={18}
                                        color="var(--accent)"
                                    />
                                </div>
                                <div>
                                    <div
                                        style={{
                                            color: "var(--text-primary)",
                                            fontSize: "0.9rem",
                                            fontWeight: 600
                                        }}
                                    >
                                        Export your data first
                                    </div>
                                    <div
                                        style={{
                                            color: "var(--text-secondary)",
                                            fontSize: "0.75rem"
                                        }}
                                    >
                                        We strongly recommend exporting all data
                                        before resetting.
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={goToExportTab}
                                style={{
                                    background: "transparent",
                                    border: "1px solid var(--glass-border)",
                                    borderRadius: 8,
                                    padding: "6px 12px",
                                    color: "var(--text-secondary)",
                                    fontSize: "0.75rem",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    flexShrink: 0
                                }}
                            >
                                <Icon name="export" /> Go to Export Data
                            </button>
                        </div>

                        {/* Danger Zone */}
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 15
                                }}
                            >
                                <Icon
                                    name="alertTriangle"
                                    size={20}
                                    color="#f44336"
                                />
                                <span
                                    style={{
                                        fontWeight: 600,
                                        fontSize: "1.1rem",
                                        color: "#f44336"
                                    }}
                                >
                                    Danger Zone
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: "0.85rem",
                                    color: "var(--text-secondary)",
                                    marginBottom: 15
                                }}
                            >
                                This action permanently deletes data and cannot
                                be undone. Type RESET to confirm.
                            </div>

                            {/* Reset Attendance */}
                            <div
                                style={{
                                    border: "1px solid #f44336",
                                    borderRadius: 16,
                                    padding: 16,
                                    background: "rgba(244,67,54,0.05)",
                                    marginBottom: 15
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        fontSize: "1rem",
                                        marginBottom: 4,
                                        color: "var(--text-primary)"
                                    }}
                                >
                                    Reset All Attendance Records
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "var(--text-secondary)",
                                        marginBottom: 12
                                    }}
                                >
                                    All attendance history, teacher logs, and
                                    flags will be deleted. Students and classes
                                    remain intact.
                                </div>
                                <button
                                    onClick={() => {
                                        setResetConfirmText("");
                                        setResetAttendanceModalOpen(true);
                                    }}
                                    style={{
                                        background: "#f44336",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 8,
                                        padding: "8px 16px",
                                        fontWeight: 600,
                                        fontSize: "0.85rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        cursor: "pointer"
                                    }}
                                >
                                    <Icon name="trash" color="#fff" /> Reset
                                    Attendance
                                </button>
                            </div>

                            {/* Reset Everything */}
                            <div
                                style={{
                                    border: "1px solid #f44336",
                                    borderRadius: 16,
                                    padding: 16,
                                    background: "rgba(244,67,54,0.05)"
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        fontSize: "1rem",
                                        marginBottom: 4,
                                        color: "var(--text-primary)"
                                    }}
                                >
                                    Reset Everything
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "var(--text-secondary)",
                                        marginBottom: 12
                                    }}
                                >
                                    Resets all records, students, classes, PINs,
                                    and teacher logs. You will be logged out.
                                </div>
                                <button
                                    onClick={() => {
                                        setResetConfirmText("");
                                        setResetEverythingModalOpen(true);
                                    }}
                                    style={{
                                        background: "#f44336",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 8,
                                        padding: "8px 16px",
                                        fontWeight: 600,
                                        fontSize: "0.85rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        cursor: "pointer"
                                    }}
                                >
                                    <Icon name="trash" color="#fff" /> Reset
                                    Everything
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ----- Modals ----- */}

            {/* Import Preview Modal */}
            <Modal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                title="Import Preview"
            >
                <div style={{ maxHeight: 300, overflow: "auto" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "0.8rem"
                        }}
                    >
                        <thead>
                            <tr
                                style={{
                                    borderBottom:
                                        "1px solid var(--glass-border)"
                                }}
                            >
                                <th
                                    style={{
                                        padding: 6,
                                        textAlign: "left",
                                        color: "var(--text-secondary)"
                                    }}
                                >
                                    Name
                                </th>
                                <th
                                    style={{
                                        padding: 6,
                                        textAlign: "left",
                                        color: "var(--text-secondary)"
                                    }}
                                >
                                    Class
                                </th>
                                <th
                                    style={{
                                        padding: 6,
                                        textAlign: "left",
                                        color: "var(--text-secondary)"
                                    }}
                                >
                                    Phone
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {csvPreview.map((row, i) => (
                                <tr
                                    key={i}
                                    style={{
                                        borderBottom:
                                            "1px solid rgba(255,255,255,0.05)"
                                    }}
                                >
                                    <td style={{ padding: 6 }}>{row.name}</td>
                                    <td style={{ padding: 6 }}>
                                        {row.className}
                                    </td>
                                    <td style={{ padding: 6 }}>
                                        {row.parentPhone}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {csvErrors.length > 0 && (
                    <div
                        style={{
                            color: "#f44336",
                            fontSize: "0.8rem",
                            marginTop: 10
                        }}
                    >
                        {csvErrors.map((e, i) => (
                            <p key={i}>{e}</p>
                        ))}
                    </div>
                )}
                <p
                    style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                        marginTop: 10
                    }}
                >
                    {csvPreview.length} student(s) to import
                </p>
                <div className="modal-actions">
                    <button
                        className="modal-cancel"
                        onClick={() => setImportModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="modal-confirm"
                        onClick={confirmImport}
                        disabled={csvErrors.length > 0}
                    >
                        Confirm Import
                    </button>
                </div>
            </Modal>

            {/* Reset Attendance Confirm Modal */}
            <ConfirmModal
                isOpen={resetAttendanceModalOpen}
                onClose={() => setResetAttendanceModalOpen(false)}
                onConfirm={handleResetAttendance}
                title="Reset Attendance Records"
                message={
                    <div>
                        <p style={{ marginBottom: 10 }}>
                            Type <strong>RESET</strong> to confirm.
                        </p>
                        <input
                            type="text"
                            value={resetConfirmText}
                            onChange={e =>
                                setResetConfirmText(
                                    e.target.value.toUpperCase()
                                )
                            }
                            placeholder="RESET"
                            style={{
                                width: "100%",
                                padding: 10,
                                background: "var(--glass)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: 8,
                                color: "var(--text-primary)",
                                fontFamily: "inherit"
                            }}
                        />
                    </div>
                }
            />

            {/* Reset Everything Confirm Modal */}
            <ConfirmModal
                isOpen={resetEverythingModalOpen}
                onClose={() => setResetEverythingModalOpen(false)}
                onConfirm={handleResetEverything}
                title="Reset Everything"
                message={
                    <div>
                        <p style={{ marginBottom: 10 }}>
                            Type <strong>RESET</strong> to confirm.
                        </p>
                        <input
                            type="text"
                            value={resetConfirmText}
                            onChange={e =>
                                setResetConfirmText(
                                    e.target.value.toUpperCase()
                                )
                            }
                            placeholder="RESET"
                            style={{
                                width: "100%",
                                padding: 10,
                                background: "var(--glass)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: 8,
                                color: "var(--text-primary)",
                                fontFamily: "inherit"
                            }}
                        />
                    </div>
                }
            />
        </div>
    );
}
