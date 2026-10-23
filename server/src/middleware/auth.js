"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const header = req.header('Authorization');
    if (!header?.startsWith('Bearer '))
        return res.status(401).json({ message: 'Please log in to perform this action.' });
    try {
        const payload = jsonwebtoken_1.default.verify(header.slice(7), process.env.JWT_SECRET || 'CHANGE_THIS_DEVELOPMENT_SECRET_BEFORE_DEPLOYMENT');
        if (typeof payload.userId !== 'string')
            return res.status(401).json({ message: 'Invalid session. Please log in again.' });
        req.userId = payload.userId;
        return next();
    }
    catch {
        return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
    }
}
