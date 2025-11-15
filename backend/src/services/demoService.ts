import { assessmentService } from './assessmentService';

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

export const demoService = {
  async runDemo() {
    const result = await assessmentService.submitAssessment({
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
