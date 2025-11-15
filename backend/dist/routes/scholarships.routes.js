"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scholarshipService_1 = require("../services/scholarshipService");
const router = (0, express_1.Router)();
router.get('/', (_req, res) => {
    res.json({ scholarships: scholarshipService_1.scholarshipService.list() });
});
exports.default = router;
