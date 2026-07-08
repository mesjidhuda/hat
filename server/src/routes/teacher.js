const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Class = require("../models/Class");
const router = express.Router();

// POST /api/teacher/verify – verify class PIN and return class-scoped teacher token
router.post("/verify", async (req, res) => {
    const { classId, pin } = req.body;
    if (!classId || !pin || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ message: "Invalid request" });
    }

    try {
        const classDoc = await Class.findById(classId);
        if (!classDoc) {
            return res.status(401).json({ message: "Invalid PIN" });
        }

        const isMatch = await bcrypt.compare(pin, classDoc.pinHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid PIN" });
        }

        // Generate a short-lived token that binds to this class
        const token = jwt.sign(
            { role: "teacher", classId: classDoc._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "2h" } // enough for a session
        );

        res.json({
            token,
            class: {
                id: classDoc._id,
                name: classDoc.name,
                teacherName: classDoc.teacherName
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
