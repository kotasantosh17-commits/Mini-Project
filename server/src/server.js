"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
async function startServer() {
    if (!MONGODB_URI)
        throw new Error('MONGODB_URI is missing from server/.env');
    await mongoose_1.default.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    app_1.default.listen(PORT, () => console.log(`API server running at http://localhost:${PORT}`));
}
startServer().catch((error) => {
    console.error('Could not start server:', error);
    process.exit(1);
});
