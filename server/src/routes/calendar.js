const express = require("express");
const {
    getTodayEthiopian,
    formatEthiopianDate
} = require("../utils/ethiopianCalendar");
const router = express.Router();

// GET /api/calendar/today
router.get("/today", (req, res) => {
    const today = getTodayEthiopian();
    res.json({
        year: today.year,
        month: today.month,
        day: today.day,
        monthName: today.monthName,
        formatted: formatEthiopianDate(today)
    });
});

module.exports = router;
