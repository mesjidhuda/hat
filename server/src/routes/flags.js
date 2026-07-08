const express = require("express");
const Flag = require("../models/Flag");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect);

// GET /api/flags – unresolved flags, populated with student and class names
router.get("/", async (req, res) => {
    try {
        const flags = await Flag.find({ resolved: false })
            .populate({
                path: "student",
                select: "name class",
                populate: { path: "class", select: "name" }
            })
            .sort({ dateFlagged: -1 });
        res.json(flags);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// PUT /api/flags/:id/resolve – mark flag as resolved
router.put("/:id/resolve", async (req, res) => {
    try {
        const flag = await Flag.findById(req.params.id);
        if (!flag) return res.status(404).json({ message: "Flag not found" });
        flag.resolved = true;
        flag.resolvedDate = new Date();
        await flag.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
