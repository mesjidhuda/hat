const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/admin/status – check if admin account exists
router.get("/status", async (req, res) => {
    try {
        const admin = await Admin.findOne();
        res.json({ setupRequired: !admin });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/admin/setup – first-time PIN creation
router.post("/setup", async (req, res) => {
    const { pin } = req.body;

    // Validate PIN: must be exactly 4 digits
    if (!pin || !/^\d{4}$/.test(pin)) {
        return res
            .status(400)
            .json({ message: "PIN must be exactly 4 digits" });
    }

    try {
        const existingAdmin = await Admin.findOne();
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already set up" });
        }

        // Hash the PIN
        const salt = await bcrypt.genSalt(12);
        const pinHash = await bcrypt.hash(pin, salt);

        // Hash the emergency reset code from environment
        const emergencyCode = process.env.EMERGENCY_RESET_CODE;
        if (!emergencyCode) {
            return res
                .status(500)
                .json({ message: "Emergency reset code not configured" });
        }
        const emergencyHash = await bcrypt.hash(emergencyCode, salt);

        await Admin.create({ pinHash, emergencyResetCodeHash: emergencyHash });

        // Generate JWT for immediate admin session
        const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
            expiresIn: "8h"
        });

        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/admin/login – verify PIN and issue JWT
router.post("/login", async (req, res) => {
    const { pin } = req.body;

    if (!pin || !/^\d{4}$/.test(pin)) {
        return res
            .status(400)
            .json({ message: "PIN must be exactly 4 digits" });
    }

    try {
        const admin = await Admin.findOne();
        if (!admin) {
            return res.status(400).json({ message: "Admin not set up" });
        }

        const isMatch = await bcrypt.compare(pin, admin.pinHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid PIN" });
        }

        const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
            expiresIn: "8h"
        });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/admin/reset – emergency reset using developer code
router.post("/reset", async (req, res) => {
    const { emergencyCode } = req.body;

    if (!emergencyCode) {
        return res.status(400).json({ message: "Emergency code required" });
    }

    try {
        const admin = await Admin.findOne();
        if (!admin) {
            return res.status(400).json({ message: "Admin not set up" });
        }

        const isMatch = await bcrypt.compare(
            emergencyCode,
            admin.emergencyResetCodeHash
        );
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid emergency code" });
        }

        // Delete admin document – forces setup on next visit
        await Admin.deleteOne({ _id: admin._id });
        res.json({
            message: "Admin reset successful. Setup required on next visit."
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Protected route example (can be extended later)
router.get("/dashboard", protect, (req, res) => {
    res.json({ message: "Admin dashboard data placeholder" });
});

// PUT /api/admin/change-pin – change admin PIN
router.put("/change-pin", protect, async (req, res) => {
    const { currentPin, newPin } = req.body;

    if (!currentPin || !newPin || !/^\d{4}$/.test(newPin)) {
        return res.status(400).json({
            message: "Current PIN and a valid 4-digit new PIN are required"
        });
    }

    try {
        const admin = await Admin.findOne();
        if (!admin) {
            return res.status(400).json({ message: "Admin not set up" });
        }

        const isMatch = await bcrypt.compare(currentPin, admin.pinHash);
        if (!isMatch) {
            return res
                .status(401)
                .json({ message: "Current PIN is incorrect" });
        }

        const salt = await bcrypt.genSalt(12);
        admin.pinHash = await bcrypt.hash(newPin, salt);
        await admin.save();

        res.json({ message: "PIN updated successfully" });
    } catch (error) {
        console.error("Change PIN error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
