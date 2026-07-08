import { useState, useEffect, useCallback } from "react";

const listeners = [];
const emit = (msg, type) => listeners.forEach(fn => fn(msg, type));

export const toast = {
    show(msg, type = "info") {
        emit(msg, type);
    },
    success(msg) {
        this.show(msg, "success");
    },
    error(msg) {
        this.show(msg, "error");
    },
    info(msg) {
        this.show(msg, "info");
    },
    onChange(fn) {
        listeners.push(fn);
        return () => listeners.splice(listeners.indexOf(fn), 1);
    }
};

export function ToastProvider({ children }) {
    const [message, setMessage] = useState("");
    const [type, setType] = useState("info");
    const [visible, setVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const showToast = useCallback(
        (msg, t) => {
            setMessage(msg);
            setType(t);
            setVisible(true);
            if (timeoutId) clearTimeout(timeoutId);
            const id = setTimeout(() => setVisible(false), 3000);
            setTimeoutId(id);
        },
        [timeoutId]
    );

    useEffect(() => {
        const unsub = toast.onChange(showToast);
        return unsub;
    }, [showToast]);

    return (
        <>
            {children}
            <div className={`toast-container ${type} ${visible ? "show" : ""}`}>
                {message}
            </div>
        </>
    );
}

export default function Toast() {
    return null;
}
