import { useEffect, useRef } from "react";

export default function Modal({ isOpen, onClose, title, children }) {
    const scrollY = useRef(0);

    useEffect(() => {
        if (isOpen) {
            // Save the current scroll position
            scrollY.current = window.scrollY;

            // Lock the body in place
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY.current}px`;
            document.body.style.width = "100%";

            // Prevent touch‑move on the body so it never scrolls
            const preventTouch = e => e.preventDefault();
            document.addEventListener("touchmove", preventTouch, {
                passive: false
            });

            return () => {
                document.removeEventListener("touchmove", preventTouch);
            };
        } else {
            // Unlock the body and restore scroll position
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            window.scrollTo(0, scrollY.current);
        }
    }, [isOpen]);

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
