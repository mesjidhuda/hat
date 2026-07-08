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
        edit: (
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
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
        ),
        trash: (
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
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
        ),
        transfer: (
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
                <path d="M17 1l4 4-4 4" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <path d="M7 23l-4-4 4-4" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
        ),
        searchIcon: (
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
        chevronDown: (
            <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
            >
                <polyline points="6 9 12 15 18 9" />
            </svg>
        ),
        profile: (
            <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
        ),
        upload: (
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
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
        )
    };
    return icons[name] || null;
};

export default function StudentsTab() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search & filter
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClassId, setSelectedClassId] = useState("all");

    // Add/Edit modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [formName, setFormName] = useState("");
    const [formClassId, setFormClassId] = useState("");
    const [formParentPhone, setFormParentPhone] = useState("");
    const [formEnrollmentDate, setFormEnrollmentDate] = useState("");

    // Transfer modal state
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [transferringStudent, setTransferringStudent] = useState(null);
    const [targetClassId, setTargetClassId] = useState("");

    // Delete confirmation state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    // Bulk import state
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [csvPreview, setCsvPreview] = useState([]);
    const [csvErrors, setCsvErrors] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const [studentsRes, classesRes] = await Promise.all([
                api.get("/students"),
                api.get("/classes")
            ]);
            setStudents(studentsRes.data);
            setClasses(classesRes.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to load students");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ----- Add Modal -----
    const openAddModal = () => {
        setEditingStudent(null);
        setFormName("");
        setFormClassId("");
        setFormParentPhone("");
        setFormEnrollmentDate(new Date().toISOString().split("T")[0]);
        setModalOpen(true);
    };

    // ----- Edit Modal -----
    const openEditModal = student => {
        setEditingStudent(student);
        setFormName(student.name || "");
        setFormClassId(student.class?._id || student.class || "");
        setFormParentPhone(student.parentPhone || "");
        setFormEnrollmentDate(
            student.enrollmentDate
                ? new Date(student.enrollmentDate).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0]
        );
        setModalOpen(true);
    };

    // ----- Submit Add/Edit -----
    const handleSubmit = async () => {
        if (!formName.trim()) {
            toast.error("Student name is required");
            return;
        }
        if (!formClassId) {
            toast.error("Please select a class");
            return;
        }

        try {
            if (editingStudent) {
                await api.put(`/students/${editingStudent._id}`, {
                    name: formName.trim(),
                    classId: formClassId,
                    parentPhone: formParentPhone.trim(),
                    enrollmentDate: formEnrollmentDate
                });
                toast.success("Student updated");
            } else {
                await api.post("/students", {
                    name: formName.trim(),
                    classId: formClassId,
                    parentPhone: formParentPhone.trim(),
                    enrollmentDate: formEnrollmentDate
                });
                toast.success("Student added");
            }
            setModalOpen(false);
            fetchData();
        } catch (err) {
            const message = err.response?.data?.message || "Operation failed";
            toast.error(message);
        }
    };

    // ----- Delete Handlers -----
    const handleDeleteClick = student => {
        setStudentToDelete(student);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!studentToDelete) return;
        try {
            await api.delete(`/students/${studentToDelete._id}`);
            toast.success("Student deleted");
            setStudentToDelete(null);
            fetchData();
        } catch (err) {
            toast.error("Could not delete student");
        }
    };

    // ----- Transfer Handlers -----
    const openTransferModal = student => {
        setTransferringStudent(student);
        setTargetClassId("");
        setTransferModalOpen(true);
    };

    const handleTransfer = async () => {
        if (!targetClassId) {
            toast.error("Please select a target class");
            return;
        }

        const currentClassId =
            transferringStudent?.class?._id || transferringStudent?.class;

        if (targetClassId === currentClassId) {
            toast.error("Student is already in that class");
            return;
        }

        try {
            await api.put(`/students/${transferringStudent._id}`, {
                classId: targetClassId
            });
            toast.success(
                `${transferringStudent.name} transferred successfully`
            );
            setTransferModalOpen(false);
            fetchData();
        } catch (err) {
            const message = err.response?.data?.message || "Transfer failed";
            toast.error(message);
        }
    };

    // ----- Bulk Import Handlers -----
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
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Import failed");
        }
    };

    // ----- Navigation to Student Profile -----
    const goToStudentProfile = studentId => {
        navigate(`/student/${studentId}`);
    };

    // ----- Filter Students -----
    const filteredStudents = students.filter(s => {
        const matchesName = (s.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const classId = s.class?._id || s.class || "";
        const matchesClass =
            selectedClassId === "all" || classId === selectedClassId;
        return matchesName && matchesClass;
    });

    // ----- Loading / Error States -----
    if (loading) {
        return (
            <div
                style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "var(--text-secondary)"
                }}
            >
                Loading…
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#f44336"
                }}
            >
                {error}
            </div>
        );
    }

    // ----- Render -----
    return (
        <>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 15
                }}
            >
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    Students
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                    <label
                        style={{
                            cursor: "pointer",
                            background: "transparent",
                            border: "1px solid var(--glass-border)",
                            borderRadius: 50,
                            padding: "8px 16px",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                        }}
                    >
                        <Icon name="upload" />
                        Import
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                        />
                    </label>
                    <button onClick={openAddModal} className="add-btn">
                        + Add
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div
                style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 15,
                    width: "100%"
                }}
            >
                <div
                    style={{
                        flex: 1,
                        background: "var(--glass)",
                        borderRadius: 12,
                        border: "1px solid var(--glass-border)",
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10
                    }}
                >
                    <Icon name="searchIcon" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-primary)",
                            width: "100%",
                            fontFamily: "inherit",
                            outline: "none",
                            fontSize: "0.9rem"
                        }}
                    />
                </div>
                <div
                    style={{
                        background: "var(--glass)",
                        borderRadius: 12,
                        border: "1px solid var(--glass-border)",
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 100,
                        cursor: "pointer",
                        justifyContent: "space-between"
                    }}
                >
                    <select
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-secondary)",
                            fontFamily: "inherit",
                            fontSize: "0.8rem",
                            outline: "none",
                            width: "100%",
                            cursor: "pointer"
                        }}
                    >
                        <option value="all">All Classes</option>
                        {classes.map(c => (
                            <option key={c._id} value={c._id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <Icon name="chevronDown" />
                </div>
            </div>

            {/* Count */}
            <div
                style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.8rem",
                    marginBottom: 10,
                    textAlign: "left"
                }}
            >
                {filteredStudents.length} student
                {filteredStudents.length !== 1 ? "s" : ""}
            </div>

            {/* Student List */}
            <div>
                {filteredStudents.length === 0 && (
                    <p
                        style={{
                            color: "var(--text-muted)",
                            textAlign: "center",
                            padding: "20px 0"
                        }}
                    >
                        No students found.
                    </p>
                )}

                {filteredStudents.map(student => (
                    <div
                        key={student._id}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 0",
                            borderBottom: "1px solid var(--glass-border)"
                        }}
                    >
                        {/* Student Info */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                textAlign: "left",
                                flex: 1
                            }}
                        >
                            <span
                                onClick={() => goToStudentProfile(student._id)}
                                style={{
                                    fontFamily: "Cairo, sans-serif",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    color: "var(--accent)",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4
                                }}
                                title="View student profile"
                            >
                                {student.name} <Icon name="profile" />
                            </span>
                            <span
                                style={{
                                    fontFamily: "Cairo, sans-serif",
                                    fontSize: "0.8rem",
                                    color: "var(--text-secondary)"
                                }}
                            >
                                {student.class?.name || "No class"}
                            </span>
                            <span
                                style={{
                                    fontSize: "0.7rem",
                                    color: "var(--text-muted)",
                                    marginTop: 2
                                }}
                            >
                                {student.enrollmentDate
                                    ? new Date(
                                          student.enrollmentDate
                                      ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric"
                                      })
                                    : ""}
                                {student.parentPhone && (
                                    <span style={{ marginLeft: 8 }}>
                                        📞 {student.parentPhone}
                                    </span>
                                )}
                            </span>
                        </div>

                        {/* Actions */}
                        <div
                            style={{
                                display: "flex",
                                gap: 15,
                                alignItems: "center",
                                flexShrink: 0,
                                marginLeft: 15
                            }}
                        >
                            <button
                                onClick={() => openEditModal(student)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 4
                                }}
                                title="Edit student"
                            >
                                <Icon name="edit" />
                            </button>
                            <button
                                onClick={() => openTransferModal(student)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 4
                                }}
                                title="Transfer to another class"
                            >
                                <Icon name="transfer" />
                            </button>
                            <button
                                onClick={() => handleDeleteClick(student)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 4
                                }}
                                title="Delete student"
                            >
                                <Icon name="trash" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingStudent ? "Edit Student" : "Add New Student"}
            >
                <input
                    type="text"
                    placeholder="Student name"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    autoFocus
                    style={{
                        background: "var(--glass)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 12,
                        padding: "14px 16px",
                        color: "var(--text-primary)",
                        fontSize: "1rem",
                        outline: "none",
                        fontFamily: "inherit"
                    }}
                />

                <select
                    value={formClassId}
                    onChange={e => setFormClassId(e.target.value)}
                    style={{
                        background: "var(--glass)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 12,
                        padding: "14px 16px",
                        color: "var(--text-primary)",
                        fontSize: "1rem",
                        outline: "none",
                        fontFamily: "inherit"
                    }}
                >
                    <option value="">Select class</option>
                    {classes.map(c => (
                        <option key={c._id} value={c._id}>
                            {c.name} ({c.teacherName})
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="Parent phone (optional)"
                    value={formParentPhone}
                    onChange={e => setFormParentPhone(e.target.value)}
                    style={{
                        background: "var(--glass)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 12,
                        padding: "14px 16px",
                        color: "var(--text-primary)",
                        fontSize: "1rem",
                        outline: "none",
                        fontFamily: "inherit"
                    }}
                />

                <label
                    style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                        marginBottom: -8
                    }}
                >
                    Enrollment Date
                </label>
                <input
                    type="date"
                    value={formEnrollmentDate}
                    onChange={e => setFormEnrollmentDate(e.target.value)}
                    style={{
                        background: "var(--glass)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 12,
                        padding: "14px 16px",
                        color: "var(--text-primary)",
                        fontSize: "1rem",
                        outline: "none",
                        fontFamily: "inherit"
                    }}
                />

                <div className="modal-actions">
                    <button
                        className="modal-cancel"
                        onClick={() => setModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button className="modal-confirm" onClick={handleSubmit}>
                        {editingStudent ? "Save Changes" : "Add Student"}
                    </button>
                </div>
            </Modal>

            {/* Transfer Modal */}
            <Modal
                isOpen={transferModalOpen}
                onClose={() => setTransferModalOpen(false)}
                title="Transfer Student"
            >
                {transferringStudent && (
                    <>
                        <p
                            style={{
                                color: "var(--text-secondary)",
                                marginBottom: 12,
                                lineHeight: 1.5
                            }}
                        >
                            Transfer{" "}
                            <strong style={{ color: "var(--text-primary)" }}>
                                {transferringStudent.name}
                            </strong>{" "}
                            from{" "}
                            <strong style={{ color: "var(--accent)" }}>
                                {transferringStudent.class?.name ||
                                    "Unknown class"}
                            </strong>
                        </p>

                        <select
                            value={targetClassId}
                            onChange={e => setTargetClassId(e.target.value)}
                            style={{
                                background: "var(--glass)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: 12,
                                padding: "14px 16px",
                                color: "var(--text-primary)",
                                fontSize: "1rem",
                                outline: "none",
                                fontFamily: "inherit"
                            }}
                        >
                            <option value="">Select target class</option>
                            {classes
                                .filter(
                                    c =>
                                        c._id !==
                                        (transferringStudent.class?._id ||
                                            transferringStudent.class)
                                )
                                .map(c => (
                                    <option key={c._id} value={c._id}>
                                        {c.name} ({c.teacherName})
                                    </option>
                                ))}
                        </select>

                        <p
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "0.8rem",
                                marginTop: 10,
                                textAlign: "center"
                            }}
                        >
                            ✓ Attendance history will be preserved
                        </p>

                        <div className="modal-actions">
                            <button
                                className="modal-cancel"
                                onClick={() => setTransferModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-confirm"
                                onClick={handleTransfer}
                            >
                                Transfer
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Student"
                message={`Are you sure you want to delete "${studentToDelete?.name}"? This action cannot be undone.`}
            />

            {/* Bulk Import Preview Modal */}
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
                            <p key={i} style={{ margin: 0 }}>
                                {e}
                            </p>
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
        </>
    );
}
