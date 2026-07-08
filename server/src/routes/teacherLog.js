const express = require("express");
const TeacherLog = require("../models/TeacherLog");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect);

// GET /api/teacher-log – all logs, populate class with name and teacherName
router.get("/", async (req, res) => {
    try {
        const logs = await TeacherLog.find()
            .populate("class", "name teacherName") // ← added teacherName
            .sort({ sessionDate: -1, submitTimestamp: -1 });
        res.json(logs);
    } catch (error) {
        console.error("Teacher log error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
