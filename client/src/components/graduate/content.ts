export const PROGRAMME_NAME = 'Graduate Next-Phase Clarity Programme';

/** The questions participants often bring; selecting them pre-fills the registration form. */
export const QUESTIONS = [
  { id: 'career-path', text: 'What career path should I pursue?' },
  { id: 'opportunities', text: 'How do I identify opportunities that align with my strengths?' },
  { id: 'skills', text: 'What skills do I need to develop?' },
  { id: 'job-market', text: 'How do I prepare myself for the job market?' },
  { id: 'ideas-to-action', text: 'How can I turn my ideas into meaningful action?' },
  { id: 'where-to-begin', text: 'Where do I even begin?' },
] as const;

export type QuestionId = (typeof QUESTIONS)[number]['id'];

export const APPROACH = [
  { title: 'Understand where you are', body: 'Assess your current strengths, challenges, readiness and development needs.' },
  { title: 'Identify where you want to go', body: 'Explore your direction, career interests and the opportunities that fit you.' },
  { title: 'Take practical steps', body: 'Turn your goals into an action plan, with weekly accountability to follow it through.' },
];

export const PILLARS = ['Personal reflection', 'Career exploration', 'Individual coaching', 'Accountability'];

export const INCLUDED: { title: string; body: string; note?: string }[] = [
  {
    title: 'Graduate Next-Phase Assessment',
    body: 'A structured assessment that helps you evaluate your current strengths, challenges, readiness and development needs.',
  },
  {
    title: 'One-on-one assessment debrief',
    body: 'A personal conversation to review your results, identify key gaps and set your development priorities.',
  },
  {
    title: 'Purpose and career-clarity session',
    body: 'A guided coaching session to explore your personal direction, career interests and opportunities for meaningful growth.',
  },
  {
    title: 'Purpose-Alignment Workbook',
    body: 'A practical workbook to help you reflect, record insights, set goals and make intentional decisions.',
  },
  {
    title: 'CV and opportunity review',
    body: 'Support with reviewing your career readiness, finding relevant opportunities and presenting your skills and experience well.',
  },
  {
    title: 'Personal action plan and accountability',
    body: 'A tailored 30-day action plan with weekly accountability, to help you turn your goals into practical steps.',
    note: 'The 30-day plan is one of the programme’s resources. It is not the length of the programme.',
  },
];

export const STAGES = [
  { id: 'final-year', label: 'Final-year university student' },
  { id: 'recent-graduate', label: 'Recent graduate' },
  { id: 'other', label: 'Other' },
] as const;

export const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Canada'];

export const FAQS = [
  {
    q: 'Who can participate?',
    a: 'Final-year university students and recent graduates who want guidance in preparing for their next phase.',
  },
  {
    q: 'Is this only for graduates seeking employment?',
    a: 'No. The programme also supports participants exploring entrepreneurship, further education, skills development or other meaningful pathways.',
  },
  {
    q: 'Will I receive personalised support?',
    a: 'Yes. The programme includes individual assessment, coaching, planning and accountability.',
  },
  {
    q: 'Will the programme guarantee me a job?',
    a: 'No. The programme focuses on building clarity, readiness, relevant skills and the capacity to pursue opportunities intentionally.',
  },
  {
    q: 'How can I join?',
    a: 'Select Apply now at the top of this page, or scroll to the registration form. Fill in your details, then send them to us on WhatsApp to complete your application.',
  },
];
