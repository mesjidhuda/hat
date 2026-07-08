const MONTHS_AMHARIC = [
    "Meskerem",
    "Tikimt",
    "Hidar",
    "Tahisas",
    "Tir",
    "Yekatit",
    "Megabit",
    "Miazia",
    "Ginbot",
    "Sene",
    "Hamle",
    "Nehase",
    "Pagume"
];

const JD_EPOCH = 1724220.5; // Meskerem 1, year 0

// Julian Day Number from Gregorian date
function gregorianToJDN(date) {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    const a = Math.floor((14 - m) / 12);
    const y2 = y + 4800 - a;
    const m2 = m + 12 * a - 3;
    return (
        d +
        Math.floor((153 * m2 + 2) / 5) +
        365 * y2 +
        Math.floor(y2 / 4) -
        Math.floor(y2 / 100) +
        Math.floor(y2 / 400) -
        32045 -
        0.5
    );
}

// Ethiopian start of year (Julian Day) for a given Ethiopian year
function ethiopianNewYearJD(year) {
    return JD_EPOCH + 365 * (year - 1) + Math.floor(year / 4);
}

// Convert Gregorian Date → Ethiopian {year, month, day}
function gregorianToEthiopian(date) {
    const jdn = gregorianToJDN(date);

    // Approximate year
    let year = Math.floor((jdn - JD_EPOCH) / 365.25) + 1;
    while (ethiopianNewYearJD(year) > jdn) year--;
    while (ethiopianNewYearJD(year + 1) <= jdn) year++;

    const dayOfYear = jdn - ethiopianNewYearJD(year) + 1; // 1‑based
    let month, day;

    if (dayOfYear <= 360) {
        month = Math.ceil(dayOfYear / 30);
        day = dayOfYear - (month - 1) * 30;
    } else {
        month = 13;
        day = dayOfYear - 360;
    }

    return { year, month, day };
}

// Ethiopian date → Gregorian Date
function ethiopianToGregorian(year, month, day) {
    const daysFromEpoch =
        365 * (year - 1) + Math.floor(year / 4) + (month - 1) * 30 + (day - 1);
    const jdn = JD_EPOCH + daysFromEpoch;

    // Convert JDN to Gregorian
    const Z = Math.floor(jdn + 0.5);
    const A = Z + 32044;
    const B = Math.floor((4 * A + 3) / 146097);
    const C = A - Math.floor((146097 * B) / 4);
    const D = Math.floor((4 * C + 3) / 1461);
    const E = C - Math.floor((1461 * D) / 4);
    const M = Math.floor((5 * E + 2) / 153);
    const gregDay = E - Math.floor((153 * M + 2) / 5) + 1;
    const gregMonth = M + 3 - 12 * Math.floor(M / 10);
    const gregYear = 100 * B + D - 4800 + Math.floor(M / 10);

    return new Date(Date.UTC(gregYear, gregMonth - 1, gregDay));
}

// Today's Ethiopian date
function getTodayEthiopian() {
    const today = new Date();
    const { year, month, day } = gregorianToEthiopian(today);
    return { year, month, day, monthName: MONTHS_AMHARIC[month - 1] };
}

// Format as "Sene 30, 2018"
function formatEthiopianDate({ month, day, year }) {
    return `${MONTHS_AMHARIC[month - 1]} ${day}, ${year}`;
}

// Next day
function nextDay(year, month, day) {
    const pagumeDays = year % 4 === 3 ? 6 : 5;
    if (month === 13 && day === pagumeDays)
        return { year: year + 1, month: 1, day: 1 };
    if ((month <= 12 && day === 30) || (month === 13 && day < pagumeDays))
        return { year, month: month + 1, day: 1 };
    if (month === 13 && day < pagumeDays) return { year, month, day: day + 1 };
    return { year, month, day: day + 1 };
}

// Previous day
function prevDay(year, month, day) {
    if (month === 1 && day === 1) {
        const prevYear = year - 1;
        const pagumeDays = prevYear % 4 === 3 ? 6 : 5;
        return { year: prevYear, month: 13, day: pagumeDays };
    }
    if (day === 1) {
        const prevMonth = month - 1;
        const daysInPrevMonth =
            prevMonth === 13 ? (year % 4 === 3 ? 6 : 5) : 30;
        return { year, month: prevMonth, day: daysInPrevMonth };
    }
    return { year, month, day: day - 1 };
}

module.exports = {
    gregorianToEthiopian,
    ethiopianToGregorian,
    getTodayEthiopian,
    formatEthiopianDate,
    nextDay,
    prevDay,
    MONTHS_AMHARIC
};
