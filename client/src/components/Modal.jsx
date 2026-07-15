import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({ isOpen, onClose, title, children }) {
  const scrollY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      scrollY.current = window.scrollY;
      document.documentElement.classList.add("modal-open");
      document.body.classList.add("modal-open");
    } else {
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
      window.scrollTo(0, scrollY.current);
    }
    return () => {
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay show"
      onClick={onClose}
    >
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "10px" }}>
          {title}
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}