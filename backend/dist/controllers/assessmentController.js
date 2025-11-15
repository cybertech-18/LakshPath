"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMicroTasks = exports.getMyLatestAssessment = exports.getLatestAssessment = exports.submitAssessment = void 0;
const assessmentService_1 = require("../services/assessmentService");
const submitAssessment = async (req, res, next) => {
    try {
        const result = await assessmentService_1.assessmentService.submitAssessment(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.submitAssessment = submitAssessment;
const getLatestAssessment = async (req, res, next) => {
    try {
        const userId = (req.params.userId || req.query.userId);
        const result = await assessmentService_1.assessmentService.getLatestForUser(userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getLatestAssessment = getLatestAssessment;
const getMyLatestAssessment = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const result = await assessmentService_1.assessmentService.getLatestForUser(userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getMyLatestAssessment = getMyLatestAssessment;
const generateMicroTasks = async (req, res, next) => {
    try {
        const userId = (req.params.userId || req.body.userId);
        const result = await assessmentService_1.assessmentService.generateMicroTasks(userId);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.generateMicroTasks = generateMicroTasks;
