import { useState, useEffect } from "react";
import api from "../utils/api";

export default function AdminTeacherLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data } = await api.get("/teacher-log");
                setLogs(data);
            } catch (err) {
                // ignore
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) return <p>Loading teacher log…</p>;

    return (
        <div className="teacher-log">
            <h3>Teacher Session Log</h3>
            <table>
                <thead>
                    <tr>
                        <th>Class</th>
                        <th>Session Date</th>
                        <th>Submit Time</th>
                        <th>Edit Time</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log._id}>
                            <td>{log.class?.name || "Unknown"}</td>
                            <td>
                                {new Date(log.sessionDate).toLocaleDateString()}
                            </td>
                            <td>
                                {new Date(log.submitTimestamp).toLocaleString()}
                            </td>
                            <td>
                                {log.editTimestamp
                                    ? new Date(
                                          log.editTimestamp
                                      ).toLocaleString()
                                    : "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
