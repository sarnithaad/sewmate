const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "Sharnitha@2003";

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.shopkeeperId = decoded.id;
        next();
    } catch (err) {
        const message =
            err.name === "TokenExpiredError"
                ? "Token expired. Please log in again."
                : "Invalid token. Authentication failed.";
        return res.status(401).json({ error: message });
    }
}

module.exports = authenticate;
