const express = require("express");
const bcrypt = require("bcryptjs");
const AppConfig = require("../models/AppConfig");
const router = express.Router();

// GET /api/app/status – check if app PIN is set up
router.get("/status", async (req, res) => {
    try {
        const config = await AppConfig.findOne();
        res.json({ setupRequired: !config });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/app/setup – first-time PIN creation
router.post("/setup", async (req, res) => {
    const { pin } = req.body;
    if (!pin || !/^\d{4}$/.test(pin)) {
        return res
            .status(400)
            .json({ message: "PIN must be exactly 4 digits" });
    }
    try {
        const existing = await AppConfig.findOne();
        if (existing) {
            return res.status(400).json({ message: "App PIN already set up" });
        }
        const salt = await bcrypt.genSalt(12);
        const pinHash = await bcrypt.hash(pin, salt);
        await AppConfig.create({ pinHash });
        res.status(201).json({ message: "App PIN created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/app/verify – check PIN (does not create session, just returns success/failure)
router.post("/verify", async (req, res) => {
    const { pin } = req.body;
    if (!pin || !/^\d{4}$/.test(pin)) {
        return res
            .status(400)
            .json({ message: "PIN must be exactly 4 digits" });
    }
    try {
        const config = await AppConfig.findOne();
        if (!config) {
            return res.status(400).json({ message: "App PIN not set up" });
        }
        const isMatch = await bcrypt.compare(pin, config.pinHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid PIN" });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
