export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div
            className={`modal-overlay ${isOpen ? "show" : ""}`}
            onClick={onClose}
        >
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                <div
                    style={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        marginBottom: "10px"
                    }}
                >
                    {title}
                </div>
                {children}
            </div>
        </div>
    );
}
