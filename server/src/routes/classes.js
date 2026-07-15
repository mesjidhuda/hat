const express = require("express");
const bcrypt = require("bcryptjs");
const Class = require("../models/Class");
const { protect } = require("../middleware/auth");
const router = express.Router();

// GET /api/classes – public (no auth) – only name, teacherName, gender, _id
router.get("/", async (req, res) => {
    try {
        const classes = await Class.find().select("-pinHash -pinPlain");
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// All routes below require admin authentication
router.use(protect);

// POST /api/classes – create a new class
router.post("/", async (req, res) => {
    const { name, teacherName, pin, gender } = req.body;          // ← added gender
    if (!name || !teacherName || !pin || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({
            message: "Class name, teacher name, and a 4‑digit PIN are required"
        });
    }
    try {
        const salt = await bcrypt.genSalt(12);
        const pinHash = await bcrypt.hash(pin, salt);
        const newClass = await Class.create({
            name,
            teacherName,
            gender: gender || null,        // ← save gender (or null)
            pinHash,
            pinPlain: pin
        });
        res.status(201).json({
            _id: newClass._id,
            name: newClass.name,
            teacherName: newClass.teacherName,
            gender: newClass.gender
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Class name already exists" });
        }
        res.status(500).json({ message: "Server error" });
    }
});

// PUT /api/classes/:id – update class
router.put("/:id", async (req, res) => {
    const { name, teacherName, pin, gender } = req.body;          // ← added gender
    try {
        const classDoc = await Class.findById(req.params.id);
        if (!classDoc)
            return res.status(404).json({ message: "Class not found" });

        if (name) classDoc.name = name;
        if (teacherName) classDoc.teacherName = teacherName;
        if (gender !== undefined) classDoc.gender = gender || null;   // ← save gender
        if (pin) {
            if (!/^\d{4}$/.test(pin)) {
                return res.status(400).json({ message: "PIN must be exactly 4 digits" });
            }
            const salt = await bcrypt.genSalt(12);
            classDoc.pinHash = await bcrypt.hash(pin, salt);
            classDoc.pinPlain = pin;
        }
        await classDoc.save();
        res.json({
            _id: classDoc._id,
            name: classDoc.name,
            teacherName: classDoc.teacherName,
            gender: classDoc.gender
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Class name already exists" });
        }
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/classes/:id/pin – reveal PIN (admin only)
router.get("/:id/pin", async (req, res) => {
    try {
        const classDoc = await Class.findById(req.params.id);
        if (!classDoc)
            return res.status(404).json({ message: "Class not found" });

        if (!classDoc.pinPlain) {
            return res.status(400).json({
                message: "PIN not available. Please edit this class and set the PIN again to enable viewing."
            });
        }

        res.json({ pin: classDoc.pinPlain });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE /api/classes/:id
router.delete("/:id", async (req, res) => {
    try {
        const classDoc = await Class.findByIdAndDelete(req.params.id);
        if (!classDoc)
            return res.status(404).json({ message: "Class not found" });
        res.json({ message: "Class deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;