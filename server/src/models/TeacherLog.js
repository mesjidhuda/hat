const mongoose = require("mongoose");

const teacherLogSchema = new mongoose.Schema(
    {
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },
        sessionDate: {
            type: Date,
            required: true
        },
        submitTimestamp: {
            type: Date,
            required: true,
            default: Date.now
        },
        editTimestamp: {
            type: Date
        }
    },
    { timestamps: true }
);

// Only one log entry per class per session date
teacherLogSchema.index({ class: 1, sessionDate: 1 }, { unique: true });

module.exports = mongoose.model("TeacherLog", teacherLogSchema);
