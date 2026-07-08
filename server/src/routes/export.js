const express = require("express");
const Student = require("../models/Student");
const Class = require("../models/Class");
const AttendanceRecord = require("../models/AttendanceRecord");
const TeacherLog = require("../models/TeacherLog");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect);

router.get("/students", async (req, res) => {
    const students = await Student.find().populate("class", "name");
    const data = students.map(s => ({
        Name: s.name,
        Class: s.class?.name || "",
        "Parent Phone": s.parentPhone,
        "Enrollment Date": s.enrollmentDate?.toISOString().split("T")[0] || ""
    }));
    res.json(data);
});

router.get("/classes", async (req, res) => {
    const classes = await Class.find();
    res.json(
        classes.map(c => ({
            "Class Name": c.name,
            "Teacher Name": c.teacherName
        }))
    );
});

router.get("/attendance", async (req, res) => {
    const records = await AttendanceRecord.find()
        .populate("student", "name")
        .populate("class", "name");
    res.json(
        records.map(r => ({
            "Student Name": r.student?.name || "",
            Class: r.class?.name || "",
            Date: r.date.toISOString().split("T")[0],
            Status: r.status,
            Note: r.note,
            Edited: r.isEdited ? "Yes" : "No"
        }))
    );
});

router.get("/teacher-log", async (req, res) => {
    const logs = await TeacherLog.find().populate("class", "name");
    res.json(
        logs.map(l => ({
            Class: l.class?.name || "",
            "Session Date": l.sessionDate.toISOString().split("T")[0],
            "Submit Time": l.submitTimestamp?.toISOString(),
            "Edit Time": l.editTimestamp?.toISOString() || ""
        }))
    );
});

module.exports = router;
