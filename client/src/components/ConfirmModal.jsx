import Modal from "./Modal";

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title || "Confirm Action"}
        >
            <p
                style={{
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    fontSize: "0.95rem"
                }}
            >
                {message || "Are you sure?"}
            </p>
            <div className="modal-actions">
                <button className="modal-cancel" onClick={onClose}>
                    Cancel
                </button>
                <button
                    className="modal-confirm"
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    style={{ background: "#f44336" }}
                >
                    Delete
                </button>
            </div>
        </Modal>
    );
}
