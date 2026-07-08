const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        pinHash: {
            type: String,
            required: [true, "PIN hash is required"]
        },
        emergencyResetCodeHash: {
            type: String,
            required: [true, "Emergency reset code hash is required"]
        }
    },
    { timestamps: true }
);

// Ensure only one admin document exists (singleton)
adminSchema.index(
    {},
    { unique: true, partialFilterExpression: { _id: { $exists: true } } }
);

module.exports = mongoose.model("Admin", adminSchema);
