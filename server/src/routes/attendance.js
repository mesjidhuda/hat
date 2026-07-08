const express = require("express");
const AttendanceRecord = require("../models/AttendanceRecord");
const Flag = require("../models/Flag");
const TeacherLog = require("../models/TeacherLog");
const Student = require("../models/Student");
const { teacherAuth, verifyClassAccess } = require("../middleware/auth");
const router = express.Router();

// Apply teacher authentication + class verification to all routes under /:classId
router.use("/:classId", teacherAuth, verifyClassAccess);

// GET /api/attendance/:classId?date=YYYY-MM-DD (Gregorian)
router.get("/:classId", async (req, res) => {
    try {
        const { classId } = req.params;
        const { date } = req.query; // YYYY-MM-DD
        if (!date)
            return res.status(400).json({ message: "Date query required" });

        const queryDate = new Date(date);
        if (isNaN(queryDate.getTime())) {
            return res.status(400).json({ message: "Invalid date" });
        }

        // Fetch all students in this class
        const students = await Student.find({ class: classId }).sort({
            name: 1
        });

        // Fetch attendance records for this date
        const attendanceRecords = await AttendanceRecord.find({
            class: classId,
            date: queryDate
        });

        // Fetch all unresolved behavior flags for these students
        const studentIds = students.map(s => s._id);
        const unresolvedFlags = await Flag.find({
            student: { $in: studentIds },
            type: "Behavior",
            resolved: false
        });

        // Map data to student list
        const studentData = students.map(student => {
            const att = attendanceRecords.find(
                a => a.student.toString() === student._id.toString()
            );
            const flags = unresolvedFlags.filter(
                f => f.student.toString() === student._id.toString()
            );
            return {
                _id: student._id,
                name: student.name,
                attendance: att
                    ? {
                          status: att.status,
                          note: att.note,
                          isEdited: att.isEdited
                      }
                    : null,
                flags: flags.map(f => ({
                    _id: f._id,
                    reason: f.reason,
                    dateFlagged: f.dateFlagged
                }))
            };
        });

        res.json({ date, students: studentData });
    } catch (error) {
        console.error("Attendance GET error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/attendance/:classId – submit attendance
router.post("/:classId", async (req, res) => {
    try {
        const { classId } = req.params;
        const { date, records } = req.body; // records: [{studentId, status, note, flagReason?}]

        if (!date || !records || !Array.isArray(records)) {
            return res.status(400).json({ message: "Invalid payload" });
        }

        const sessionDate = new Date(date);
        if (isNaN(sessionDate.getTime())) {
            return res.status(400).json({ message: "Invalid date" });
        }

        // Validate all records have a valid status
        const validStatuses = ["Present", "Late", "Absent", "Excused"];
        for (const rec of records) {
            if (!rec.studentId || !validStatuses.includes(rec.status)) {
                return res.status(400).json({
                    message: `Invalid record for student ${rec.studentId || "unknown"}`
                });
            }
        }

        // Upsert attendance records
        const attendanceOps = records.map(async rec => {
            const existing = await AttendanceRecord.findOne({
                student: rec.studentId,
                class: classId,
                date: sessionDate
            });

            if (existing) {
                // Edit existing record
                existing.status = rec.status;
                existing.note = rec.note || "";
                existing.isEdited = true;
                existing.editTimestamp = new Date();
                return existing.save();
            } else {
                return AttendanceRecord.create({
                    student: rec.studentId,
                    class: classId,
                    date: sessionDate,
                    status: rec.status,
                    note: rec.note || "",
                    isEdited: false
                });
            }
        });

        await Promise.all(attendanceOps);

        // Handle manual flags from teacher
        const flagOps = records
            .filter(rec => rec.flagReason && rec.flagReason.trim())
            .map(async rec => {
                return Flag.create({
                    student: rec.studentId,
                    type: "Behavior",
                    reason: rec.flagReason.trim(),
                    dateFlagged: new Date()
                });
            });
        await Promise.all(flagOps);

        // Teacher log: create or update
        const logEntry = await TeacherLog.findOne({
            class: classId,
            sessionDate: sessionDate
        });
        if (logEntry) {
            logEntry.editTimestamp = new Date();
            await logEntry.save();
        } else {
            await TeacherLog.create({
                class: classId,
                sessionDate: sessionDate,
                submitTimestamp: new Date()
            });
        }

        // Auto-flagging: check for 3+ consecutive absences
        const allStudents = await Student.find({ class: classId });
        for (const student of allStudents) {
            const recentRecords = await AttendanceRecord.find({
                student: student._id,
                class: classId
            })
                .sort({ date: -1 })
                .limit(3);

            let consecutiveAbsences = 0;
            for (const rec of recentRecords) {
                if (rec.status === "Absent") {
                    consecutiveAbsences++;
                } else {
                    break;
                }
            }
            if (consecutiveAbsences >= 3) {
                const existingAutoFlag = await Flag.findOne({
                    student: student._id,
                    type: "Auto",
                    resolved: false
                });
                if (!existingAutoFlag) {
                    await Flag.create({
                        student: student._id,
                        type: "Auto",
                        reason: `${consecutiveAbsences} consecutive absences`,
                        dateFlagged: new Date()
                    });
                }
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Attendance POST error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
