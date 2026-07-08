const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Student name is required"],
            trim: true
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: [true, "Class is required"]
        },
        parentPhone: {
            type: String,
            trim: true,
            default: ""
        },
        enrollmentDate: {
            type: Date,
            required: [true, "Enrollment date is required"],
            default: Date.now
        }
    },
    { timestamps: true }
);

// Index for faster lookup by class
studentSchema.index({ class: 1 });

module.exports = mongoose.model("Student", studentSchema);
