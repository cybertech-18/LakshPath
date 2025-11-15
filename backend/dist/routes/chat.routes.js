"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatService_1 = require("../services/chatService");
const router = (0, express_1.Router)();
router.post('/mentor', async (req, res, next) => {
    try {
        const reply = await chatService_1.chatService.mentorRound({
            userId: req.body.userId,
            round: req.body.round ?? 'career',
            message: req.body.message,
            context: req.body.context,
        });
        res.json({ reply });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
