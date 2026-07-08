const mongoose = require("mongoose");

const flagSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
        type: {
            type: String,
            enum: ["Auto", "Behavior"],
            required: true
        },
        reason: {
            type: String,
            required: [true, "Reason is required for a flag"]
        },
        dateFlagged: {
            type: Date,
            required: true,
            default: Date.now
        },
        resolved: {
            type: Boolean,
            default: false
        },
        resolvedDate: {
            type: Date
        }
    },
    { timestamps: true }
);

flagSchema.index({ student: 1 });
flagSchema.index({ resolved: 1 });

module.exports = mongoose.model("Flag", flagSchema);
