import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "../components/Toast";

export default function SearchTab() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const debounceRef = useRef(null);

    // Real‑time search with debounce
    useEffect(() => {
        // Clear previous timer
        if (debounceRef.current) clearTimeout(debounceRef.current);

        // If query is empty, reset states and show initial placeholder
        if (!query.trim()) {
            setResults([]);
            setHasSearched(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);

        // Debounce 300ms
        debounceRef.current = setTimeout(async () => {
            try {
                const { data } = await api.get(
                    `/search/students?q=${encodeURIComponent(query.trim())}`
                );
                setResults(data);
                if (data.length === 0) {
                    // Only show toast if we actually typed something and got zero results
                    // (optional – you can remove the toast if it's annoying)
                    // toast.info("No students found");
                }
            } catch (err) {
                toast.error("Search failed");
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query]); // runs whenever query changes

    return (
        <div>
            {/* Title */}
            <div
                style={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "var(--text-primary)",
                    marginBottom: 15,
                    textAlign: "left"
                }}
            >
                Student Search
            </div>

            {/* Search Bar */}
            <div
                style={{
                    background: "var(--glass)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 16,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%"
                }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-secondary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder="Type a student's name..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-primary)",
                        width: "100%",
                        fontFamily: "inherit",
                        outline: "none",
                        fontSize: "0.95rem"
                    }}
                    autoFocus
                />
                {/* Optional clear button */}
                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setResults([]);
                            setHasSearched(false);
                        }}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-secondary)",
                            fontSize: "1.2rem",
                            cursor: "pointer",
                            padding: "0 8px"
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <p
                    style={{
                        textAlign: "center",
                        color: "var(--text-secondary)",
                        padding: 30
                    }}
                >
                    Searching…
                </p>
            )}

            {/* Results List */}
            {!loading && hasSearched && results.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <div
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                            marginBottom: 10,
                            textAlign: "left"
                        }}
                    >
                        {results.length} student
                        {results.length !== 1 ? "s" : ""} found
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2
                        }}
                    >
                        {results.map(student => (
                            <div
                                key={student._id}
                                onClick={() =>
                                    navigate(`/student/${student._id}`)
                                }
                                style={{
                                    padding: "14px 16px",
                                    borderBottom:
                                        "1px solid var(--glass-border)",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    textAlign: "left",
                                    transition: "background 0.2s",
                                    borderRadius: 12
                                }}
                                onMouseEnter={e =>
                                    (e.currentTarget.style.background =
                                        "var(--glass)")
                                }
                                onMouseLeave={e =>
                                    (e.currentTarget.style.background =
                                        "transparent")
                                }
                            >
                                <span
                                    style={{
                                        fontFamily: "Cairo, sans-serif",
                                        fontWeight: 600,
                                        fontSize: "0.95rem",
                                        color: "var(--accent)"
                                    }}
                                >
                                    {student.name}
                                </span>
                                <span
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "var(--text-secondary)",
                                        marginTop: 2
                                    }}
                                >
                                    {student.class?.name || "No class"}
                                </span>
                                {student.parentPhone && (
                                    <span
                                        style={{
                                            fontSize: "0.7rem",
                                            color: "var(--text-muted)",
                                            marginTop: 2
                                        }}
                                    >
                                        📞 {student.parentPhone}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Results */}
            {!loading && hasSearched && results.length === 0 && (
                <div
                    style={{
                        background: "var(--glass)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 20,
                        padding: "50px 20px",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 20
                    }}
                >
                    <div
                        style={{
                            width: 70,
                            height: 70,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--text-muted)"
                            strokeWidth="2"
                            style={{ width: 60, height: 60, opacity: 0.5 }}
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="8" y1="8" x2="16" y2="16" />
                            <line x1="16" y1="8" x2="8" y2="16" />
                        </svg>
                    </div>
                    <div
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "1rem",
                            marginTop: 20
                        }}
                    >
                        No students found
                    </div>
                    <div
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "0.8rem",
                            marginTop: 8
                        }}
                    >
                        Try a different name or check the spelling
                    </div>
                </div>
            )}

            {/* Initial Empty State (before any search) */}
            {!loading && !hasSearched && (
                <div
                    style={{
                        background: "var(--glass)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 20,
                        padding: "50px 20px",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 20
                    }}
                >
                    <div
                        style={{
                            width: 70,
                            height: 70,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--text-muted)"
                            strokeWidth="2"
                            style={{ width: 60, height: 60, opacity: 0.5 }}
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                    <div
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "1rem",
                            marginTop: 20
                        }}
                    >
                        Search for a student
                    </div>
                    <div
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "0.8rem",
                            marginTop: 8
                        }}
                    >
                        Type a name to see results
                    </div>
                </div>
            )}
        </div>
    );
}
