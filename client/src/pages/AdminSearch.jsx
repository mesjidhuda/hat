import { useState } from "react";
import api from "../utils/api";

export default function AdminSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setProfile(null);
        try {
            const { data } = await api.get(
                `/search/students?q=${encodeURIComponent(query)}`
            );
            setResults(data);
        } catch (err) {
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async id => {
        setLoading(true);
        try {
            const { data } = await api.get(`/students/${id}/profile`);
            setProfile(data);
        } catch (err) {
            alert("Could not load profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search-tab">
            <h3>Search Students</h3>
            <div className="search-bar">
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Student name..."
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
                <button onClick={handleSearch} className="btn-primary">
                    Search
                </button>
            </div>

            {loading && <p>Loading...</p>}

            {results.length > 0 && !profile && (
                <ul className="search-results">
                    {results.map(s => (
                        <li key={s._id} onClick={() => fetchProfile(s._id)}>
                            <strong>{s.name}</strong> – {s.class?.name}
                        </li>
                    ))}
                </ul>
            )}

            {profile && (
                <div className="student-profile">
                    <button
                        onClick={() => setProfile(null)}
                        className="btn-secondary"
                    >
                        Back to results
                    </button>
                    <h4>{profile.student.name}</h4>
                    <p>Class: {profile.student.class}</p>
                    <p>Phone: {profile.student.parentPhone}</p>
                    <p>
                        Enrolled:{" "}
                        {new Date(
                            profile.student.enrollmentDate
                        ).toLocaleDateString()}
                    </p>

                    <h5>Attendance Records</h5>
                    {profile.attendance.length === 0 ? (
                        <p>No records</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Note</th>
                                    <th>Edited</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profile.attendance.map(rec => (
                                    <tr key={rec._id}>
                                        <td>
                                            {new Date(
                                                rec.date
                                            ).toLocaleDateString()}
                                        </td>
                                        <td>{rec.status}</td>
                                        <td>{rec.note}</td>
                                        <td>{rec.isEdited ? "Yes" : "No"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <h5>Flags</h5>
                    {profile.flags.length === 0 ? (
                        <p>No flags</p>
                    ) : (
                        <ul>
                            {profile.flags.map(flag => (
                                <li key={flag._id}>
                                    <strong>{flag.type}</strong> – {flag.reason}{" "}
                                    (Flagged:{" "}
                                    {new Date(
                                        flag.dateFlagged
                                    ).toLocaleDateString()}
                                    )
                                    {flag.resolved
                                        ? " – Resolved"
                                        : " – Active"}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
