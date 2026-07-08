import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import Papa from "papaparse";

export default function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [name, setName] = useState("");
    const [selectedClassId, setSelectedClassId] = useState("");
    const [parentPhone, setParentPhone] = useState("");
    const [error, setError] = useState("");
    const [csvPreview, setCsvPreview] = useState([]);
    const [csvErrors, setCsvErrors] = useState([]);
    const [showImport, setShowImport] = useState(false);
    const fileInputRef = useRef(null);

    const fetchStudents = async () => {
        try {
            const { data } = await api.get("/students");
            setStudents(data);
        } catch (err) {
            setError("Could not load students");
        }
    };

    const fetchClasses = async () => {
        try {
            const { data } = await api.get("/classes");
            setClasses(data);
        } catch (err) {
            /* ignore */
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, []);

    const handleAddStudent = async e => {
        e.preventDefault();
        if (!name || !selectedClassId) {
            return setError("Name and class required");
        }
        try {
            await api.post("/students", {
                name,
                classId: selectedClassId,
                parentPhone
            });
            setName("");
            setSelectedClassId("");
            setParentPhone("");
            setError("");
            fetchStudents();
        } catch (err) {
            setError(err.response?.data?.message || "Error adding student");
        }
    };

    const handleDelete = async id => {
        if (!window.confirm("Delete student?")) return;
        try {
            await api.delete(`/students/${id}`);
            fetchStudents();
        } catch (err) {
            setError("Could not delete student");
        }
    };

    const handleFileUpload = e => {
        const file = e.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: results => {
                const rows = results.data;
                const preview = rows.map((row, idx) => ({
                    name: row.Name || row.name || "",
                    className: row.Class || row.class || "",
                    parentPhone: row["Parent Phone"] || row.parentPhone || ""
                }));
                // Validate class names against existing classes
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
            alert(`Imported ${data.imported} students`);
            setCsvPreview([]);
            setCsvErrors([]);
            setShowImport(false);
            fetchStudents();
        } catch (err) {
            setError(err.response?.data?.message || "Import failed");
        }
    };

    return (
        <div>
            <h3>Students</h3>
            {error && (
                <p className="error" role="alert">
                    {error}
                </p>
            )}

            {/* Add student form */}
            <form onSubmit={handleAddStudent} className="form-inline">
                <input
                    placeholder="Student name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
                <select
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                    required
                >
                    <option value="">Select class</option>
                    {classes.map(c => (
                        <option key={c._id} value={c._id}>
                            {c.name} ({c.teacherName})
                        </option>
                    ))}
                </select>
                <input
                    placeholder="Parent phone (optional)"
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                    Add Student
                </button>
            </form>

            {/* Bulk import toggle */}
            <button
                onClick={() => setShowImport(!showImport)}
                className="btn-secondary"
            >
                {showImport ? "Cancel import" : "Import from CSV"}
            </button>

            {showImport && (
                <div className="import-section">
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    {csvPreview.length > 0 && (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Class</th>
                                        <th>Parent Phone</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {csvPreview.map((row, i) => (
                                        <tr key={i}>
                                            <td>{row.name}</td>
                                            <td>{row.className}</td>
                                            <td>{row.parentPhone}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {csvErrors.length > 0 && (
                                <div className="error">
                                    {csvErrors.map((e, i) => (
                                        <p key={i}>{e}</p>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={confirmImport}
                                disabled={csvErrors.length > 0}
                                className="btn-primary"
                            >
                                Confirm Import ({csvPreview.length} students)
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Student list */}
            <ul className="student-list">
                {students.map(s => (
                    <li key={s._id}>
                        <span>{s.name}</span> —{" "}
                        <span>{s.class?.name || "No class"}</span>
                        <span className="phone">{s.parentPhone}</span>
                        <button onClick={() => handleDelete(s._id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
