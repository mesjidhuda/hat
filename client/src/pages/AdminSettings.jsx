import { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function AdminSettings() {
    const [resetAttConfirm, setResetAttConfirm] = useState("");
    const [resetAllConfirm, setResetAllConfirm] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleResetAttendance = async () => {
        if (resetAttConfirm !== "RESET") return;
        try {
            await api.post("/reset/attendance", { confirmation: "RESET" });
            setMessage("Attendance records, teacher logs, and flags cleared.");
            setResetAttConfirm("");
        } catch (err) {
            setMessage(err.response?.data?.message || "Reset failed");
        }
    };

    const handleResetEverything = async () => {
        if (resetAllConfirm !== "RESET") return;
        try {
            await api.post("/reset/everything", { confirmation: "RESET" });
            setMessage("All data cleared. Redirecting to admin setup...");
            localStorage.removeItem("adminToken");
            setTimeout(() => navigate("/admin"), 1500);
        } catch (err) {
            setMessage(err.response?.data?.message || "Reset failed");
        }
    };

    return (
        <div className="settings-tab">
            <h3>Settings</h3>
            {message && <p className="info">{message}</p>}

            <div className="reset-section">
                <h4>Reset Attendance Records Only</h4>
                <p className="warning">
                    This will permanently delete all attendance records, teacher
                    logs, and flags. Students and classes will be kept.
                    <strong> This cannot be undone.</strong>
                </p>
                <p>Please export your data first (Export tab) if needed.</p>
                <label>
                    Type <strong>RESET</strong> to confirm:
                </label>
                <input
                    value={resetAttConfirm}
                    onChange={e => setResetAttConfirm(e.target.value)}
                    placeholder="RESET"
                />
                <button
                    onClick={handleResetAttendance}
                    disabled={resetAttConfirm !== "RESET"}
                    className="btn-danger"
                >
                    Reset Attendance Data
                </button>
            </div>

            <div className="reset-section">
                <h4>Reset Everything</h4>
                <p className="warning">
                    This will permanently delete <strong>all data</strong> –
                    students, classes, attendance, logs, flags, and admin
                    account. You will be returned to the admin setup screen.
                    <strong> This cannot be undone.</strong>
                </p>
                <p>Please export your data first (Export tab).</p>
                <label>
                    Type <strong>RESET</strong> to confirm:
                </label>
                <input
                    value={resetAllConfirm}
                    onChange={e => setResetAllConfirm(e.target.value)}
                    placeholder="RESET"
                />
                <button
                    onClick={handleResetEverything}
                    disabled={resetAllConfirm !== "RESET"}
                    className="btn-danger"
                >
                    Reset Everything
                </button>
            </div>
        </div>
    );
}
