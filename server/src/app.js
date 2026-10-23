"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pollRoutes_1 = __importDefault(require("./routes/pollRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express_1.default.json({ limit: '100kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', message: 'Poll Voting API is running.' }));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/polls', pollRoutes_1.default);
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));
exports.default = app;
