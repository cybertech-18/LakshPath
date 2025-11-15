"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoService = void 0;
const assessmentService_1 = require("./assessmentService");
const demoAnswers = {
    '1': 'Undergraduate',
    '2': 'Technology & Software',
    '3': 4,
    '4': 4,
    '5': 'Career Growth & Learning',
    '6': 'Hybrid (Mix of both)',
    '7': 5,
    '8': 'Both Equally (Adaptable)',
    '9': 4,
    '10': '8-12 LPA',
};
exports.demoService = {
    async runDemo() {
        const result = await assessmentService_1.assessmentService.submitAssessment({
            user: {
                name: 'Demo Candidate',
                email: `demo+${Date.now()}@lakshpath.ai`,
            },
            answers: demoAnswers,
            demo: true,
        });
        return result;
    },
};
