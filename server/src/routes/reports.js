const express = require("express");
const AttendanceRecord = require("../models/AttendanceRecord");
const Student = require("../models/Student");
const Class = require("../models/Class");
const TeacherLog = require("../models/TeacherLog");
const { protect } = require("../middleware/auth");
const { ethiopianToGregorian } = require("../utils/ethiopianCalendar");
const router = express.Router();

router.use(protect);

// Helper: get class list with student counts
const getClassMap = async () => {
    const classes = await Class.find();
    const map = {};
    classes.forEach(c => {
        map[c._id.toString()] = c.name;
    });
    return map;
};

// Daily report
router.get("/daily", async (req, res) => {
    try {
        const { date } = req.query; // Gregorian YYYY-MM-DD
        if (!date) return res.status(400).json({ message: "Date required" });
        const queryDate = new Date(date);
        if (isNaN(queryDate.getTime()))
            return res.status(400).json({ message: "Invalid date" });

        const records = await AttendanceRecord.find({ date: queryDate })
            .populate("student", "name class")
            .populate("class");

        const classMap = await getClassMap();
        const classes = await Class.find();
        const classSummaries = {};

        classes.forEach(cls => {
            classSummaries[cls._id] = {
                className: cls.name,
                present: 0,
                late: 0,
                absent: 0,
                excused: 0,
                students: []
            };
        });

        records.forEach(rec => {
            const clsId =
                rec.class?._id?.toString() || rec.student?.class?.toString();
            if (!classSummaries[clsId]) return;
            const summary = classSummaries[clsId];
            summary[rec.status.toLowerCase()]++;
            summary.students.push({
                studentName: rec.student?.name,
                status: rec.status,
                note: rec.note || ""
            });
        });

        // Include classes with no records (0 students)
        const result = Object.values(classSummaries).map(cls => ({
            ...cls,
            total: cls.present + cls.late + cls.absent + cls.excused
        }));

        res.json({ date, classes: result });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Weekly report
router.get("/weekly", async (req, res) => {
    try {
        const { start, end } = req.query; // Gregorian YYYY-MM-DD
        if (!start || !end)
            return res
                .status(400)
                .json({ message: "Start and end dates required" });
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate) || isNaN(endDate))
            return res.status(400).json({ message: "Invalid dates" });

        const classes = await Class.find();
        const students = await Student.find().populate("class", "name");
        const records = await AttendanceRecord.find({
            date: { $gte: startDate, $lte: endDate }
        }).populate("student", "name class parentPhone");

        const classMap = {};
        classes.forEach(c => {
            classMap[c._id.toString()] = c.name;
        });

        // Build per-class attendance rates
        const classStats = {};
        const overall = {
            totalRecords: 0,
            present: 0,
            late: 0,
            absent: 0,
            excused: 0
        };
        const absentStudents = [];

        records.forEach(rec => {
            const clsId =
                rec.student?.class?.toString() || rec.class?.toString();
            if (!classStats[clsId]) {
                classStats[clsId] = {
                    className: classMap[clsId] || "Unknown",
                    total: 0,
                    present: 0,
                    late: 0,
                    absent: 0,
                    excused: 0,
                    students: []
                };
            }
            classStats[clsId].total++;
            classStats[clsId][rec.status.toLowerCase()]++;
            overall.totalRecords++;
            overall[rec.status.toLowerCase()]++;

            if (rec.status === "Absent") {
                absentStudents.push({
                    studentName: rec.student?.name,
                    parentPhone: rec.student?.parentPhone || "",
                    class: classMap[clsId]
                });
            }
        });

        // Attendance rate per class
        const perClassRate = Object.values(classStats).map(cls => ({
            ...cls,
            attendanceRate: cls.total
                ? (((cls.present + cls.late) / cls.total) * 100).toFixed(1)
                : "0.0"
        }));

        const overallRate = overall.totalRecords
            ? (
                  ((overall.present + overall.late) / overall.totalRecords) *
                  100
              ).toFixed(1)
            : "0.0";

        // Determine which classes submitted all sessions
        const teacherLogs = await TeacherLog.find({
            sessionDate: { $gte: startDate, $lte: endDate }
        });
        const submittedClassIds = teacherLogs.map(log => log.class.toString());
        const classSubmissionStatus = classes.map(cls => ({
            className: cls.name,
            submittedAllSessions: submittedClassIds.includes(cls._id.toString())
        }));

        // Per-student breakdown
        const studentBreakdown = [];
        for (const student of students) {
            const studentRecords = records.filter(
                r => r.student?._id?.toString() === student._id.toString()
            );
            const summary = { present: 0, late: 0, absent: 0, excused: 0 };
            studentRecords.forEach(r => summary[r.status.toLowerCase()]++);
            studentBreakdown.push({
                studentName: student.name,
                class: student.class?.name || "Unknown",
                ...summary,
                total: studentRecords.length
            });
        }

        res.json({
            start,
            end,
            perClassRate,
            overallRate,
            absentStudents,
            classSubmissionStatus,
            studentBreakdown
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Monthly report (Ethiopian year/month)
router.get("/monthly", async (req, res) => {
    try {
        const { ethiopianYear, ethiopianMonth } = req.query;
        if (!ethiopianYear || !ethiopianMonth) {
            return res
                .status(400)
                .json({ message: "Ethiopian year and month required" });
        }
        const year = parseInt(ethiopianYear);
        const month = parseInt(ethiopianMonth);
        if (isNaN(year) || isNaN(month) || month < 1 || month > 13) {
            return res.status(400).json({ message: "Invalid Ethiopian month" });
        }

        // Convert Ethiopian month to Gregorian date range
        const startGreg = ethiopianToGregorian(year, month, 1);
        let endGreg;
        if (month === 13) {
            const pagumeDays = year % 4 === 3 ? 6 : 5;
            endGreg = ethiopianToGregorian(year, month, pagumeDays);
        } else {
            endGreg = ethiopianToGregorian(year, month, 30);
        }

        // For trend vs previous month, compute previous month range
        let prevStartGreg, prevEndGreg;
        if (month === 1) {
            prevStartGreg = ethiopianToGregorian(year - 1, 13, 1);
            const prevPagume = (year - 1) % 4 === 3 ? 6 : 5;
            prevEndGreg = ethiopianToGregorian(year - 1, 13, prevPagume);
        } else {
            const prevMonth = month - 1;
            prevStartGreg = ethiopianToGregorian(year, prevMonth, 1);
            prevEndGreg = ethiopianToGregorian(
                year,
                prevMonth,
                prevMonth === 13 ? (year % 4 === 3 ? 6 : 5) : 30
            );
        }

        const records = await AttendanceRecord.find({
            date: { $gte: startGreg, $lte: endGreg }
        }).populate("student", "name class");

        const prevRecords = await AttendanceRecord.find({
            date: { $gte: prevStartGreg, $lte: prevEndGreg }
        });

        // Per-class rate
        const classes = await Class.find();
        const classMap = {};
        classes.forEach(c => {
            classMap[c._id.toString()] = c.name;
        });

        const classStats = {};
        records.forEach(rec => {
            const clsId =
                rec.student?.class?.toString() || rec.class?.toString();
            if (!classStats[clsId]) {
                classStats[clsId] = {
                    className: classMap[clsId] || "Unknown",
                    present: 0,
                    late: 0,
                    absent: 0,
                    excused: 0,
                    total: 0
                };
            }
            classStats[clsId].total++;
            classStats[clsId][rec.status.toLowerCase()]++;
        });

        const perClassRate = Object.values(classStats).map(cls => ({
            ...cls,
            attendanceRate: cls.total
                ? (((cls.present + cls.late) / cls.total) * 100).toFixed(1)
                : "0.0"
        }));

        // Overall rate current month
        const overallCurrent = { total: 0, present: 0, late: 0 };
        records.forEach(r => {
            overallCurrent.total++;
            if (r.status === "Present" || r.status === "Late")
                overallCurrent.present++;
        });
        const currentRate = overallCurrent.total
            ? (
                  ((overallCurrent.present + (overallCurrent.late || 0)) /
                      overallCurrent.total) *
                  100
              ).toFixed(1)
            : "0.0";

        // Previous month overall rate
        const overallPrev = { total: 0, present: 0, late: 0 };
        prevRecords.forEach(r => {
            overallPrev.total++;
            if (r.status === "Present" || r.status === "Late")
                overallPrev.present++;
        });
        const prevRate = overallPrev.total
            ? (
                  ((overallPrev.present + (overallPrev.late || 0)) /
                      overallPrev.total) *
                  100
              ).toFixed(1)
            : "0.0";

        // Per-student breakdown + ranking most absences
        const students = await Student.find();
        const studentStats = {};
        students.forEach(s => {
            studentStats[s._id.toString()] = {
                name: s.name,
                class: classMap[s.class?.toString()],
                absent: 0,
                total: 0
            };
        });
        records.forEach(r => {
            const sid = r.student?._id?.toString();
            if (studentStats[sid]) {
                studentStats[sid].total++;
                if (r.status === "Absent") studentStats[sid].absent++;
            }
        });
        const studentBreakdown = Object.values(studentStats).filter(
            s => s.total > 0
        );
        const rankedAbsences = studentBreakdown.sort(
            (a, b) => b.absent - a.absent
        );

        res.json({
            ethiopianYear: year,
            ethiopianMonth: month,
            perClassRate,
            overallCurrentRate: currentRate,
            overallPrevRate: prevRate,
            studentBreakdown,
            rankedAbsences
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
