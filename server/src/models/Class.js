const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Class name is required"],
            unique: true,
            trim: true
        },
        teacherName: {
            type: String,
            required: [true, "Teacher name is required"],
            trim: true
        },
        pinHash: {
            type: String,
            required: [true, "Class PIN hash is required"]
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
