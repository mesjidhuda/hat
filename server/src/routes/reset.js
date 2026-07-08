const express = require("express");
const AttendanceRecord = require("../models/AttendanceRecord");
const TeacherLog = require("../models/TeacherLog");
const Flag = require("../models/Flag");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Class = require("../models/Class");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect);

// Reset attendance, teacher log, flags only
router.post("/attendance", async (req, res) => {
    const { confirmation } = req.body;
    if (confirmation !== "RESET") {
        return res.status(400).json({ message: "Type RESET to confirm" });
    }
    try {
        await AttendanceRecord.deleteMany({});
        await TeacherLog.deleteMany({});
        await Flag.deleteMany({});
        res.json({
            message: "Attendance records, teacher logs, and flags cleared."
        });
    } catch (err) {
        res.status(500).json({ message: "Reset failed" });
    }
});

// Reset everything
router.post("/everything", async (req, res) => {
    const { confirmation } = req.body;
    if (confirmation !== "RESET") {
        return res.status(400).json({ message: "Type RESET to confirm" });
    }
    try {
        await AttendanceRecord.deleteMany({});
        await TeacherLog.deleteMany({});
        await Flag.deleteMany({});
        await Student.deleteMany({});
        await Class.deleteMany({});
        await Admin.deleteMany({});
        res.json({
            message: "All data cleared. Admin setup required on next visit."
        });
    } catch (err) {
        res.status(500).json({ message: "Reset failed" });
    }
});

module.exports = router;
