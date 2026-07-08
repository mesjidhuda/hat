const mongoose = require("mongoose");

const appConfigSchema = new mongoose.Schema(
    {
        pinHash: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

// Ensure only one document exists
appConfigSchema.index(
    {},
    { unique: true, partialFilterExpression: { _id: { $exists: true } } }
);

module.exports = mongoose.model("AppConfig", appConfigSchema);
