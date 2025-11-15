"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
exports.notificationService = {
    async sendGoalContractNotification(payload) {
        const channel = payload.user.email ? 'email' : 'sms';
        const preview = {
            to: payload.user.email ?? payload.user.id,
            channel,
            subject: `SMART goal ready: ${payload.goal.title}`,
            body: `${payload.tone}\n\nSuccess Criteria: ${payload.goal.successCriteria}\n\nNudges:\n- ${payload.goal.nudges.join('\n- ')}`,
        };
        console.info('[Notification] goal contract dispatch', preview);
    },
};
