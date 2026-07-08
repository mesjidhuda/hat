export default function NumericKeypad({ value, onChange, maxLength = 4 }) {
    const handlePress = digit => {
        if (value.length < maxLength) {
            onChange(value + digit.toString());
        }
    };

    const handleBackspace = () => {
        onChange(value.slice(0, -1));
    };

    const handleClear = () => {
        onChange("");
    };

    return (
        <div className="keypad">
            <div className="keypad-display">{value.padEnd(4, "•")}</div>
            <div className="keypad-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                    <button
                        key={d}
                        onClick={() => handlePress(d)}
                        aria-label={`Digit ${d}`}
                    >
                        {d}
                    </button>
                ))}
                <button onClick={handleClear} aria-label="Clear">
                    C
                </button>
                <button onClick={() => handlePress(0)} aria-label="Digit 0">
                    0
                </button>
                <button onClick={handleBackspace} aria-label="Backspace">
                    ⌫
                </button>
            </div>
        </div>
    );
}
