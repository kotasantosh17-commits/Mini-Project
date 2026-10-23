"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const Poll_1 = __importDefault(require("../models/Poll"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/polls — return all polls, newest first.
router.get('/', async (_req, res) => {
    try {
        const polls = await Poll_1.default.find().sort({ createdAt: -1 });
        res.json(polls);
    }
    catch {
        res.status(500).json({ message: 'Could not load polls.' });
    }
});
// POST /api/polls — create a poll.
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const question = typeof req.body.question === 'string' ? req.body.question.trim() : '';
        const rawOptions = Array.isArray(req.body.options) ? req.body.options : [];
        const options = rawOptions
            .filter((option) => typeof option === 'string')
            .map((option) => option.trim())
            .filter((option) => option.length > 0);
        if (question.length < 5 || question.length > 200) {
            return res.status(400).json({ message: 'Question must be between 5 and 200 characters.' });
        }
        if (options.length < 2 || options.length > 6) {
            return res.status(400).json({ message: 'Add between 2 and 6 non-empty options.' });
        }
        if (options.some((option) => option.length > 100)) {
            return res.status(400).json({ message: 'Each option must be 100 characters or fewer.' });
        }
        const normalized = options.map((option) => option.toLowerCase());
        if (new Set(normalized).size !== normalized.length) {
            return res.status(400).json({ message: 'Options must not be duplicates.' });
        }
        const poll = await Poll_1.default.create({ question, options: options.map((text) => ({ text, voterIds: [] })) });
        return res.status(201).json(poll);
    }
    catch {
        return res.status(500).json({ message: 'Could not create poll.' });
    }
});
// POST /api/polls/:pollId/vote — cast one vote per voter ID per poll.
router.post('/:pollId/vote', async (req, res) => {
    try {
        const { pollId } = req.params;
        const { optionId, voterId } = req.body;
        if (!mongoose_1.default.isValidObjectId(pollId)) {
            return res.status(400).json({ message: 'Invalid poll ID.' });
        }
        if (typeof voterId !== 'string' || voterId.length < 8 || voterId.length > 100) {
            return res.status(400).json({ message: 'A valid voter ID is required.' });
        }
        if (typeof optionId !== 'string' || !mongoose_1.default.isValidObjectId(optionId)) {
            return res.status(400).json({ message: 'A valid option ID is required.' });
        }
        const poll = await Poll_1.default.findById(pollId);
        if (!poll)
            return res.status(404).json({ message: 'Poll not found.' });
        const alreadyVoted = poll.options.some((option) => option.voterIds.includes(voterId));
        if (alreadyVoted)
            return res.status(409).json({ message: 'You have already voted in this poll.' });
        const selectedOption = poll.options.find((option) => option._id?.toString() === optionId);
        if (!selectedOption)
            return res.status(404).json({ message: 'Option not found in this poll.' });
        selectedOption.voterIds.push(voterId);
        await poll.save();
        return res.json(poll);
    }
    catch {
        return res.status(500).json({ message: 'Could not record vote.' });
    }
});
// DELETE /api/polls/:pollId — delete a poll (demo project; no admin authentication).
router.delete('/:pollId', auth_1.requireAuth, async (req, res) => {
    try {
        if (!mongoose_1.default.isValidObjectId(req.params.pollId)) {
            return res.status(400).json({ message: 'Invalid poll ID.' });
        }
        const deleted = await Poll_1.default.findByIdAndDelete(req.params.pollId);
        if (!deleted)
            return res.status(404).json({ message: 'Poll not found.' });
        return res.json({ message: 'Poll deleted successfully.' });
    }
    catch {
        return res.status(500).json({ message: 'Could not delete poll.' });
    }
});
exports.default = router;
