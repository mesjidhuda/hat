const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["Present", "Late", "Absent", "Excused"],
            required: true
        },
        note: {
            type: String,
            default: ""
        },
        isEdited: {
            type: Boolean,
            default: false
        },
        editTimestamp: {
            type: Date
        }
    },
    { timestamps: true }
);

// A student can have only one attendance record per date
attendanceRecordSchema.index({ student: 1, date: 1 }, { unique: true });
// Optimise queries by class and date
attendanceRecordSchema.index({ class: 1, date: 1 });

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema);
