interface GoalContractNotificationPayload {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  goal: {
    title: string;
    successCriteria: string;
    nudges: string[];
    startDate: Date;
    endDate: Date;
  };
  tone: string;
}

export const notificationService = {
  async sendGoalContractNotification(payload: GoalContractNotificationPayload) {
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
