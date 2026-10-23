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
const cors = require("cors");

app.use(cors({
  origin: process.env.CLIENT_ORIGIN
}));

app.use(express.json());
app.use(express_1.default.json({ limit: '100kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', message: 'Poll Voting API is running.' }));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/polls', pollRoutes_1.default);
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));
exports.default = app;
