const express = require("express");
const Student = require("../models/Student");
const AttendanceRecord = require("../models/AttendanceRecord");
const Flag = require("../models/Flag");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect);

// GET /api/search/students?q=
router.get("/students", async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length === 0) return res.json([]);
    try {
        const regex = new RegExp(q.trim(), "i");
        const students = await Student.find({ name: regex })
            .populate("class", "name")
            .limit(20);
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/students/:id/profile
router.get("/students/:id/profile", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate(
            "class",
            "name"
        );
        if (!student)
            return res.status(404).json({ message: "Student not found" });

        const attendance = await AttendanceRecord.find({
            student: req.params.id
        }).sort({ date: -1 });
        const flags = await Flag.find({ student: req.params.id }).sort({
            dateFlagged: -1
        });

        res.json({
            student: {
                _id: student._id,
                name: student.name,
                class: student.class?.name || "Unknown",
                parentPhone: student.parentPhone,
                enrollmentDate: student.enrollmentDate
            },
            attendance,
            flags
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
