import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "../components/Toast";

// Inline SVG icons – includes eye / eyeOff
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
        lock: (
            <svg
                viewBox="0 0 24 24"
                width={12}
                height={12}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        ),
        user: (
            <svg
                viewBox="0 0 24 24"
                width={12}
                height={12}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        bookOpen: (
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
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        ),
        externalLink: (
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
        )
    };
    return icons[name] || null;
};

export default function ClassesTab() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Add/Edit modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formName, setFormName] = useState("");
    const [formTeacher, setFormTeacher] = useState("");
    const [formPin, setFormPin] = useState("");

    // Delete confirmation state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState(null);

    // PIN visibility – keyed by class id, value is the plain PIN string
    const [visiblePins, setVisiblePins] = useState({});

    const fetchData = useCallback(async () => {
        try {
            const [classesRes, studentsRes] = await Promise.all([
                api.get("/classes"),
                api.get("/students")
            ]);
            setClasses(classesRes.data);
            setStudents(studentsRes.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to load classes");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Compute student count per class
    const classStudentCount = {};
    students.forEach(s => {
        const classId = s.class?._id || s.class;
        if (classId) {
            classStudentCount[classId] = (classStudentCount[classId] || 0) + 1;
        }
    });

    // ----- Add / Edit / Submit -----
    const openAddModal = () => {
        setEditingClass(null);
        setFormName("");
        setFormTeacher("");
        setFormPin("");
        setModalOpen(true);
    };

    const openEditModal = cls => {
        setEditingClass(cls);
        setFormName(cls.name || "");
        setFormTeacher(cls.teacherName || "");
        setFormPin("");
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formName.trim()) {
            toast.error("Class name is required");
            return;
        }
        if (!formTeacher.trim()) {
            toast.error("Teacher name is required");
            return;
        }
        if (!editingClass && (!formPin || !/^\d{4}$/.test(formPin))) {
            toast.error("PIN must be exactly 4 digits");
            return;
        }
        if (editingClass && formPin && !/^\d{4}$/.test(formPin)) {
            toast.error("PIN must be exactly 4 digits");
            return;
        }

        try {
            if (editingClass) {
                const payload = {
                    name: formName.trim(),
                    teacherName: formTeacher.trim()
                };
                if (formPin) payload.pin = formPin;
                await api.put(`/classes/${editingClass._id}`, payload);
                toast.success("Class updated");
            } else {
                await api.post("/classes", {
                    name: formName.trim(),
                    teacherName: formTeacher.trim(),
                    pin: formPin
                });
                toast.success("Class created");
            }
            setModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        }
    };

    // ----- Delete handlers -----
    const handleDeleteClick = cls => {
        setClassToDelete(cls);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!classToDelete) return;
        try {
            await api.delete(`/classes/${classToDelete._id}`);
            toast.success("Class deleted");
            setClassToDelete(null);
            fetchData();
        } catch (err) {
            toast.error("Could not delete class");
        }
    };

    // ----- Toggle PIN visibility -----
    const handleTogglePin = async classId => {
        // If already visible, hide it
        if (visiblePins[classId] !== undefined) {
            setVisiblePins(prev => {
                const updated = { ...prev };
                delete updated[classId];
                return updated;
            });
            return;
        }

        try {
            const { data } = await api.get(`/classes/${classId}/pin`);
            if (data.pin) {
                setVisiblePins(prev => ({ ...prev, [classId]: data.pin }));
                // Auto‑hide after 10 seconds
                setTimeout(() => {
                    setVisiblePins(prev => {
                        const updated = { ...prev };
                        delete updated[classId];
                        return updated;
                    });
                }, 10000);
            } else {
                toast.error(
                    "PIN not available. Please edit this class and set a new PIN."
                );
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Could not retrieve PIN"
            );
        }
    };

    // ----- Teacher profile navigation -----
    const goToTeacherProfile = classId => {
        navigate(`/teacher-profile/${classId}`);
    };

    // ----- Loading / Error -----
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
                    padding: "0 0 20px 0",
                    borderBottom: "1px solid var(--glass-border)",
                    marginBottom: "10px"
                }}
            >
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    Classes
                </span>
                <button onClick={openAddModal} className="add-btn">
                    + Add Class
                </button>
            </div>

            {/* Class List */}
            {classes.length === 0 ? (
                <p
                    style={{
                        color: "var(--text-muted)",
                        textAlign: "center",
                        padding: "20px 0"
                    }}
                >
                    No classes yet.
                </p>
            ) : (
                classes.map(cls => (
                    <div
                        key={cls._id}
                        style={{
                            padding: "16px 0",
                            borderBottom: "1px solid var(--glass-border)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "flex-start",
                                gap: 12,
                                width: "100%"
                            }}
                        >
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    background: "rgba(212, 175, 55, 0.15)",
                                    borderRadius: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                }}
                            >
                                <Icon name="bookOpen" />
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    textAlign: "left"
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "Cairo, sans-serif",
                                        fontWeight: 600,
                                        fontSize: "0.95rem",
                                        color: "var(--text-primary)"
                                    }}
                                >
                                    {cls.name}
                                </span>
                                <span
                                    onClick={() => goToTeacherProfile(cls._id)}
                                    style={{
                                        fontFamily: "Cairo, sans-serif",
                                        fontSize: "0.75rem",
                                        color: "var(--accent)",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4
                                    }}
                                    title="View teacher profile"
                                >
                                    {cls.teacherName}{" "}
                                    <Icon name="externalLink" />
                                </span>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 12,
                                        marginTop: 4,
                                        fontSize: "0.75rem",
                                        color: "var(--text-muted)"
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4
                                        }}
                                    >
                                        <Icon name="user" />{" "}
                                        {classStudentCount[cls._id] || 0}{" "}
                                        students
                                    </span>
                                    <span
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4
                                        }}
                                    >
                                        <Icon name="lock" />
                                        PIN:{" "}
                                        {visiblePins[cls._id] !== undefined
                                            ? visiblePins[cls._id]
                                            : "••••"}
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleTogglePin(cls._id);
                                            }}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: 0,
                                                marginLeft: 4,
                                                display: "flex",
                                                alignItems: "center"
                                            }}
                                            title={
                                                visiblePins[cls._id] !==
                                                undefined
                                                    ? "Hide PIN"
                                                    : "Show PIN"
                                            }
                                        >
                                            <Icon
                                                name={
                                                    visiblePins[cls._id] !==
                                                    undefined
                                                        ? "eyeOff"
                                                        : "eye"
                                                }
                                                size={14}
                                            />
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>

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
                                onClick={() => openEditModal(cls)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 4
                                }}
                                title="Edit class"
                            >
                                <Icon name="edit" />
                            </button>
                            <button
                                onClick={() => handleDeleteClick(cls)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 4
                                }}
                                title="Delete class"
                            >
                                <Icon name="trash" />
                            </button>
                        </div>
                    </div>
                ))
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingClass ? "Edit Class" : "Add New Class"}
            >
                <input
                    type="text"
                    placeholder="Class name"
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
                <input
                    type="text"
                    placeholder="Teacher name"
                    value={formTeacher}
                    onChange={e => setFormTeacher(e.target.value)}
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
                <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="4"
                    placeholder={
                        editingClass
                            ? "New PIN (leave blank to keep current)"
                            : "4‑digit PIN"
                    }
                    value={formPin}
                    onChange={e =>
                        setFormPin(e.target.value.replace(/\D/g, ""))
                    }
                    required={!editingClass}
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
                {editingClass && (
                    <p
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "0.75rem",
                            marginTop: -8,
                            textAlign: "center"
                        }}
                    >
                        Leave blank to keep current PIN
                    </p>
                )}
                <div className="modal-actions">
                    <button
                        className="modal-cancel"
                        onClick={() => setModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button className="modal-confirm" onClick={handleSubmit}>
                        {editingClass ? "Save Changes" : "Add Class"}
                    </button>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Class"
                message={`Are you sure you want to delete "${classToDelete?.name}"? This action cannot be undone.`}
            />
        </>
    );
}
