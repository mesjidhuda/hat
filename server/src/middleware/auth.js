const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded; // { role: 'admin' }
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ message: "Not authorized, token invalid" });
    }
};

const teacherAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "teacher") {
            return res.status(403).json({ message: "Forbidden" });
        }
        req.teacher = decoded; // { role: 'teacher', classId: '...' }
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ message: "Not authorized, token invalid" });
    }

    // Middleware to ensure teacher's token classId matches route param
};
const verifyClassAccess = (req, res, next) => {
    if (req.teacher.classId !== req.params.classId) {
        return res.status(403).json({ message: "Forbidden: class mismatch" });
    }
    next();
};
module.exports = { protect, teacherAuth, verifyClassAccess };
