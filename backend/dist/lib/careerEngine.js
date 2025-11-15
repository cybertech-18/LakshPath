"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRoadmapFromCareer = exports.generateCareerMatches = void 0;
const DOMAIN_FIELDS = [
    'Technology & Software',
    'Healthcare & Medicine',
    'Business & Finance',
    'Arts & Design',
    'Engineering',
    'Science & Research',
];
const careerDatabase = [
    {
        title: 'Software Engineer',
        field: 'Technology & Software',
        matchScore: 0,
        description: 'Design, develop and maintain software applications',
        avgSalary: '₹8-15 LPA',
        growthRate: '+25% YoY',
        keySkills: ['Python/Java', 'DSA', 'System Design', 'Git'],
        requiresHigh: ['technical', 'analytical'],
    },
    {
        title: 'Data Scientist',
        field: 'Technology & Software',
        matchScore: 0,
        description: 'Analyze complex data to drive business insights',
        avgSalary: '₹10-20 LPA',
        growthRate: '+30% YoY',
        keySkills: ['Python', 'ML/AI', 'Statistics', 'SQL'],
        requiresHigh: ['analytical', 'technical'],
    },
    {
        title: 'Product Manager',
        field: 'Business & Finance',
        matchScore: 0,
        description: 'Lead product strategy and development',
        avgSalary: '₹12-25 LPA',
        growthRate: '+28% YoY',
        keySkills: ['Product Strategy', 'User Research', 'Agile', 'Analytics'],
        requiresHigh: ['communication', 'analytical', 'creativity'],
    },
    {
        title: 'UX/UI Designer',
        field: 'Arts & Design',
        matchScore: 0,
        description: 'Design intuitive and beautiful user experiences',
        avgSalary: '₹6-12 LPA',
        growthRate: '+22% YoY',
        keySkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
        requiresHigh: ['creativity', 'communication'],
    },
    {
        title: 'Business Analyst',
        field: 'Business & Finance',
        matchScore: 0,
        description: 'Bridge business needs with technical solutions',
        avgSalary: '₹7-14 LPA',
        growthRate: '+20% YoY',
        keySkills: ['SQL', 'Excel', 'Power BI', 'Business Strategy'],
        requiresHigh: ['analytical', 'communication'],
    },
    {
        title: 'Healthcare Professional',
        field: 'Healthcare & Medicine',
        matchScore: 0,
        description: 'Provide medical care and health services',
        avgSalary: '₹6-15 LPA',
        growthRate: '+18% YoY',
        keySkills: ['Medical Knowledge', 'Patient Care', 'Diagnostics', 'Empathy'],
        requiresHigh: ['communication'],
    },
    {
        title: 'Mechanical Engineer',
        field: 'Engineering',
        matchScore: 0,
        description: 'Design and analyze mechanical systems and sustainable products',
        avgSalary: '₹7-13 LPA',
        growthRate: '+16% YoY',
        keySkills: ['CAD', 'Thermodynamics', 'Manufacturing', 'Project Management'],
        requiresHigh: ['technical', 'analytical'],
    },
    {
        title: 'Civil Infrastructure Engineer',
        field: 'Engineering',
        matchScore: 0,
        description: 'Plan and oversee construction of transport and smart-city infrastructure',
        avgSalary: '₹6-12 LPA',
        growthRate: '+14% YoY',
        keySkills: ['Structural Analysis', 'AutoCAD', 'Project Planning', 'Site Management'],
        requiresHigh: ['analytical', 'communication'],
    },
    {
        title: 'Research Scientist',
        field: 'Science & Research',
        matchScore: 0,
        description: 'Conduct experiments to advance scientific knowledge',
        avgSalary: '₹8-18 LPA',
        growthRate: '+20% YoY',
        keySkills: ['Experimental Design', 'Data Analysis', 'Scientific Writing', 'Lab Techniques'],
        requiresHigh: ['analytical', 'technical'],
    },
    {
        title: 'Biotech Researcher',
        field: 'Science & Research',
        matchScore: 0,
        description: 'Develop biotechnological solutions for healthcare and industry',
        avgSalary: '₹9-16 LPA',
        growthRate: '+21% YoY',
        keySkills: ['Molecular Biology', 'Bioinformatics', 'Lab Automation', 'Regulatory Compliance'],
        requiresHigh: ['technical', 'creativity'],
    },
];
const parseAnswers = (answers) => {
    const domainInterestScores = DOMAIN_FIELDS.reduce((acc, field, index) => {
        const id = (11 + index).toString();
        acc[field] = Number(answers[id] ?? 3);
        return acc;
    }, {});
    const topDomain = Object.entries(domainInterestScores).sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
        educationLevel: answers['1'] || 'Undergraduate',
        fieldInterest: answers['2'] || topDomain || 'Technology & Software',
        technicalSkill: Number(answers['3'] ?? 3),
        communicationSkill: Number(answers['4'] ?? 3),
        motivation: answers['5'] || 'Career Growth & Learning',
        workEnvironment: answers['6'] || 'Hybrid (Mix of both)',
        analyticalSkill: Number(answers['7'] ?? 3),
        workStyle: answers['8'] || 'Both Equally (Adaptable)',
        creativitySkill: Number(answers['9'] ?? 3),
        salaryExpectation: answers['10'] || '8-12 LPA',
        domainInterestScores,
    };
};
const generateCareerMatches = (answers) => {
    const parsed = parseAnswers(answers);
    const topCareers = careerDatabase
        .map((career) => {
        let score = 0;
        const domainPreference = parsed.domainInterestScores[career.field] ?? 3;
        score += (domainPreference / 5) * 35;
        if (parsed.fieldInterest === career.field) {
            score += 10;
        }
        const technicalMatch = Math.max(0, 1 - Math.abs(parsed.technicalSkill - careerRequires(career, 'technical')) / 5) * 15;
        const communicationMatch = Math.max(0, 1 - Math.abs(parsed.communicationSkill - careerRequires(career, 'communication')) / 5) * 15;
        const analyticalMatch = Math.max(0, 1 - Math.abs(parsed.analyticalSkill - careerRequires(career, 'analytical')) / 5) * 15;
        const creativityMatch = Math.max(0, 1 - Math.abs(parsed.creativitySkill - careerRequires(career, 'creativity')) / 5) * 15;
        score += technicalMatch + communicationMatch + analyticalMatch + creativityMatch;
        if (parsed.technicalSkill >= careerRequires(career, 'technical') &&
            parsed.communicationSkill >= careerRequires(career, 'communication') &&
            parsed.analyticalSkill >= careerRequires(career, 'analytical') &&
            parsed.creativitySkill >= careerRequires(career, 'creativity')) {
            score += 10;
        }
        return { ...career, matchScore: Math.round(score) };
    })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
    return { parsed, topCareers };
};
exports.generateCareerMatches = generateCareerMatches;
const careerRequires = (career, category) => {
    if (!career.requiresHigh.includes(category)) {
        return 2;
    }
    switch (category) {
        case 'technical':
            return 4;
        case 'communication':
            return 4;
        case 'analytical':
            return 4;
        case 'creativity':
            return 4;
        default:
            return 3;
    }
};
const buildRoadmapFromCareer = (career) => {
    const milestones = [
        {
            title: 'Foundation Building',
            description: `Master the fundamentals needed for ${career.title}`,
            duration: '6 weeks',
            status: 'IN_PROGRESS',
            resources: [
                { title: `${career.keySkills[0]} Basics`, platform: 'YouTube', link: 'https://youtube.com' },
                { title: `Introduction to ${career.field}`, platform: 'Coursera', link: 'https://coursera.org' },
            ],
        },
        {
            title: 'Core Skills Development',
            description: `Deep dive into ${career.keySkills.slice(0, 2).join(' and ')}`,
            duration: '10 weeks',
            status: 'PENDING',
            resources: [
                { title: `${career.keySkills[0]} Complete Course`, platform: 'Udemy', link: 'https://udemy.com' },
                { title: `${career.keySkills[1]} Masterclass`, platform: 'Coursera', link: 'https://coursera.org' },
            ],
        },
        {
            title: 'Advanced Topics',
            description: `Learn ${career.keySkills.slice(2).join(', ')} and best practices`,
            duration: '8 weeks',
            status: 'PENDING',
            resources: [
                { title: `Advanced ${career.keySkills[2] ?? career.keySkills[0]}`, platform: 'Udemy', link: 'https://udemy.com' },
                { title: 'Industry Best Practices', platform: 'LinkedIn Learning', link: 'https://linkedin.com/learning' },
            ],
        },
        {
            title: 'Real-world Projects',
            description: 'Build portfolio projects and gain practical experience',
            duration: '6 weeks',
            status: 'PENDING',
            resources: [
                { title: 'Capstone Project', platform: 'GitHub', link: 'https://github.com' },
                { title: 'Industry Mentorship', platform: 'LakshPath', link: '/' },
            ],
        },
    ];
    return {
        title: `${career.title} Learning Path`,
        duration: '6 months',
        milestones,
    };
};
exports.buildRoadmapFromCareer = buildRoadmapFromCareer;
