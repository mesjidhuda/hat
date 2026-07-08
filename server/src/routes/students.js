const express = require("express");
const Student = require("../models/Student");
const Class = require("../models/Class");
const AttendanceRecord = require("../models/AttendanceRecord");
const Flag = require("../models/Flag");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect);

// GET /api/students – list all students
router.get("/", async (req, res) => {
    try {
        const students = await Student.find().populate(
            "class",
            "name teacherName"
        );
        res.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/students – add single student
router.post("/", async (req, res) => {
    const { name, classId, parentPhone, enrollmentDate } = req.body;

    if (!name || !classId) {
        return res.status(400).json({ message: "Name and class are required" });
    }

    try {
        const classDoc = await Class.findById(classId);
        if (!classDoc) {
            return res.status(400).json({ message: "Invalid class" });
        }

        const student = await Student.create({
            name,
            class: classId,
            parentPhone: parentPhone || "",
            enrollmentDate: enrollmentDate || new Date()
        });

        const populated = await Student.findById(student._id).populate(
            "class",
            "name teacherName"
        );
        res.status(201).json(populated);
    } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/students/bulk – bulk import
router.post("/bulk", async (req, res) => {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ message: "No students provided" });
    }

    const errors = [];
    const validStudents = [];

    for (let i = 0; i < students.length; i++) {
        const s = students[i];
        if (!s.name || !s.classId) {
            errors.push({ row: i + 1, message: "Missing name or class" });
            continue;
        }
        try {
            const classDoc = await Class.findById(s.classId);
            if (!classDoc) {
                errors.push({ row: i + 1, message: "Class not found" });
                continue;
            }
            validStudents.push({
                name: s.name,
                class: s.classId,
                parentPhone: s.parentPhone || "",
                enrollmentDate: s.enrollmentDate || new Date()
            });
        } catch (err) {
            errors.push({ row: i + 1, message: "Invalid class ID" });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation errors", errors });
    }

    try {
        const created = await Student.insertMany(validStudents);
        const populated = await Student.find({
            _id: { $in: created.map(s => s._id) }
        }).populate("class", "name teacherName");
        res.status(201).json({
            imported: populated.length,
            students: populated
        });
    } catch (error) {
        console.error("Bulk import error:", error);
        res.status(500).json({ message: "Import failed" });
    }
});

// GET /api/students/:id/profile – MUST BE BEFORE PUT and DELETE
router.get("/:id/profile", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate(
            "class",
            "name teacherName"
        );
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

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
    } catch (error) {
        console.error("Student profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT /api/students/:id – update a student (including transfer)
router.put("/:id", async (req, res) => {
    const { name, classId, parentPhone, enrollmentDate } = req.body;

    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (name) student.name = name;

        if (classId) {
            const classDoc = await Class.findById(classId);
            if (!classDoc) {
                return res.status(400).json({ message: "Invalid class" });
            }
            student.class = classId;
        }

        if (parentPhone !== undefined) student.parentPhone = parentPhone;
        if (enrollmentDate) student.enrollmentDate = enrollmentDate;

        await student.save();

        const populated = await Student.findById(student._id).populate(
            "class",
            "name teacherName"
        );
        res.json(populated);
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE /api/students/:id – delete a student
router.delete("/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.json({ message: "Student deleted" });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
