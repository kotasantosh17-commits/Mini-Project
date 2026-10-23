"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
const secret = () => process.env.JWT_SECRET || 'CHANGE_THIS_DEVELOPMENT_SECRET_BEFORE_DEPLOYMENT';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
router.post('/register', async (req, res) => {
    try {
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = typeof req.body.password === 'string' ? req.body.password : '';
        if (name.length < 2 || name.length > 50)
            return res.status(400).json({ message: 'Name must be 2–50 characters.' });
        if (!emailPattern.test(email) || email.length > 254)
            return res.status(400).json({ message: 'Enter a valid email address.' });
        if (password.length < 8 || password.length > 72 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
            return res.status(400).json({ message: 'Password must be 8–72 characters and include uppercase, lowercase, and a number.' });
        if (await User_1.default.findOne({ email }))
            return res.status(409).json({ message: 'An account with this email already exists.' });
        const user = await User_1.default.create({ name, email, passwordHash: await bcryptjs_1.default.hash(password, 12) });
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, secret(), { expiresIn: '7d' });
        return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (error) {
        if (error?.code === 11000)
            return res.status(409).json({ message: 'An account with this email already exists.' });
        return res.status(500).json({ message: 'Could not register. Please try again.' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = typeof req.body.password === 'string' ? req.body.password : '';
        if (!emailPattern.test(email) || !password)
            return res.status(400).json({ message: 'Enter a valid email and password.' });
        const user = await User_1.default.findOne({ email });
        if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash)))
            return res.status(401).json({ message: 'Invalid email or password.' });
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, secret(), { expiresIn: '7d' });
        return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    }
    catch {
        return res.status(500).json({ message: 'Could not log in. Please try again.' });
    }
});
exports.default = router;
