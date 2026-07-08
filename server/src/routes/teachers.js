const express = require("express");
const Class = require("../models/Class");
const Student = require("../models/Student");
const AttendanceRecord = require("../models/AttendanceRecord");
const TeacherLog = require("../models/TeacherLog");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect);

// GET /api/teachers/:classId/profile – teacher profile by class ID
router.get("/:classId/profile", async (req, res) => {
    try {
        const classDoc = await Class.findById(req.params.classId);
        if (!classDoc) {
            return res.status(404).json({ message: "Class not found" });
        }

        // Get all students in this class
        const students = await Student.find({ class: req.params.classId });
        const studentIds = students.map(s => s._id);

        // Get all attendance records for these students
        const attendanceRecords = await AttendanceRecord.find({
            student: { $in: studentIds }
        }).sort({ date: -1 });

        // Get teacher logs for this class
        const teacherLogs = await TeacherLog.find({
            class: req.params.classId
        }).sort({ sessionDate: -1 });

        // Calculate stats
        const totalRecords = attendanceRecords.length;
        const statusCounts = { Present: 0, Late: 0, Absent: 0, Excused: 0 };
        attendanceRecords.forEach(r => statusCounts[r.status]++);

        // Attendance rate
        const attendanceRate =
            totalRecords > 0
                ? (
                      ((statusCounts.Present + statusCounts.Late) /
                          totalRecords) *
                      100
                  ).toFixed(1)
                : "0.0";

        // Monthly trends (last 6 months)
        const monthlyTrends = {};
        attendanceRecords.forEach(r => {
            const month = r.date.toISOString().slice(0, 7); // YYYY-MM
            if (!monthlyTrends[month]) {
                monthlyTrends[month] = { total: 0, present: 0 };
            }
            monthlyTrends[month].total++;
            if (r.status === "Present" || r.status === "Late") {
                monthlyTrends[month].present++;
            }
        });

        const trendsArray = Object.entries(monthlyTrends)
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 6)
            .map(([month, data]) => ({
                month,
                rate:
                    data.total > 0
                        ? ((data.present / data.total) * 100).toFixed(1)
                        : "0.0",
                total: data.total
            }))
            .reverse();

        // Per-student stats
        const studentStats = students.map(student => {
            const studentRecords = attendanceRecords.filter(
                r => r.student.toString() === student._id.toString()
            );
            const counts = { Present: 0, Late: 0, Absent: 0, Excused: 0 };
            studentRecords.forEach(r => counts[r.status]++);
            const rate =
                studentRecords.length > 0
                    ? (
                          ((counts.Present + counts.Late) /
                              studentRecords.length) *
                          100
                      ).toFixed(1)
                    : "0.0";
            return {
                _id: student._id,
                name: student.name,
                parentPhone: student.parentPhone,
                enrollmentDate: student.enrollmentDate,
                totalRecords: studentRecords.length,
                ...counts,
                attendanceRate: rate
            };
        });

        // Recent sessions
        const recentSessions = teacherLogs.slice(0, 10).map(log => ({
            _id: log._id,
            sessionDate: log.sessionDate,
            submitTimestamp: log.submitTimestamp,
            editTimestamp: log.editTimestamp
        }));

        res.json({
            teacher: {
                name: classDoc.teacherName,
                className: classDoc.name,
                classId: classDoc._id
            },
            stats: {
                totalStudents: students.length,
                totalRecords,
                ...statusCounts,
                attendanceRate
            },
            monthlyTrends: trendsArray,
            students: studentStats,
            recentSessions
        });
    } catch (error) {
        console.error("Teacher profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
