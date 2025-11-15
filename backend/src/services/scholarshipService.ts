const scholarships = [
  {
    id: 'sch-1',
    title: 'Women in Tech Fellowship',
    deadline: 'Dec 10, 2025',
    amount: '₹1,00,000',
    summary: 'Supports female-identifying students pursuing software careers.',
    pitch: 'Highlight your leadership in coding clubs and community impact.',
  },
  {
    id: 'sch-2',
    title: 'Cybersecurity Challenge Grant',
    deadline: 'Jan 5, 2026',
    amount: '₹75,000',
    summary: 'Funding for students building security tools or research.',
    pitch: 'Mention your interest in blue-team roles and hands-on labs.',
  },
];

export const scholarshipService = {
  list() {
    return scholarships;
  },
};
